<?php
ini_set('upload_max_filesize', '200M');
ini_set('max_execution_time', '999');
ini_set('memory_limit', '512M');
ini_set('post_max_size', '200M');

// Include the SDK using the Composer autoloader
date_default_timezone_set('UTC');
require 'vendor/autoload.php';
use Aws\S3\S3Client;

$_endpoint='https://storage.werpo.com.ar';
$_key='FXXGKVBAEVEHSYGPYYX0';
$_secret='1fyNeLCT5GS9X92r2vWdv3gx10FlaW5RlAey';
$_bucket='rxapp';

$s3 = new Aws\S3\S3Client([
        'version' => 'latest',
        'region'  => 'us-east-1',
        'signature_version' => 'v4',
        'endpoint' => $_endpoint,
        'use_path_style_endpoint' => true,
        'credentials' => [
                'key'    =>$_key,
                'secret' =>$_secret,
            ],
]);


try{
  //get gallery
  if(isset($_GET['gallery_id'])){
    $idGallery=$_GET['gallery_id'];

    $objects = $s3->getIterator('ListObjects', array(
      "Bucket" => $_bucket,
      "Prefix" =>$idGallery.'/'
    ));
    
    $arrFiles=[];
    foreach ($objects as $object) {
      $file=$s3->getObject([
           'Bucket' => $_bucket,
           'Key'    => $object['Key'],
           'ResponseContentType'=>'text/plain'
      ]);
      $arrFiles[]=(string)$file['Body'];
    }
    $result=array(
      "status"=>'success',
      "files"=>$arrFiles,
    );
  }else
  //create gallery
  if(isset($_GET['c'])){
    $idGallery=substr(md5(uniqid()),0,10);
    $result=array(
      'status'=>'success',
      'gallery_id'=>$idGallery,
    );

  }else{
    //SAVE FILE
    $postdata = file_get_contents("php://input");
    $request  = json_decode($postdata);
    $idFile   = md5(uniqid());

    if(!$request || !$request->file){throw new \Exception("File could not be saved");}
    if(!$request->gallery_id){throw new \Exception("Unknown gallery");}
    $idGallery=$request->gallery_id;

    $insert = $s3->putObject([
         'Bucket' =>$_bucket,
         'Key'    => $idGallery.'/'.$idFile,
         'Body'   => $request->file
    ]);

    $result=array(
      "status"=>'success',
      "gallery_id"=>$idGallery,
      "file_id"=>$idFile,
      'i'=>var_export($insert,true)
    );
  }
}catch(Exception $e){
  $result=array(
    'status'=>'error',
    'msg'=>$e->getMessage(),
  );
}
echo json_encode($result);
