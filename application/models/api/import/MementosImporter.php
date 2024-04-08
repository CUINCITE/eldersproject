<?php

/*
    Imports Ephemera Media from XLS created from Google Docs Sheet    
*/

//require_once('vendor/autoload.php');

use Maestroerror\HeicToJpg;
use PhpOffice\PhpSpreadsheet\IOFactory as ExcelIOFactory;

class MementosImporter extends model_app_api_import
{

    private bool $overwriteImages = false;

    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {
        require (__DIR__ . '/../../../library/vendor/autoload.php');

        set_time_limit(512);
        ini_set('memory_limit', '1024M');

        $xls = $_SERVER['DOCUMENT_ROOT'] . '/_data/Ephemera_Mementos.xlsx';
        $spreadsheet = ExcelIOFactory::load($xls);
        $sheets = $spreadsheet->getSheetNames();
        //$sheets=[$sheets[9]];
        $resultArray = [];

        foreach ($sheets as $k => $v) {
            $sheet = $spreadsheet->getSheetByName($v)->toArray();
            $sheet = _uho_fx::convertSpreadsheet($sheet);

            $resultArray[] = [
                'sheet' => $v,
                'result' => $this->importMedia($sheet, $v)
            ];

        }

        // update interviews.status_media
        $this->parent->sql->query('UPDATE interviews,media SET interviews.status_assets=1 WHERE interviews.id=media.model_id && media.model="interviews"');

        /*
            old CSV import
        
        $directory = $_SERVER['DOCUMENT_ROOT'] . '/_data/_mementos/csv';
        $files = scandir($directory);

        $resultArray = [];

        foreach($files as $file) {
            if($file == ".." || $file == ".") continue;

            $fullFilePath = $directory . '/' . $file;

            if(pathinfo($fullFilePath, PATHINFO_EXTENSION) == 'csv') {
                $items = _uho_fx::loadCsv($fullFilePath, ',');

                $resultArray[] = [
                    'file' => $file,
                    'result' =>  $this->importMedia($items, str_replace('.csv', '', $file))
                ];

            }
        }

        */

        return $resultArray;


    }

    private function importMedia($items, $name)
    {

        $dirs = ['Renee Watson' => 'Renée Watson'];

        $new = 0;
        $updated = 0;
        $skipped = 0;
        $intervews_media = [];
        $errors = [];



        // fix missing Interview_ID
        foreach ($items as $k => $v)
            if (empty($v['Interview ID'])) {
                $interview = $this->parent->getJsonModel('interviews', ['interviewer_name' => $name, 'label' => @$v['Narrator name']], true);
                if ($interview)
                    $items[$k]['Interview ID'] = $interview['incite_id'];
            }

        foreach ($items as $k => $v)
            if (!empty($v['Interview ID']) && !empty($v['Filename'])) {
                $id = @$v['Interview ID'];
                $interview = $this->parent->getJsonModel('interviews', ['incite_id' => $id], true);
                if (!$interview)
                    return ['message' => 'Interview not found: ' . $id . ' for ' . $name];

                $directory = $name;
                if (isset($dirs[$name]))
                    $directory = $dirs[$name];
                else
                    $directory = $name;
                $oldFile = $_SERVER['DOCUMENT_ROOT'] . '/_data/_mementos/files/' . $directory . '/' . $v['Filename'];
                $oldFile = str_replace('.pdf', '.jpg', $oldFile); // hot-fix for Denice Frohman

                $ext = strtolower(pathinfo($oldFile, PATHINFO_EXTENSION));

                if (!file_exists($oldFile))
                    $errors[] = 'File not found: ' . $oldFile;
                else {

                    $descriptionField = empty($v['Description']) ? $v['Decription'] : $v['Description'];

                    $item = [
                        'type' => 'image',
                        'caption' => $descriptionField,
                        'alt' => @$v['Alt text'],
                        'model_id' => $interview['id'],
                        'model' => 'interviews',
                        'filename_original' => $v['Filename']
                    ];

                    $exists = _uho_fx::array_filter($interview['media'], 'filename_original', $v['Filename'], ['first' => true]);

                    if ($exists) {
                        $item['uid'] = $exists['uid'];
                        $r = $this->parent->putJsonModel('media', $item, ['id' => $exists['id']]);
                        if (!$r)
                            return ['message' => 'postJsonModel error: ' . $this->parent->orm->getLastError()];
                        $updated++;
                        if (empty($intervews_media[$interview['id']]))
                            $intervews_media[$interview['id']] = [];
                        $intervews_media[$interview['id']][] = $exists['id'];
                    } else {
                        $item['uid'] = uniqid();
                        $r = $this->parent->postJsonModel('media', $item);
                        if (!$r)
                            return ['message' => 'putJsonModel error: ' . $this->parent->orm->getLastError()];
                        if (empty($intervews_media[$interview['id']]))
                            $intervews_media[$interview['id']] = [];
                        $intervews_media[$interview['id']][] = $this->parent->orm->getInsertId();
                        $new++;
                    }



                    $newFile = $_SERVER['DOCUMENT_ROOT'] . '/public/upload/media/original/' . $item['uid'] . '.jpg';

                    if (file_exists($newFile))
                        ;
                    elseif ($ext == "heic") {
                        try {
                            HeicToJpg::convertOnMac($oldFile)->saveAs($newFile);
                        } catch (Exception $e) {
                            return ['message' => 'Image conversion to jpg using HeicToJpg not successful: ' . $v['Filename'] . '. Error: ' . $e->getMessage()];
                        }
                    } else {
                        $imagick = new Imagick($oldFile);

                        try {
                            $imagick->setImageFormat('jpg');
                            $imagick->writeImage($newFile);
                        } catch (Exception $e) {
                            return ['message' => 'Image conversion to jpg using Imagick not successful: ' . $v['Filename']];
                        }

                    }
                }


            } else
                $skipped++;

        // remove non-existing images
        foreach ($intervews_media as $k => $v) {
            $query = 'DELETE FROM media WHERE model="interviews" && model_id=' . $k . ' && id NOT IN (' . implode(',', $v) . ')';
            //$this->parent->sql->queryOut($query);
        }

        return ['new' => $new, 'updated' => $updated, 'skipped' => $skipped, 'errors' => $errors];
    }


    /*
        old Version by Daniel
    private function importMedia(?array $items, $directory)
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

            $oldFile = $_SERVER['DOCUMENT_ROOT'] . '/_data/_mementos/files/' . $directory . '/' . $v['Filename'];
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
    }*/


}
