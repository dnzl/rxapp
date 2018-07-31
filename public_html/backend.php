<?php
ini_set('upload_max_filesize', '200M');
ini_set('max_execution_time', '999');
ini_set('memory_limit', '512M');
ini_set('post_max_size', '200M');

function writeFile($filepath,$content){
  $fp=fopen($filepath,"w");
  fwrite($fp,$content);
  fclose($fp);
}

try{
  //get gallery
  if(isset($_GET['gallery_id'])){
    $idGallery=$_GET['gallery_id'];
    $dirname='files/'.$idGallery.'/';
    $arrFiles=array_diff(scandir($dirname),array('.', '..'));
    if(!$arrFiles){throw new \Exception("Gallery not found");}
    $out=[];

    foreach($arrFiles as $file){
      $out[]=file_get_contents($dirname.$file);
    }
    $result=array(
      "status"=>'success',
      "files"=>$out,
    );
  }else
  //create gallery
  if(isset($_GET['c'])){
    $idGallery=substr(md5(uniqid()),0,10);
    $dirname='files/'.$idGallery.'/';
    $i=0;
    while(file_exists($dirname)===true){
      $idGallery=md5(uniqid()); $dirname='files/'.$idGallery.'/';
      if(++$i>500){throw new Exception("Can't create gallery");}
    }
    mkdir($dirname);
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
    writeFile("files/".$idGallery.'/'.$idFile,$request->file);

    $result=array(
      "status"=>'success',
      "gallery_id"=>$idGallery,
      "file_id"=>$idFile,
    );
  }
}catch(Exception $e){
  $result=array(
    'status'=>'error',
    'msg'=>$e->getMessage(),
  );
}
echo json_encode($result);
