WebsiteApp
.factory('EncryptSrv',function(){
  var $this=this;

  $this.parseKey=function(keyStr){
    var k=keyStr.split(' '),
        iv=k[k.length-1];
        k=k.splice(0,3).join(' ');
        return{
          key:k,
          iv:hex_sha1(iv),
        };
  };

  $this.decryptFiles=function(arrFiles,key){
    var keys=$this.parseKey(key);
    return new Promise(function(resolve,reject){
      var decryptWorker = new Worker("js/app/decrypter.js");
      decryptWorker.postMessage({files:arrFiles,key:keys.key,iv:keys.iv});
      decryptWorker.onmessage=function(e){
        decryptWorker.terminate();
        decryptWorker=undefined;
        if(e.data=='error'){reject();}else{resolve(e.data);}
      }
    });
  };

  $this.encryptArrFiles=function(arrFiles,key){
    var keys=$this.parseKey(key);
    return new Promise(function(resolve,reject){
      var encryptWorker = new Worker("js/app/encrypter.js");
      encryptWorker.postMessage({files:arrFiles,key:keys.key,iv:keys.iv});
      encryptWorker.onmessage=function(e){
        encryptWorker.terminate();
        encryptWorker=undefined;
        if(e.data=='error'){reject();}else{resolve(e.data);}
      }
    });
  };
  return $this;
})

.factory('FileSrv',function($http){
  var $this=this;

  $this.saveFile=function(files){return $http.post('backend.php',{files:files});};
  $this.getFile=function(id){return $http.get('backend.php?id='+id);};

  //reads the uploaded files, returns a promise.all resolve all the files as array of dataurls
  $this.readUploadedFiles=function(fileList){
    var Promises=[];
    angular.forEach(fileList,function(file,i){
      Promises.push(new Promise(function(resolve){
// var dicomParser = new dwv.dicom.DicomParser();
// dicomParser.parse(arrayBuffer);
// var rawTags = dicomParser.getRawDicomElements();
// var id=rawTags.x00080016.value[0];
        var reader=new FileReader();
        reader.onload=function(e){resolve(e.target.result);};
        reader.readAsDataURL(file);
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
