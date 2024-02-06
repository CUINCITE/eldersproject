<?php

require_once($_SERVER['DOCUMENT_ROOT']."/application/library/MailChimp/MailChimp.php");
use \DrewM\MailChimp\MailChimp;

class model_app_api_newsletter
{

    function __construct($parent,$settings)
    {
        $this->parent=$parent;
        $this->settings=$settings;
    }

    public function rest($method,$params)
    {

        $required=['email'];
        foreach ($required as $k=>$v)
            if (empty($params[$v])) return['result'=>false,'message'=>'<span>Required field is missing: '.$v.'</span>'];

        $data=[
            'email_address'=>$params['email']
        ];

        $result=$this->newsletterMailchimpAdd(
            $data
        );

        if ($result['result'] && $result['status'] == 'subscribed') $result['message']='<p>Thank you.</p><p>You\'re already subscribed to our newsletter!</p>';
        elseif ($result['result']&& $result['status'] == 'pending') $result['message']='<p>Thank you.</p><p>Thank you for joining our mailing list.</p>';
        else $result['message'] = '<p>Something went wrong.</p><p>We were unable to process your sign-up request. Please refresh this page and try again.</p>';

        return $result;
    }

    // --------------------------------------------------------------------------------

    public function newsletterMailchimpAdd($data)
    {

        $mailchimp_config = $this->parent->getApiKeys('mailchimp');
        if (!$mailchimp_config) return false;

        $mailchimp_api= $mailchimp_config['key'];   //  API KEY
        $mailchimp_list=$mailchimp_config['list_id'];  //  Email List

        try
        {
            $MailChimp = new MailChimp($mailchimp_api);
        }
        catch (Exception $err)
        {
            return(array(
                'result'=>false,
                'message'=>'<span>Oooops!</span><span>Please, try again later.</span>'
            ));
        }

        $hash = $MailChimp->subscriberHash($data['email_address']);

        $data['status']='pending';

        if ($hash)
        {
            $exists = $MailChimp->get(
                'lists/'.$mailchimp_list.'/members/'.$hash,
                $data
            );
        }

        if (isset($exists) && $exists && isset($exists['email_address']) && $exists['email_address'])
        {
            $data['status']='subscribed';
            unset($data['email_address']);
            $result = $MailChimp->put(
                'lists/'.$mailchimp_list.'/members/'.$hash,
                $data
            );
        } else
        {
            $result = $MailChimp->post(
                'lists/'.$mailchimp_list.'/members',
                $data
            );
        }

        if ($result)
        {
            if ($result['status']=='pending' || $result['status']=='subscribed') {
                $result = array(
                    'result' => true,
                    'status' => $result['status']
                );
            }
            else {
                if ($result['status'] == 400 && $result['title'] == 'Member Exists') {
                    $result = array(
                        'result' => true,
                        'status' => 'exists'
                    );
                }
            else {
                $result = array(
                    'result' => false,
                    'data' => $result,
                    'status' => 'mailchimp error'
                );
            }
            }


        } else $result=array(
            'result'=>false,
            'message'=>'<span>Connection error.</span>'
        );

        return $result;

    }

}

?>