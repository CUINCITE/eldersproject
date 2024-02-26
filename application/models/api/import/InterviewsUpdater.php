<?php

class InterviewsUpdater extends model_app_api_import
{
    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {
        $interviews = $this->parent->getJsonModel('interviews_full');

        $count = 0;
        foreach ($interviews as $k => $interview) {

            $actions = [];
            if (empty($interview['label_sort'])) $actions[] = 'label_sort';
            if (empty($interview['slug'])) $actions[] = 'slug';
            if (empty($interview['uid'])) $actions[] = 'uid';
            if (empty($interview['interviewer_name'])) $actions[] = 'interviewer_name';
            if (empty($interview['interviewer_name_sort'])) $actions[] = 'interviewer_name_sort';

            if (!$actions) continue;

            $result = [];

            foreach ($actions as $action) {
                $result[$action] = $this->$action($interview)[$action];
            }

            if (empty($result)) continue;

            $r = $this->parent->putJsonModel('interviews_full', $result, ['id' => $interview['id']]);
            if ($r) {
                $count++;
            } else return ['result' => false, 'message' => 'Error updating interview: ' . $this->parent->orm->getLastError()];
        }


        return ['result' => true, 'message' => "Updated Interviews: $count"];
    }

    private function label_sort($item)
    {
        $narrators = [];
        foreach ($item['narrators'] as $k => $v) {
            $sortLabel = $v['surname'] . ' ' . $v['name'];
            $narrators[] = $sortLabel;
        }

        $item['label_sort'] = implode(', ', $narrators);
        return $item;
    }

    private function uid($item)
    {
        $item['uid'] = uniqid();
        return $item;
    }

    private function slug($item)
    {
        $item['slug'] = $this->slugify($item['label']);
        return $item;
    }

    private function interviewer_name($item)
    {
        $interviewers = [];
        foreach ($item['interviewers'] as $k => $v) {
            $sortLabel = $v['label'];
            $interviewers[] = $sortLabel;
        }

        $item['interviewer_name'] = implode(', ', $interviewers);
        return $item;
    }

    private function interviewer_name_sort($item)
    {
        foreach ($item['interviewers'] as $k => $v) {
            $sortLabel = $v['last_name'] . ' ' . $v['first_name'];
            $item['interviewer_name_sort'] = $sortLabel;
            return $item;
        }

    }


}
