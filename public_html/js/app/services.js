WebsiteApp.factory('EncryptSrv',function(){
  var $this=this;

  $this.encryptFile=function(file,key){
    return new Promise(function(resolve,reject){
      try{
        var a=CryptoJS.AES.encrypt(file,key);
        resolve(a.toString());
      }catch(e){
        reject(e);
      }
    });
  };

  $this.decryptFile=function(file,key){
    return new Promise(function(resolve,reject){
      resolve(CryptoJS.AES.decrypt(file,key).toString());
    });
  };

  //APPROACH: simulated synchronic
  $this.arrFiles=[];
  $this.key='';
  $this.recEncryptArrFiles=function(i,arrEncryptedFiles){
    if(i===undefined){i=0;}
    if(arrEncryptedFiles===undefined){arrEncryptedFiles=[];}
    return new Promise(function(resolve,reject){
      $this.encryptFile($this.arrFiles[i],$this.key).then(function(encryptedFile){
        arrEncryptedFiles[i]=encryptedFile;
        if($this.arrFiles[i+1]!==undefined){
          resolve($this.recEncryptArrFiles(i+1,arrEncryptedFiles));
        }else{
          resolve(arrEncryptedFiles);
        }
      });
    });
  };
  $this.syncEncryptArrFiles=function(arrFiles,key){
    $this.arrFiles=arrFiles;
    $this.key=key;
    return $this.recEncryptArrFiles();
  };
  // end simulated synchronic

  //APPROACH: 100% sync
  $this.asyncEncryptArrFiles=function(arrFiles,key){
    var Promises=[];
    angular.forEach(arrFiles,function(file){
      Promises.push($this.encryptFile(file,key));
    });
    return Promise.all(Promises);
  };

  return $this;
})

.factory('FileSrv',function(){
    var $this=this;

    $this.saveFile=function(files){
      return $http.post('backend.php',{files:files});
    };
    $this.getFile=function(id){
      return $http.get('backend.php?id='+id);
    };

    //reads the uploaded files, returns a promise.all resolve all the files as array of dataurls
    $this.readUploadedFiles=function(fileList){
      var Promises=[];
      angular.forEach(fileList,function(file,i){
        Promises.push(new Promise(function(resolve){
          var reader=new FileReader();
          reader.onload=function(loadEvent){resolve(loadEvent.target.result);};
          reader.readAsDataURL(file);
        }));
      });
      return Promise.all(Promises);
    };

    return $this;
});
