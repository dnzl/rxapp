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

  $this.encryptArrFiles=function(arrFiles,key){
    return new Promise(function(resolve,reject){
      var encr = CryptoJS.algo.SHA256.create();
      angular.forEach(arrFiles,function(file,i){encr.update(file);});
      var result=encr.finalize();
      resolve(result.toString());
    });
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
    $this.readUploadedFiles=function(fileList,readAs){
      var Promises=[];
      angular.forEach(fileList,function(file,i){
        Promises.push(new Promise(function(resolve){
          var reader=new FileReader();
          reader.onload=function(loadEvent){resolve(loadEvent.target.result);};
          if(readAs=='bin'){
            reader.readAsBinaryString(file);
          }else{
            reader.readAsDataURL(file);
          }
        }));
      });
      return Promise.all(Promises);
    };

    return $this;
})
//https://solidfoundationwebdev.com/blog/posts/how-to-use-localstorage-in-angularjs
.factory('$localstorage',['$window',function($window){
    return {
        set:function(key,value){
            $window.localStorage[key]=value;
        },
        get:function(key,defaultValue){
            return $window.localStorage[key]||defaultValue||false;
        },
        setObject:function(key,value){
            $window.localStorage[key]=JSON.stringify(value);
        },
        getObject:function(key,defaultValue){
            if($window.localStorage[key]!=undefined){
                return JSON.parse($window.localStorage[key]);
            }else{
                return defaultValue||false;
            }
        },
        remove:function(key){
            $window.localStorage.removeItem(key);
        },
        clear:function(){
            $window.localStorage.clear();
        }
    }
}]);
