<?php

/**
 * This class expands and updates the content of articles used across various modules (events, scenarios etc.)
 */

class model_app_pages_article
{
    /**
     * Constructor
     * @param array $parent
     * @param array $settings
     * @return array updated article
     */

    function __construct($parent, $settings = null)
    {
        /**
         * Instance of model_app_pages class
         */
        $this->parent = $parent;

        /**
         * Property that is used to store optional configuration
         */
        $this->settings = $settings;
    }

    /**
     * Method that updates the raw content of an article with new formatting and corresponding media (if applicable)
     * @param string $text
     * @param array $media
     * @param string $lead
     * @return array updated article
     */
    public function convert($text, &$media, $lead = null)
    {

        if (_uho_fx::getGet('debug')) {
            echo('<!-- ');
            print_r($media);
            echo(' -->');
        }

        if (!$media) $media = [];

        // images

        $text = str_replace('<img src="/serdelia/public/ckeditor/plugins/uho_media/icons/uho_media.png" />', '[IMAGE]', $text);
        $text = str_replace('<img src="/serdelia/public/ckeditor/plugins/uho_audio/icons/uho_audio.png" />', '[AUDIO]', $text);
        $text = str_replace('<img src="/serdelia/public/ckeditor/plugins/uho_video/icons/uho_video.png" />', '[VIDEO]', $text);

        // splitter

        $text = str_replace('<p>[', '[', $text);
        $text = str_replace(']</p>', ']', $text);

        $m = [];
        $max = 100;
        $nr = 0;

        while (strpos($text, '[IMAGE][IMAGE]'))
            $text = str_replace('[IMAGE][IMAGE]', '[SLIDER][SLIDER]', $text);
        while (strpos($text, '[SLIDER][IMAGE]'))
            $text = str_replace('[SLIDER][IMAGE]', '[SLIDER][SLIDER]', $text);

        $blocks = [
            ['html' => '[IMAGE]', 'type' => 'image'],
            ['html' => '[SLIDER]', 'type' => 'slider'],
//            ['html' => '[AUDIO]', 'type' => 'audio'],
//            ['html' => '[VIDEO]', 'type' => 'video'],
            ['html' => '[MORE]', 'html_close' => '[ENDMORE]', 'type' => 'expand_open'],
//            ['html' => '[ENDMORE]', 'type' => 'expand_close'],
            ['html' => '<blockquote>', 'html_close' => '</blockquote>', 'type' => 'area'],
        ];

        $iExpand = 0;

        while ($max > 0) {

            $min = -1;
            $block = null;
            $id = 1;
            foreach ($blocks as $k => $v)
                if (strpos(' ' . $text, $v['html']) && ($min == -1 || strpos(' ' . $text, $v['html']) < $min)) {
                    $min = strpos(' ' . $text, $v['html']);
                    $block = $v;
                }


            if ($min >= 0) {

                $i1 = strpos($text, $block['html']);

                if ($i1 > 0) {
                    $m[] = ['type' => 'html', 'value' => trim(substr($text, 0, $i1 - 1))];
                    $text = substr($text, $i1);
                }

                switch ($block['type']) {

                    case "expand_open":
                        $i2 = strpos($text, $block['html_close']);
                        $value = substr($text, strlen($block['html']), $i2 - strlen($block['html']));
                        $m[] = ['type' => 'read_more', 'value' => ['text' => trim($value)], 'id' => $id];

                        if (!$i2) $i2 = strlen($text) - 1;
                        $text = substr($text, $i2 + strlen($block['html_close']));
                        $text = trim($text);
                        $text = _uho_fx::trim($text, '<br />');
                        $id++;
                        break;

//                    case "expand_close":
//                        $m[] = ['type' => 'expand_close', 'value' => $iExpand];
//                        $text = substr($text, strlen("[ENDMORE]"));
//                        break;

                    case "clip":

                        $i2 = strpos($text, $block['html_close']);
                        $value = substr($text, strlen($block['html']), $i2 - strlen($block['html']));
                        if ($value) $value = $this->parent->getJsonModel('clips', ['active' => 1, 'id' => $value], true);
                        if ($value) {
                            $value = $this->updateClip($value);
                            $m[] = ['type' => 'clip', 'value' => $value];
                        }

                        if (!$i2) $i2 = strlen($text) - 1;
                        $text = substr($text, $i2 + strlen($block['html_close']));
                        $text = trim($text);

                        break;

                    case "clips":

                        $i2 = strpos($text, $block['html_close']);
                        $value = substr($text, strlen($block['html']), $i2 - strlen($block['html']));
                        if ($value) $value = explode(',', $value);
                        if ($value) $value = $this->parent->getJsonModel('clips', ['active' => 1, 'id' => $value]);

                        if ($value) {
                            foreach ($value as $kk => $vv) $value[$kk] = $this->updateClip($vv);
                            $m[] = ['type' => 'clips', 'value' => $value];
                        }


                        if (!$i2) $i2 = strlen($text) - 1;
                        $text = substr($text, $i2 + strlen($block['html_close']));
                        $text = trim($text);

                        break;

                    case "image":
                    case "audio":
                    case "video":
                    case "slider":

                        if ($block['type'] == 'video') $types = ['video', 'youtube', 'vimeo'];
                        elseif ($block['type'] == 'slider') $types = ['image'];
                        else $types = [$block['type']];

                        $found = null;
                        foreach ($types as $kk => $vv) {
                            $find = _uho_fx::array_filter($media, 'type', $vv, ['first' => true, 'keys' => true]);
                            if (isset($find) && ($found === null || $find < $found)) $found = $find;
                        }


                        if (isset($found)) {
                            $t = $media[$found]['type'];

                            switch ($t) {
                                case "vimeo":
                                    $mm = $media[$found];

                                    $media[$found]['video'] =
                                        [
                                            "src" => $this->parent->getVimeoSource($mm['vimeo_sources'], 1280),
                                            'duration' => $mm['duration'],
                                            "srcMobile" => $this->parent->getVimeoSource($mm['vimeo_sources'], 640),
                                            "captions" => null
                                        ];

                                    break;
                            }

                            if ($block['type'] == 'slider') {
                                $mc = count($m);
                                if ($mc > 0 && $m[$mc - 1]['type'] == 'slider')
                                    $m[$mc - 1]['value'][] = $media[$found];
                                else $m[] = ['type' => 'slider', 'value' => [$media[$found]]];
                            } else {
                                $m[] = ['type' => $t, 'value' => $media[$found]];
                            }
                            unset($media[$found]);
                        } else {
                            /*echo ('<!-- not-found ');
                            print_r($types);
                            echo (' -->');*/
                        }
                        $i2 = strpos($text, ']');
                        $text = substr($text, $i2 + 1);
                        $text = trim($text);
                        $text = _uho_fx::trim($text, '<br />');

                        break;


                    case "area":
                        $i2 = strpos($text, $block['html_close']);
                        $value = substr($text, strlen($block['html']), $i2 - strlen($block['html']));
                        $value = explode('<br />', strip_tags($value, '<a><br><button>'));
                        $m[] = ['type' => 'quote', 'value' => ['text' => $value[0], 'author' => @trim($value[1])]];

                        if (!$i2) $i2 = strlen($text) - 1;
                        $text = substr($text, $i2 + strlen($block['html_close']));
                        $text = trim($text);
                        $text = _uho_fx::trim($text, '<br />');
                        break;
                }
            }

            $max--;
        }

        if ($text) $m[] = ['type' => 'html', 'value' => $text];

        return $m;
    }

    private function updateClip($item)
    {
        $sessions = $this->parent->getJsonModel('sessions', ['parent' => $item['interview']['id'], 'active' => 1], 'false', 'nr');
        $nr = 0;
        $t = 0;
        if ($sessions) {
            while ($item['time_from'] < ($t + $sessions[$nr]['duration']) && ($nr + 1) < count($sessions)) {
                $t += $sessions[$nr]['duration'];
                $nr++;
            }
            $session = $sessions[$nr];
            // $item['image']=$session['image'];
        }
        $item['saved'] = $this->parent->favGet('c' . $item['id']);
        $item['url_fav'] = ['type' => 'clip_fav', 'id' => $item['id']];
        $item['video'] = [
            "src" => @$this->parent->getVimeoSource($session['vimeo_source'], 1280),
            'start' => $t + $item['time_from'],
            'duration' => $item['time_to'] - $item['time_from'],
            "srcMobile" => $this->parent->getVimeoSource(@$session['vimeo_source'], 640),
            "captions" => @$session['subtitles']['src']
        ];
        //print_r($item);exit();
        return $item;

        //time_from

    }
}
