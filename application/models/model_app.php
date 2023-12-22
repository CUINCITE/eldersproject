<?php

require_once(root_path . 'application/_uho/_uho_client.php');

class model_app extends _uho_model
{

    var $class = 'app';
    public $http_server, $client;
    public $serdelia_edit = false;
    public $head_title = 'I See My Light Shining';
    public $is404 = true;
    var $head = array(
        'image' => '/public/og_image.jpg'
    );

    //============================================================================================
    public function checkSerdeliaEdit()
    {
        if (@$_SESSION['serdelia_project']) return true;
    }
    //============================================================================================
    public function init()
    {
        if ($this->checkSerdeliaEdit())
        {
            $preview = _uho_fx::getGet('preview');
            $this->serdelia_edit = ($preview == 'serdelia_edit');
            if ($preview == 'serdelia_edit') {
                $_SESSION['serdelia_pro'] = [
                    'type' => 'standard',
                    'model' => _uho_fx::getGet('serdelia_model')
                ];
            } elseif ($preview == 'serdelia_edit_pro') {
                $_SESSION['serdelia_pro'] = [
                    'type' => 'pro',
                    'model' => _uho_fx::getGet('serdelia_model')
                ];
                $this->serdelia_edit = $preview;
            } elseif (@$_SESSION['serdelia_pro']['type'] == 'pro') $this->serdelia_edit = 'serdelia_edit_pro';
        }
        
        $this->orm->setLogErrors(true);
        
        $this->sql->cacheSet('7g!',
            [
                'users','users_newsletter'
            ]);
            
        

        

/*        
        $this->client = new _uho_client(
            $this->orm,
            [
                'title' => 'Project title',
                'models' =>
                [
                    'mailing' => 'client_mailing',
                    'users' => 'client_users',
                    'newsletter_users' => 'client_users_newsletter'
                ],
                'users' => ['login' => 'email', 'check_if_logged_exists' => true],
                'settings' => [
                    'gdpr_days' => @$this->dictGet('settings', 'data-processing-days')['value'],
                    'password_format'=>'8,0,0,0,0' // '8,1,1,1,1'
                ],
                'temp_favourites' => ['model' => 'users_favourites'],
                'cookie' => true,
                'salt' => ['type' => 'double', 'value' => $this->clients_config['password_salt'], 'field' => 'salt'],
                'mailer' => ['smtp' => $this->smtp],
                'oauth' => [
                    'google' => @$this->clients_config['google'],
                    'facebook' => @$this->clients_config['facebook'],
                    'epuap' => @$this->clients_config['epuap']
                ]
            ],
            $this->lang
        );*/
    }
    //============================================================================================
    public function dictInit()
    {
        
        if (!strpos($_SERVER['HTTP_HOST'], '.lh') && !strpos($_SERVER['HTTP_HOST'], 'sunship.one') && isset($_SESSION['dict']) && @$_SESSION['dict']['lang'] == $this->lang && development !== true)
        {
            $this->dict = $_SESSION['dict'];
        } else {
            $this->dict = array();
            $this->dict['collections']=$this->dictLoad('interviewers', ['active'=>1],'label');
            $this->dict['states']=$this->dictLoad('s_states', ['active'=>1],'label');
            $this->dict['topics']=$this->dictLoad('topics', ['active'=>1],'label');
            
            // uncomment for multi-lang sites
            //$this->dict['lang'] = $this->lang;
            


            $_SESSION['dict'] = $this->dict;
        }
    }
    //============================================================================================
    private function dictLoad($table, $filters = null, $order = null)
    {
        $t = $this->getJsonModel($table, $filters);

        $r = array();
        foreach ($t as $k => $v)
            if ($v['slug'])
                $r[$v['slug']] = $v;
            else $r[] = $v;
        
        //    if ($nr) $r = _uho_fx::array_merge($t, $order);


        return $r;
    }
    //============================================================================================
    public function dictGet($t, $key = null)
    {
        $r = @$_SESSION['dict'][$t];
        if (isset($r[$key])) $r = $r[$key];
        return $r;
    }

    //============================================================================================
    public function getClient()
    {
        //return $this->client->getData();
    }
    //============================================================================================
    public function set404()
    {
        $this->is404 = true;
    }
    //============================================================================================
    public function actionBefore($url, $get)
    {
        $result = false;
        if (isset(($url[0])))
        switch ($url[0]) {

            // ----------------------------------------------------------------------
            case "register-confirmation":
            if ($url[1]) $result = $this->client->registerConfirmation($url[1]);
            if (!$result) $this->set404(true);
            break;
            // ----------------------------------------------------------------------
            case "logout":
                $result = $this->client->logout();
                break;
            // ----------------------------------------------------------------------
                /*
                case "login":
                if (isset($get['epuap'])) {
                    $type = $this->clients_config['epuap']['type'];
                    $back = 'https://project.lh/pl/epuap-sso';
                    $result = $this->client->loginEpuapStart($type, $back, $debug);
                } elseif (isset($get['fb']) && $get['token']) $result = $this->client->loginFacebook($get['token']);
                elseif ($get['token']) $result = $this->client->loginGoogle($get['token']);

                if ($result && $get['redirect']) {
                    $url = explode('/', trim($get['redirect'], '/'));
                    if ($url[0] == 'pl' || $url[0] == 'en') array_shift($url);
                    if ($url[0] == 'logout') $url = '/';
                    else $url = implode('/', $url);
                    $result = ['url' => $url];
                } elseif ($result) $result = ['url' => @$_SESSION['login-save-url']];

                break;*/
                // ----------------------------------------------------------------------



        }
    }



    //============================================================================================
    public function headGet()
    {
        $t = $this->head;
        if ($t['image'] && substr($t['image'], 0, 4) != 'http') {
            $t['image'] = explode('?', $t['image'])[0];
            $size = @getimagesize(root_path . $t['image']);
            if ($size) {
                $t['image'] = array(
                    'src' => $t['image'],
                    'width' => $size[0],
                    'height' => $size[1]
                );
            }
        } elseif ($t['image']) $t['image'] = ['src' => $t['image']];


        if (isset($t['title']) && $t['title'] == 'Home') $t['title'] = '';

        if (isset($t['title']) && $t['title']) $t['title'] .= ' - ' . $this->head_title;
        else $t['title'] = $this->head_title;
        return $t;
    }
    //============================================================================================
    public function ogSet($title, $description = '', $image = null)
    {
        $img = null;

        if ($image && !is_array($image)) $img = $image;
        if (is_array($image)) {
            foreach ($image as $k => $v)
                if (!$img && file_exists(root_path . $v))
                    $img = $v;
        }

        if ($title) $this->head['title'] = strip_tags(str_replace('&nbsp;', ' ', $title));
        if ($description) $this->head['description'] = trim(_uho_fx::headDescription($description, true, 250));
        if ($img) $this->head['image'] = $img;
    }
    //============================================================================================
    public function updateImageCache(&$img)
    {
        if (strpos($img, '?')) return;
        if ($img)
            $time = @filemtime((rtrim($_SERVER['DOCUMENT_ROOT'], '/') . $img));
        if ($time) $img .= '?' . $time;
        else $img = null;
    }
    //============================================================================================
    public function updateImageCacheArray(&$arr, $field1 = null, $field2 = null)
    {
        if (is_array($arr))
            foreach ($arr as $k => $v) {
                if ($field1 == null && $field2 == null)
                    $this->updateImageCache($arr[$k]);
                elseif ($v[$field1][$field2])
                    $this->updateImageCache($arr[$k][$field1][$field2]);
                if (!$arr[$k]) unset($arr[$k]);
            }
    }
}
