<?php

require_once('vendor/autoload.php');
use Maestroerror\HeicToJpg;

class MementosImporter extends model_app_api_import
{

    private bool $overwriteImages = false;

    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {
        set_time_limit(60);
        $directory = $_SERVER['DOCUMENT_ROOT'] . '/_data/_csv/mementos';
        $files = scandir($directory);

        $resultArray = [];

        foreach($files as $file) {
            if($file == ".." || $file == ".") continue;

            $fullFilePath = $directory . '/' . $file;

            if(pathinfo($fullFilePath, PATHINFO_EXTENSION) == 'csv') {
                $items = _uho_fx::loadCsv($fullFilePath, ',');

                $resultArray[] = [
                    'file' => $file,
                    'result' =>  $this->importMedia($items)
                ];

            }
        }

        return $resultArray;


    }

    private function importMedia(?array $items)
    {
        $items_count = 0;

        $alreadyUploadedFilenames = [];

        foreach ($items as $k => $v) {
            $id = $v['Interview ID'];
            $interview = $this->parent->getJsonModel('interviews', ['incite_id' => $id], true);

            if (!$interview) return ['message' => 'Interview not found: ' . $id];

            // remove old items
            if (!empty($interview['media'])) {
                foreach ($interview['media'] as $k2 => $media_item) {

                    if (!$this->overwriteImages) {
                        $alreadyUploadedFilenames[] = $media_item['filename_original'];
                        continue;
                    }

                    if (!empty($media_item['id']) && is_numeric($media_item['id'])) {
                        $this->parent->deleteJsonModel('media', ['id' => $media_item['id']]);
                    } else {
                        return ['message' => 'Cannot remove media item: ' . $media_item['id']];
                    }


                    foreach ($media_item['image'] as $k3 => $image_size) {
                        $file = $_SERVER['DOCUMENT_ROOT'] . $image_size;
                        $file = parse_url($file, PHP_URL_PATH);
                        if (is_file($file)) {
                            unlink($file);
                        }
                    }
                }
            }

        }

        $skippedItems = 0;
        $filesNotFound = [];
        $itemsNotFound = 0;

        foreach ($items as $k => $v) {

            if(!$this->overwriteImages && in_array($v['Filename'], $alreadyUploadedFilenames)) {
                $skippedItems++;
                continue;
            }

            $id = $v['Interview ID'];
            $interview = $this->parent->getJsonModel('interviews', ['incite_id' => $id], true);
            // add new items
            $uid = uniqid();

            $descriptionField = empty($v['Description']) ? $v['Decription'] : $v['Description'];

            $item = [
                'type' => 'image',
                'caption' => $descriptionField,
                'alt' => $v['Alt text'],
                'uid' => $uid,
                'model_id' => $interview['id'],
                'model' => 'interviews',
                'filename_original' => $v['Filename']
            ];

            $oldFile = $_SERVER['DOCUMENT_ROOT'] . '/_data/_mementos/' . $v['Filename'];
            $ext = pathinfo($oldFile, PATHINFO_EXTENSION);

            $newFile = $_SERVER['DOCUMENT_ROOT'] . '/public/upload/media/original/' . $uid . '.' . strtolower($ext);

            if (!file_exists($oldFile)) {
                $filesNotFound[] = $v['Filename'];
                $itemsNotFound++;
                continue;
            }


            try {
                if (!copy($oldFile, $newFile)) {
                    throw new Exception('Could not move the file: ' . $v['Filename']);
                }
            } catch (Exception $e) {
                return ['message' => $e->getMessage()];
            }

            if (strtolower($ext) !== "jpg" && file_exists($newFile)) {

                if (strtolower($ext) === "heic") {
                    try {
                        HeicToJpg::convertOnMac($newFile)->saveAs($_SERVER['DOCUMENT_ROOT'] . '/public/upload/media/original/' . $uid . '.jpg');
                        unlink($newFile);
                    } catch (Exception $e) {
                        return ['message' => 'Image conversion to jpg using HeicToJpg not successful: ' . $v['Filename'] . '. Error: ' . $e->getMessage()];
                    }
                } else {
                    $imagick = new Imagick($newFile);
                    $jpgFile = pathinfo($newFile, PATHINFO_DIRNAME) . '/' . pathinfo($newFile, PATHINFO_FILENAME) . '.jpg';

                    try {
                        $imagick->setImageFormat('jpg');
                        $imagick->writeImage($jpgFile);
                    } catch (Exception $e) {
                        return ['message' => 'Image conversion to jpg using Imagick not successful: ' . $v['Filename']];
                    }
                }

            }

            $postSuccess = $this->parent->postJsonModel('media', $item);
            if (!$postSuccess) return ['message' => 'Media Item not succesfully posted: ' . $id];
            $items_count++;


        }

        return ['message' => true, 'itemsImported' => $items_count, 'itemsSkipped' => $skippedItems, 'itemsNotFound' => $itemsNotFound, 'filesNotFound' => $filesNotFound];
    }
}
