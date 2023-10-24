<?php

echo (extension_loaded('openssl')?'SSL loaded':'SSL not loaded')."\n";

ini_set('display_errors', 1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$root_path=$_SERVER['DOCUMENT_ROOT'].'/';

require $root_path.'application/_uho/library/phpMailer/src/Exception.php';
require $root_path.'application/_uho/library/phpMailer/src/PHPMailer.php';
require $root_path.'application/_uho/library/phpMailer/src/SMTP.php';


      $smtp=array(
          'server'=>'ex.lazienki-krolewskie.pl',
          'port'=>'587',
          'login'=>'no-reply@lazienki-krolewskie.pl',
          'pass'=>'!@!Mail21',
          'secure'=>'tls'
        );

		$smtp =
		[
			'server' => 's157.cyber-folks.pl',
			'port' => '587',
            'login' => 'no-reply@huncwot.dev',
            'pass' => '_rN1N-V!-ZbK.2aP',
			'secure' => 'tls'					
		];

      $mail = new PHPMailer;
      $mail->CharSet = "UTF-8";
      
      $mail->isSMTP();                                      // Set mailer to use SMTP
      $mail->Host = $smtp['server'];                        // Specify main and backup server
      $mail->SMTPAuth = true;                               // Enable SMTP authentication
      $mail->Username = $smtp['login'];                   // SMTP username
      $mail->Password = $smtp['pass'];                      // SMTP password
      $mail->Port=587;
      $mail->SMTPDebug = 3;
      $mail->SMTPSecure = $smtp['secure'];
      $mail->From = $smtp['login'];
      $mail->FromName = 'Muzeum Łazienki Królewskie';

      $mail->From=$mail->Username=$smtp['login'];//'sklep@lazienki-krolewskie.pl';
      $mail->Password=$smtp['pass'];

      $mail->Subject = 'Subject of this message';
      $mail->IsHTML(true);
      $mail->Body    = '<p><b>Message</b> from Me</p>';
      $mail->AltBody = 'Message from Me';

      $mail->smtpConnect(
            array(
                "ssl" => array(
                    "verify_peer" => false,
                    "verify_peer_name" => false,
                    "allow_self_signed" => true
                )
            )
        );

      $mail->addAddress('lukasz@knasiecki.com'); 
      $result=$mail->send();
      if (!$result) $message=$mail->ErrorInfo; else $message='OK';
      exit('<p>'.$message.'</p>');
?>
