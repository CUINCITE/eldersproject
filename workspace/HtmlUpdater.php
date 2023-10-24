<?php

class HtmlUpdater
{
    private $html;

    public function __construct($html)
    {
        $this->html = $html;
    }

    public function updateHtml()
    {
        $html = $this->html;

                // favicons
                $favicons_html = (file_exists('../application/views/scaffold/favicons.html')) ? file_get_contents('../application/views/scaffold/favicons.html') : '';
                $what[] = "[[favicons]]";
                $with[] = $favicons_html;
        
                //templates
                $template_files = scandir('../application/views/templates/');
                $template_html = '';
        
                foreach ($template_files as $template_file) {
                    list($filename, $extension) = array_pad(explode('.', $template_file), 2, '');
                    if ($extension=='html'){
                        $template_html .= '<script type="text/twig" id="tmpl-'.$filename.'">';
                        $template_html .= file_get_contents('../application/views/templates/'.$template_file);
                        $template_html .= "</script>\n";
                    }
                }
        
                $html = str_replace('[[templates]]', $template_html, $html);
        
                // scaffold
                $scaffold_pattern = "/\[\[scaffold::([0-9a-z-_]+)\]\]/";
                while ( preg_match($scaffold_pattern, $html, $m)) {
                    $scaffold_file = 'includes/scaffold/'.$m[1].'.html';
                    $scaffold_content = file_exists($scaffold_file) ? file_get_contents($scaffold_file) : '';
                    $html = str_replace( $m[0], $scaffold_content, $html);
                };
        
                // workspace ui
                $ui_pattern = "/\[\[ui::([0-9a-z-_]+)\]\]/";
                while ( preg_match($ui_pattern, $html, $m)) {
                    $ui_file = 'includes/ui/'.$m[1].'.html';
                    $ui_content = file_exists($ui_file) ? file_get_contents($ui_file) : '';
                    $html = str_replace( $m[0], $ui_content, $html);
                };
        
                // all icons
                $icons_pattern = "/\[\[icons::([a-z-]+)\]\]/";
                $icon_dirs = Array( 'inline' => '../src/assets/svg/inline', 'sprite' => '../src/assets/svg/sprite', 'nomin' => '../src/assets/svg/nomin' );
                while (preg_match($icons_pattern, $html, $m)) {
                    $type = $m[1] == 'sprite' ? 'sprite' : 'svg';
                    $dir = $icon_dirs[$m[1]];
                    $icon_files = scandir($dir);
                    $icon_list = '';
        
                    foreach ($icon_files as $icon_file) {
                        list($filename, $extension) = array_pad(explode('.', $icon_file), 2, '');
                        if ($extension === 'svg' && $filename[0] !== '_') {
                            $icon_list .= '<tr class="ui__row"><td class="ui__icon ui__icon--'.$m[1].'"><code>'.$filename.'.svg</code></td><td class="ui__icon ui__icon--'.$m[1].'"><button>[['.$type.'::'.$filename.']]</button></td></tr>';
                        }
                    }
        
                    $html = str_replace( $m[0], $icon_list, $html);
                };
        
                // include parts:
                $include_pattern = "/\[\[include::([0-9a-z-_]+)\]\]/";
                while ( preg_match($include_pattern, $html, $m)) {
                    $inc_file = 'includes/'.$m[1].'.html';
                    $inc_content = file_exists($inc_file) ? file_get_contents($inc_file) : '';
                    $html = str_replace( $m[0], $inc_content, $html);
                };
        
                // components
                $components_pattern = "/\[\[components::([0-9a-z-_]+)\]\]/";
                while ( preg_match($components_pattern, $html, $m)) {
                    $comp_file = 'includes/components/'.$m[1].'.html';
                    $comp_content = file_exists($comp_file) ? file_get_contents($comp_file) : '';
                    $html = str_replace( $m[0], $comp_content, $html);
                };
        
                // partials
                $partials_pattern = "/\[\[partials::([0-9a-z-_]+)\]\]/";
                while ( preg_match($partials_pattern, $html, $m)) {
                    $partial_file = 'includes/partials/'.$m[1].'.html';
                    $partial_content = file_exists($partial_file) ? file_get_contents($partial_file) : '';
                    $html = str_replace( $m[0], $partial_content, $html);
                };
        
                // make svg inline:
                $svg_pattern = "/\[\[svg::([0-9a-z-_]+)\]\]/";
                while ( preg_match($svg_pattern, $html, $m)) {
                    $svg_file = "../application/views/svg/".$m[1].".svg";
                    $svg_content = (file_exists($svg_file)) ? file_get_contents($svg_file) : "";
                    $svg_content = str_replace( '<svg ', '<svg class="svg-'.$m[1].'" ', $svg_content);
                    $html = str_replace( $m[0], $svg_content, $html);
                };
        
                // place sprite icons:
                $pattern = "/\[\[sprite::([a-z0-9-_]+)\]\]/";
                $replacement = '<svg class="sprite-$1"><use xlink:href="#sprite-$1"/></svg>';
                $html = preg_replace($pattern, $replacement, $html);
        
                // include json files:
                $json_pattern = "/\[\[json::([a-z0-9-_]+)\]\]/";
                while ( preg_match($json_pattern, $html, $m)) {
                    $json_file = "../workspace/json/".$m[1].".json";
                    $json_content = (file_exists($json_file)) ? file_get_contents($json_file) : "";
                    $json_content = str_replace( "'", "&apos;", $json_content);
                    $json_array = json_decode($json_content);
                    $json_string = json_encode($json_array);
                    $html = str_replace( $m[0], htmlspecialchars($json_string), $html);
                };
        
                $html = str_replace($what,$with,$html);
        
                // put GET params:
                $get_pattern = "/\[\[get::([a-z0-9-_]+)\]\]/";
                while ( preg_match($get_pattern, $html, $m)) {
                    $param = $m[1];
                    $get = isset($_GET[$param]) ? $_GET[$param] : '';
                    $html = str_replace( $m[0], $get, $html);
                };
        
                return $html;
    }

}