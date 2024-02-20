<?php

class LocationsImporter extends model_app_api_import
{
    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {
        // 1. Locations
        $count = 0;
        $items = $this->parent->query('SELECT id,locations FROM interviews WHERE locations!=""');
        $states = $this->parent->getJsonModel('s_states');

        foreach ($items as $item) {
            $locations = explode(';', trim($item['locations']));
            $locations[0] = trim($locations[0]);

            if ($locations[0]) {
                $locations = [
                    'narrator_location' => $locations[0],
                    'interviewer_location' => empty($locations[1]) ? $locations[0] : trim($locations[1])
                ];
                $this->parent->putJsonModel('interviews', $locations, ['id' => $item['id']]);
            }
        }

        $interviews = $this->parent->getJsonModel('interviews_list');

        // Assign states
        $count = 0;
        $placesMap = ['Mexico' => 'ME'];

        foreach ($interviews as $interview) {
            if (!$interview['narrator_location']) continue;

            $array = explode(',', $interview['narrator_location']);
            $stateCode = trim(end($array));

            if (count($array) == 1) {
                $array = explode(' ', $interview['narrator_location']);
                $stateCode = trim(end($array));
            }

            if ($stateCode && strlen($stateCode) == 2 || isset($placesMap[$stateCode])) {
                if (isset($placesMap[$stateCode])) {
                    $stateCode = $placesMap[$stateCode];
                }
                $matchingStateData = _uho_fx::array_filter($states, 'slug', $stateCode, ['first' => true]);

                if ($matchingStateData) {
                    $updateResult = $this->parent->putJsonModel('interviews', ['narrators_states' => _uho_fx::dozeruj($matchingStateData['id'], 8)], ['id' => $interview['id']]);
                    if (!$updateResult) {
                        return ['result' => false, 'message' => $this->parent->orm->getLastError()];
                    }
                    $count++;
                } else {
                    return ['result' => false, 'message' => 'Unknown location: ' . $interview['narrator_location']];
                }
            }
        }

        // Part two: Process States
        foreach ($states as $state) {
            $activeInterviewCount = $this->parent->query("SELECT id FROM interviews WHERE narrators_states LIKE '%". _uho_fx::dozeruj($state['id'], 8)."%';");
            $activeInterviewCount = count($activeInterviewCount);

            $updateResult = $this->parent->putJsonModel('s_states', ['count_interviews' => $activeInterviewCount], ['id' => $state['id']]);
            if (!$updateResult) {
                return ['result' => false, 'message' => $this->parent->orm->getLastError()];
            }
        }

        return ['result' => true, 'message' => 'Updated interviews: ' . $count];
    }
}