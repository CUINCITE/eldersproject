<?php

class FilesImporter extends model_app_api_import
{
    public function __construct($parent, $settings)
    {
        parent::__construct($parent, $settings);
    }

    public function import()
    {

        // get files
        $dir = $_SERVER['DOCUMENT_ROOT'] . '/_data/_files';
        $files = [];
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
        foreach ($iterator as $file) {
            if ($file->isDir()) continue;
            $path = $files[] = $file->getPathname();
        }

        //get sessions
        $copy = [];
        $items = $this->parent->getJsonModel('sessions', [], false, null, null, ['fields' => ['id', 'uid', 'filename_mp3', 'filename_docx', 'audio', 'doc']]);
        foreach ($items as $k => $v) {
            if (!$v['uid']) {
                $v['uid'] = uniqid();
                $this->parent->putJsonModel('sessions', ['uid' => $v['uid']], ['id' => $v['id']]);
            }
            if ($v['filename_mp3']) {
                $copy[] = [
                    $v['filename_mp3'], '/public/upload/sessions/audio/' . $v['uid'] . '.mp3'
                ];
            }
            if ($v['filename_docx']) {
                $copy[] = [
                    $v['filename_docx'], '/public/upload/sessions/transcripts/' . $v['uid'] . '.docx'
                ];
            }
        }
        $c = 0;

        foreach ($copy as $k => $v) {
            $found = false;
            foreach ($files as $kk => $vv)
                if (strpos($vv, $v[0])) {
                    $found = true;
                    $from = $vv;
                    $to = $_SERVER['DOCUMENT_ROOT'] . $v[1];
                    $s1 = @filesize($from);
                    if (!$s1) return ['result' => false, 'message' => 'file not found ' . $from];
                    $s2 = @filesize($to);
                    if ($s1 != $s2) {
                        @unlink($to);
                        $r = @copy($from, $to);
                        if (!$r) return ['result' => false, 'message' => 'Copy failed copied: ' . $from . ' -> ' . $to];
                        $c++;
                    }
                }
        }
        return ['result' => true, 'message' => 'Files copied: ' . $c];
    }
}
