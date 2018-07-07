//check if browser supports file api and filereader features
if(!window.File || !window.FileReader || !window.FileList || !window.Blob){
    alert('The File APIs are not fully supported in this browser.');
}

var WebsiteApp=angular.module('rxModule', ['ui.bootstrap'])

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
}])

.factory('FileSrv',function($http){
    var $this=this;

    $this.saveFile=function(encryptedFile){
      return $http.post('backend.php',{files:encryptedFile});
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

    $this.encryptFile=function(file,key){
        return new Promise(function(resolve,reject){
            triplesec.encrypt({
                data:new triplesec.Buffer(file),
                key:new triplesec.Buffer(key),
                progress_hook:function(obj){}
            },function(err,buff){
                if(!err){
                    resolve(buff.toString('hex'));
                }else{
                    reject(err);
                }
            });
        });
    };

    $this.decryptFile=function(file,key){
        return new Promise(function(resolve,reject){
            triplesec.decrypt({
                data:new triplesec.Buffer(file,'hex'),
                key:new triplesec.Buffer(key),
                progress_hook:function(obj){}
            },function(err,buff){
                if(!err){
                    resolve(buff.toString());
                }else{
                    reject(err);
                }
            });
        });
    };

    return $this;
})

.controller('BaseCtrl',function($rootScope,FileSrv,$uibModal){
    var WebApp={
        ViewerApp:new ViewerApp(),
        showSaveBtn:false,
        disableFileinput:false,
        showFileinput:true,
        showFileinputLoader:false,
        showSeeKeysBtn:false,
        selectedFiles:false,
        encryptedFiles:false,
        idResource:false, //id server side to find files
//ENCRYPTION
        _keyWords:[],
        getKey:function(){
            return WebApp._keyWords.join(' ');
        },
        generateKey:function(){
            WebApp._keyWords=['aaa','bbb','ccc','ddd'];
        },

//MODALS
        openModal:function(tpl,ctrl){
            var ctrl = ctrl || 'ModalDefaultCtrl';
            $uibModal.open({
                templateUrl:tpl,
                controller:ctrl,
                controllerAs:'$modalCtrl',
                size:'lg',
                appendTo:angular.element(document.getElementById('app')),
                backdrop:true,
                animation:false,
            });
        },
        showInsertKeysModal:function(){
            WebApp.openModal('ModalInsertKeys.html');
        },
        showSeeKeysModal:function(){
            WebApp.openModal('ModalShowKeys.html');
        },
//FILE
        resourceUrl:'',
        fullUrl:'',
        generateUrl:function(){
            WebApp.resourceUrl='#k='+WebApp.idResource;
            WebApp.fullUrl=window.location.href+WebApp.resourceUrl;
        },
        encryptSelectedFiles:function(i,arrEncryptedFiles){
          return new Promise(function(resolve,reject){
            FileSrv.encryptFile(WebApp.selectedFiles[i],WebApp.getKey()).then(function(encryptedFile){
              arrEncryptedFiles[i]=encryptedFile;
              if(WebApp.selectedFiles[i+1]!==undefined){
                resolve(WebApp.encryptSelectedFiles(i+1,arrEncryptedFiles));
              }else{
                resolve(arrEncryptedFiles);
              }
            });
          });
        },
        handleFiles:function(){
            WebApp.showFileinput=false;
            WebApp.showFileinputLoader=true;
            //show files in viewer
            WebApp.ViewerApp.loadURLs(WebApp.selectedFiles);


            var arrEncryptedFiles=[];
            WebApp.encryptSelectedFiles(0,arrEncryptedFiles).then(function(encryptedFiles){
              WebApp.encryptedFiles=encryptedFiles;
              WebApp.showFileinputLoader=false;
              WebApp.showSaveBtn=true;
              $rootScope.$digest();
            });
return;

            //encrypt files
            var filesText=JSON.stringify({files:WebApp.selectedFiles});
            FileSrv.encryptFile(filesText,WebApp.getKey()).then(function(encryptedFiles){
                WebApp.encryptedFiles=encryptedFiles;
                WebApp.showFileinputLoader=false;
                WebApp.showSaveBtn=true;
                $rootScope.$digest();
            });
        },
        saveFiles:function(){
            FileSrv.saveFile(JSON.stringify(WebApp.encryptedFiles)).then(function(r){
                //show url/qr code & passworte
                WebApp.idResource=r.data.id;
                WebApp.generateUrl();
                WebApp.showSaveBtn=false;
                WebApp.showSeeKeysBtn=true;
                WebApp.showSeeKeysModal();
            });
        },

        decryptArrFiles:function(i,arrDecryptedFiles){
console.log('WebApp.decryptArrFiles',i,arrDecryptedFiles);
          return new Promise(function(resolve,reject){
            FileSrv.decryptFile(WebApp.encryptedFiles[i],WebApp.getKey()).then(function(decryptedFile){
console.log('FileSrv.decryptFile.then',decryptedFile);
              arrDecryptedFiles[i]=decryptedFile;
              if(WebApp.encryptedFiles[i+1]!==undefined){
                resolve(WebApp.decryptArrFiles(i+1,arrDecryptedFiles));
              }else{
                resolve(arrDecryptedFiles);
              }
            });
          });
        },
        decryptFiles:function(){
          var Promises=[];
          angular.forEach(WebApp.encryptedFiles,function(file,i){
            Promises.push(FileSrv.decryptFile(WebApp.encryptedFiles[i],WebApp.getKey()));
          });
          Promise.all(Promises).then(function(files){
console.log('all promises',files);
WebApp.ViewerApp.loadURLs(files);
          });
return;







console.log('WebApp.decryptFiles');
          var arrDecryptedFiles;
          WebApp.decryptArrFiles(0,arrDecryptedFiles).then(function(r){
console.log('WebApp.decryptArrFiles.then',r,arrDecryptedFiles);
return;
            WebApp.ViewerApp.loadURLs(json.files);
          });

return;
            FileSrv.decryptFile(WebApp.encryptedFiles,WebApp.getKey()).then(function(r){
              var json=JSON.parse(r.toString());
              WebApp.ViewerApp.loadURLs(json.files);
            });
        },
        loadResource:function(id){
            FileSrv.getFile(id).then(function(r){
                WebApp.encryptedFiles=JSON.parse(r.data.files);
                WebApp.openModal('ModalInsertKeys.html');
            },function(r){
              //[TODO] handle nonextistent resource
              console.log('error',r);
            });
        },
    };

    var hash=window.location.hash.split('='); //url.com/#key=HASH
    if(hash.length && hash[1]!==undefined && hash[1].length){
        WebApp.showFileinput=false;
        WebApp.loadResource(hash[1]);
    }

    $rootScope.$watch('WebApp.selectedFiles',function(data){ //selected files, begin encrypt
        if(data){WebApp.handleFiles();}
    });

    WebApp.generateKey();

    $rootScope.WebApp=WebApp;
})
.controller('ViewerCtrl',function($scope){
    $scope.ViewerApp={
        showColumn:false,
    }
})

.controller('ModalDefaultCtrl',function($uibModalInstance){
  var $ctrl = this;
  $ctrl.close = function(){$uibModalInstance.close();};
})

.directive('ngFileUploader',function(FileSrv){
    return{
        scope:{
            fileread:"="
        },
        link:function(scope, element, attributes){
          element.bind("change", function(changeEvent){

            FileSrv.readUploadedFiles(changeEvent.target.files).then(function(r){
              scope.$apply(function(){scope.fileread=r;});
            });
          });
        }
      };
})
;
