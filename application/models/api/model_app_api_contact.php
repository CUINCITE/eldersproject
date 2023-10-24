<?php

class model_app_api_contact
{

	function __construct($parent,$settings)
	{
		$this->parent=$parent;
		$this->settings=$settings;
	}

	public function rest($method,$action,$params)
	{
		$required=['name','email','message'];
		foreach ($required as $k=>$v)
			if (!$params[$v]) return['result'=>false,'message'=>'Wymagane pole: '.$v];

		unset($params['id']);
		$result=$this->parent->postJsonModel('users_contacts',$params);
		$cid=$this->parent->getJsonModel('admins_emails_functions',['slug'=>'contact'],true);
		if ($cid) $contacts=$this->parent->getJsonModel('admins_emails',['active'=>1,'functions'=>$cid['id']]);
		if ($contacts)
		{
			foreach ($contacts as $k=>$v)
				$contacts[$k]=$v['email'];
			if ($params['subject'])
				$subject=$this->parent->getJsonModel('s_contact_subjects',['id'=>intval($params['subject'])],true);
				else $subject=['label'=>'-'];
			
		$this->parent->clientMailing('contact',$contacts,
			[
				'name'=>$params['name'],
				'company'=>$params['company'],
				'subject'=>$subject['label'],
				'email'=>$params['email'],
				'message'=>$params['message']
			]);
		}
		$result=['result'=>$result];

       	return $result;
	}
}

?>