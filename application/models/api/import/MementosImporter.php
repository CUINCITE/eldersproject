<?php

require_once('vendor/autoload.php');
use Maestroerror\HeicToJpg;

class MementosImporter extends model_app_api_import
{
    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {
        $items = _uho_fx::loadCsv($_SERVER['DOCUMENT_ROOT'] . '/_data/_csv/mementos.csv', ',');

        $items_count = 0;
        foreach ($items as $k => $v) {
            $id = $v['Interview ID'];
            $interview = $this->parent->getJsonModel('interviews', ['incite_id' => $id], true);

            if (!$interview) return ['message' => 'Interview not found: ' . $id];

            // remove old items
            if (!empty($interview['media'])) {
                foreach ($interview['media'] as $k2 => $media_item) {

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

        foreach ($items as $k => $v) {
            $id = $v['Interview ID'];
            $interview = $this->parent->getJsonModel('interviews', ['incite_id' => $id], true);
            // add new items
            $uid = uniqid();

            $item = [
                'type' => 'image',
                'caption' => $v['Description'],
                'alt' => $v['Alt text'],
                'uid' => $uid,
                'model_id' => $interview['id'],
                'model' => 'interviews',
                'filename_original' => $v['Filename']
            ];

            $postSuccess = $this->parent->postJsonModel('media', $item);
            if (!$postSuccess) return ['message' => 'Media Item not succesfully posted: ' . $id];
            $items_count++;

            $oldFile = $_SERVER['DOCUMENT_ROOT'] . '/_data/_mementos/' . $v['Filename'];
            $ext = pathinfo($oldFile, PATHINFO_EXTENSION);

            $newFile = $_SERVER['DOCUMENT_ROOT'] . '/public/upload/media/original/' . $uid . '.' . strtolower($ext);


            if (!copy($oldFile, $newFile)) {
                return ['message' => 'Resize image not successful: ' . $v['Filename']];
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


        }

        return ['message' => 'Import sucessful', 'items' => $items_count];
    }
}
