<?php

class Debugger extends model_app_api_import
{
    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    private function checkDuplicates($table, $fields, &$report)
    {
        foreach ($fields as $field) {
            $duplicatedItems = $this->parent->query("SELECT BINARY $field, COUNT(*) AS count FROM $table GROUP BY BINARY $field HAVING COUNT(*) > 1");

            if ($duplicatedItems) {
                foreach ($duplicatedItems as $k => $v) {
                    $r = $this->parent->getJsonModel($table, [$field => $v, 'active' => 1], false);
                    foreach ($r as $k2 => $v2) {
                        $r[$k2] = ['id' => $v2['id'], $field => $v2[$field]];
                    }
                    $report['duplicates'][$table][$field][$v["BINARY $field"]] = $r;
                }
            }
        }
    }

    private function checkCombinedDuplicates($table, $fields, &$report)
    {
        $combinedFields = join(', ', $fields);
        $binaryCombinedFields = "BINARY CONCAT($combinedFields)";
        $duplicatedItems = $this->parent->query("SELECT $binaryCombinedFields as 'combField', COUNT(*) AS count FROM $table GROUP BY $binaryCombinedFields HAVING COUNT(*) > 1");

        if ($duplicatedItems) {
            foreach ($duplicatedItems as $k => $v) {
                $searchCondition = ['active' => 1];
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

    public function import()
    {
        $report = [];

        $this->checkDuplicates('interviews', ['incite_id', 'label'], $report);
        $this->checkDuplicates('sessions', ['incite_id'], $report);
        $this->checkCombinedDuplicates('narrators', ['name', 'surname'], $report);

        return $report;
    }
}