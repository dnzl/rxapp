//check if browser supports file api and filereader features
if(!window.File || !window.FileReader || !window.FileList || !window.Blob){
    alert('The File APIs are not fully supported in this browser.');
}
if(typeof(Worker)===undefined){alert('WebWorkers not found');}

function randomString(length){
    if(!length){length=5;}
    var chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        s='';
    for(var i=0;i<length;++i){s+=chars[Math.floor(Math.random()*chars.length)];}
    return s;
}

Array.prototype.remove = Array.prototype.remove || function(val){
    var i = this.length; while(i--){if(this[i]===val){this.splice(i,1);}}
};

var WebsiteApp=angular.module('rxModule', ['ui.bootstrap'])
.controller('BaseCtrl',function($rootScope,FileSrv,EncryptSrv,$uibModal,$timeout){

 //[TODO] buscar una mejor forma de handlear dmw's errors -.-
  window.alert = function(msg){
    WebApp.openModal('default-msg.html');
    WebApp.modalMsg.error=msg;
  };
  /*
  (function(proxied){
    window.alert = function(msg){throw new Error(msg);};
  })(window.alert);
  */

    var WebApp={
        modalMsg:{
          error:false,
          msg:false,
          info:false,
        },
        show:{
          fileinput:true,
          headerLoader:false,
          seeKeysBtn:false,
          saveBtn:false,
          deleteFile:true,
        },
        errors:{
          default:false, //show on modal
          upload:false, //on upload files
          viewer:false, //on load files to viewer
          save:false, //on save files to server
          load:false, //on load files from server
          encrypt:false, //on encrypt
          decrypt:false, //on decrypt
        },
        currentAction:'',
        arrFiles:[],
        currentFile:false,
        encryptedFiles:[],
        idGallery:false, //id server side to find files
        resourceUrl:'',
        fullUrl:'',
        baseUrl:location.protocol+'//'+location.host+location.pathname,
        generateUrl:function(){
            WebApp.resourceUrl='#k='+WebApp.idGallery;
            WebApp.fullUrl=WebApp.baseUrl+WebApp.resourceUrl;
        },
//MODALS
        openModal:function(tpl,ctrl){
            var ctrl = ctrl || 'ModalDefaultCtrl';
            return $uibModal.open({
                templateUrl:'modals/'+tpl,
                controller:ctrl,
                controllerAs:'$modalCtrl',
                size:'lg',
                appendTo:angular.element(document.getElementById('app')),
                backdrop:true,
                animation:false,
            });
        },
        modals:{
          InsertKeys:false,
          ShowKeys:false,
          Tags:false,
        },
        showInsertKeysModal:function(){
            WebApp.modals.InsertKeys=WebApp.openModal('insert-keys.html');
        },
        showSeeKeysModal:function(){
            WebApp.modals.ShowKeys=WebApp.openModal('show-keys.html');
        },
        tagsData:'',
        showTagsModal:function(){
            WebApp.modals.Tags=WebApp.openModal('tags.html');
        },
getTimeDiff:function(start,now){return (now-start);},
//ENCRYPTION
        _keyWords:[],
        getKey:function(){return WebApp._keyWords.join(' ');},
        generateKey:function(){WebApp._keyWords=xkcd_pw_gen();},
        loadGallery:function(idGallery){
          WebApp.currentAction='loading files...';
          WebApp.idGallery=idGallery;
          WebApp.generateUrl();
          WebApp.show.headerLoader=true;
          FileSrv.getGallery(idGallery).then(function(r){
            if(r.data.status=='error'){
              alert("Gallery not found. You'll be redirected.");
              $timeout(function(){
//                window.location.href=location.protocol+'//'+location.host+location.pathname;
              },5000);
              return;
            }
            WebApp.currentAction='';
            WebApp.encryptedFiles=r.data.files;
            WebApp.showInsertKeysModal();
          },function(e){
            alert('Unable to load gallery',e);
          });
        },
        decryptFiles:function(){
          WebApp.currentAction='checkin password...';
          WebApp.errors.decrypt='';
          WebApp.show.decryptLoader=true;
          var Promises=[];
          angular.forEach(WebApp.encryptedFiles,function(encryptedFile){
            Promises.push(EncryptSrv.decryptFile(encryptedFile,WebApp.getKey()));
          });

          $timeout(function(){
            if(WebApp.currentAction!=''){WebApp.currentAction='decrypting files...'; }
          },2000);

          Promise.all(Promises).then(function(decryptedFiles){
            WebApp.arrFiles=decryptedFiles;
            WebApp.currentFile=WebApp.arrFiles[0];
            WebApp.encryptedFiles=false; //free memory
            WebApp.modals.InsertKeys.close();
            WebApp.show.seeKeysBtn=true;
          },function(e){
            var msg='decrypt error. check keys.';
            if(e!==undefined && e.length){msg=e;}
            WebApp.errors.decrypt=msg;
          })
          .finally(function(){
            WebApp.show.headerLoader=false;
            WebApp.show.decryptLoader=false;
            WebApp.currentAction='';
            $rootScope.$digest();
          });
        },

        saveAndEncrypt:function(){
          //encrypt, then save
          WebApp.show.headerLoader=true;
          WebApp.show.saveBtn=false;
          WebApp.show.fileinput=false;

          //create gallery
          FileSrv.createGallery().then(function(galleryData){
            WebApp.idGallery=galleryData.data.gallery_id;
            var Promises=[];
            angular.forEach(WebApp.arrFiles,function(file){
              EncryptSrv.encryptFile(file,WebApp.getKey()).then(function(encryptedFile){
                Promises.push(FileSrv.saveFile(WebApp.idGallery,encryptedFile));
              });
            });

            Promise.all(Promises).then(function(prom){
              WebApp.show.headerLoader=false;
              WebApp.show.seeKeysBtn=true;
              WebApp.generateUrl();
              WebApp.showSeeKeysModal();
              WebApp.encryptedFiles=false; //free memory
            });
          },function(r){
            alert("Can't create gallery. Try again later");
            WebApp.show.headerLoader=false;
            WebApp.show.saveBtn=true;
            WebApp.show.fileinput=true;
          });
        },

        handleFiles:function(){
            if(!WebApp.currentFile){WebApp.currentFile=WebApp.uploadedFiles[0];}
            angular.forEach(WebApp.uploadedFiles,function(file){
              WebApp.arrFiles.push(file);
            });
            WebApp.uploadedFiles=[];
            WebApp.show.saveBtn=true;
        },
    };

    var hash=window.location.hash.split('='); //url.com/#key=HASH
    if(hash.length && hash[1]!==undefined && hash[1].length){
      WebApp.show.saveBtn=false;
      WebApp.show.fileinput=false;
      WebApp.show.deleteFile=false;
      WebApp.loadGallery(hash[1]);
    }else{
      WebApp.generateKey();
    }

    $rootScope.$watch('WebApp.uploadedFiles',function(data){ //selected files, begin encrypt
      if(data && data.length){WebApp.handleFiles();}
    });

    $rootScope.WebApp=WebApp;
})
.controller('ModalDefaultCtrl',function($uibModalInstance){
  var $ctrl = this;
  $ctrl.close = function(){$uibModalInstance.close();};
})

.directive('ngFileUploader',function(FileSrv){
  return{
    scope:{uploadedFiles:"=",loading:'='},
    link:function(scope, element, attributes){

      function saveAsOneFile(fileList){
        var newFile={
          id:randomString(),
          name:'N/A',
          type:'',
        };
        return new Promise(function(resolve){
          FileSrv.readUploadedFiles(fileList).then(function(fileData){
            newFile.fileData=fileData;
            resolve(newFile);
          });
        });
      }


      element.bind("change", function(e){
        scope.$apply(function(){scope.loading=true;}); //show loader
        var selectedFiles=e.target.files,
            Promises=[],
            isCollection=true;
        angular.forEach(selectedFiles,function(file){
          var newFile={
            id:randomString(),
            name:file.name,
            type:file.type.toLowerCase(),
          },
          isImg=newFile.type.substr(0,5)=='image';
          if(newFile.type=='application/dicom' || isImg){
            isCollection=false;
            Promises.push(new Promise(function(resolve){
              newFile.size=file.size;
              FileSrv.readUploadedFile(file).then(function(fileData){
                newFile.fileData=[fileData];
                if(isImg){newFile.thumbnail=fileData;}
                resolve(newFile);
              });
            }));
          }
        });
        if(isCollection){Promises.push(saveAsOneFile(selectedFiles));}

        Promise.all(Promises).then(function(filesList){
          scope.$apply(function(){
            scope.uploadedFiles=filesList;
            scope.loading=false; //hide loader
          });
        });
      });
    }
  }
});
