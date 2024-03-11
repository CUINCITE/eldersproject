<?php

ini_set('memory_limit','512M');

use Dompdf\Dompdf;

class Debugger extends model_app_api_import
{
    private array $dictionary;

    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
        $this->dictionary = [];
    }

    private function checkDuplicates($table, $fields, &$report)
    {
        foreach ($fields as $field) {
            $duplicatedItems = $this->parent->query("SELECT BINARY $field, COUNT(*) AS count FROM $table GROUP BY BINARY $field HAVING COUNT(*) > 1");

            if ($duplicatedItems) {
                foreach ($duplicatedItems as $k => $v) {
                    $r = $this->parent->getJsonModel($table, [$field => $v, 'active' => 1], false);
                    foreach ($r as $k2 => $v2) {
                        $r[$k2] = ['id' => $v2['id'], $field => $v2[$field], 'label' => $v2['label']];
                    }
                    $report['duplicates'][$table][$field][$v["BINARY $field"]] = $r;
                }
            }
        }
    }

    // checks for duplicates in separated fields, eg narrator's name + surname
    private function checkCombinedDuplicates($table, $fields, &$report)
    {
        $combinedFields = join(', ', $fields);
        $binaryCombinedFields = "BINARY CONCAT($combinedFields)";
        $duplicatedItems = $this->parent->query("SELECT $binaryCombinedFields as 'combField', COUNT(*) AS count FROM $table GROUP BY $binaryCombinedFields HAVING COUNT(*) > 1");

        if ($duplicatedItems) {
            foreach ($duplicatedItems as $k => $v) {
                $searchCondition = [];
                // split the combined fields value
                $fieldValues = explode(', ', $v['combField']);
                for($i = 0; $i < count($fields); $i++) {
                    $searchCondition[$fields[$i]] = $fieldValues[$i];
                }

                $r = $this->parent->getJsonModel($table, $searchCondition, false);
                foreach ($r as $k2 => $v2) {
                    $r[$k2] = array_intersect_key($v2, array_flip(array_merge(['id'], $fields)));
                }
                $report['duplicates'][$table][join(' & ', $fields)][$v['combField']] = $r;
            }
        }
    }
    
    private function checkFiles(&$report)
    {
        $sessions = empty($this->dictionary['sessions']) ? $this->parent->getJsonModel('sessions') : $this->dictionary['sessions'];

        foreach ($sessions as $k=>$v) {
            $dir_mp3 = $_SERVER['DOCUMENT_ROOT'] . '/public/upload/sessions/audio/' . $v['uid'] . '.mp3';
            $dir_docx = $_SERVER['DOCUMENT_ROOT'] . '/public/upload/sessions/transcripts/' . $v['uid'] . '.docx';

            $collection =$v['parent']['interviewers'][0]['label'];

            $item = [
                'label' => $v['parent']['label'],
                'session_incite_id' => $v['incite_id']
            ];

            if (!file_exists($dir_mp3)) {
                $report['missing_files']['mp3'][$collection][] = $item;
            }

            if (!file_exists($dir_docx)) {
                $this->dictionary['missing_transcripts'][] = $v['incite_id'];
                $report['missing_files']['docx'][$collection][] = $item;
            }
        }
    }

    private function checkSessions(&$report)
    {
        $sessions = empty($this->dictionary['sessions']) ? $this->parent->getJsonModel('sessions') : $this->dictionary['sessions'];



        foreach ($sessions as $k=>$v) {

            $collection =$v['parent']['interviewers'][0]['label'];

            $item = [
                'label' => $v['parent']['label'],
                'session_incite_id' => $v['incite_id']
            ];

//           if (empty($v['transcript']))  $report['missing_transcript'][$collection][] = $item;
            if (empty($v['transcript_tags']) && !in_array($v['incite_id'], $this->dictionary['missing_transcripts'])) {
                $report['missing_transcript'][$collection][] = $item;
            }
        }
    }

    public function import()
    {
        $report = [];

        $this->checkDuplicates('interviews', ['incite_id', 'label'], $report);
        $this->checkDuplicates('sessions', ['incite_id'], $report);
        $this->checkCombinedDuplicates('narrators', ['name', 'surname'], $report);
        $this->checkFiles($report);
        $this->checkSessions($report);

        if (!empty(_uho_fx::getGet('pdf'))) {

            // Instantiate the Dompdf class
            $dompdf = new Dompdf();

            $data = $report;

            $html = "<h1>Data</h1>" . $this->arrayToTable($data);

            $dompdf->loadHtml($html);

            $dompdf->render();

            $dompdf->stream('filename.pdf', ['Attachment' => true]);
        }

        else return $report;
    }

    private function arrayToTable($data) {
        if (is_array($data)) {
            $str = "<ul>";
            foreach ($data as $key => $value) {
                $str .= "<li><strong>{$key}:</strong> " . $this->arrayToTable($value) . "</li>";
            }
            $str .= "</ul>";
            return $str;
        } else {
            return $data;
        }
    }
}