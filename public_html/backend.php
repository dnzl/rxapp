<?php
ini_set('upload_max_filesize', '200M');
ini_set('max_execution_time', '999');
ini_set('memory_limit', '512M');
ini_set('post_max_size', '200M');

try{
  if(isset($_GET['id'])){
    $id=$_GET['id'];
    $filename="files/".$id;
    $myfile = fopen($filename, "r") or die("Unable to open file");
    $files=fread($myfile,filesize($filename));
    fclose($myfile);

    $result=array(
      "status"=>'success',
      "files"=>$files,
    );

  }else{
    $postdata = file_get_contents("php://input");
    $request = json_decode($postdata);
    $id=uniqid();

    if(!$request || !$request->files){
      throw new \Exception("File could not be saved");
    }

    $myfile = fopen("files/".$id, "w") or die("Unable to create file");
    fwrite($myfile, $request->files);
    fclose($myfile);

    $result=array(
      "status"=>'success',
      "id"=>$id,
    );
  }
}catch(Exception $e){
  $result=array(
    'status'=>'error',
    'msg'=>$e->getMessage(),
  );
}
echo json_encode($result);
