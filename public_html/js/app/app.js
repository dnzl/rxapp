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
    WebApp.openModal('ModalDefaultMsg.html');
    WebApp.modalMsg.error=msg;
  };
  /*
  (function(proxied){
    window.alert = function(msg){throw new Error(msg);};
  })(window.alert);
  */

    var WebApp={
        showSaveBtn:false,
        disableFileinput:false,
        modalMsg:{
          error:false,
          msg:false,
          info:false,
        },
        show:{
          fileinput:true,
          fileinputLoader:false,
          seeKeysBtn:false,
          decryptLoader:false,
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
        idResource:false, //id server side to find files
        resourceUrl:'',
        fullUrl:'',
        generateUrl:function(){
            WebApp.resourceUrl='#k='+WebApp.idResource;
            WebApp.fullUrl=window.location.href+WebApp.resourceUrl;
        },
//MODALS
        openModal:function(tpl,ctrl){
            var ctrl = ctrl || 'ModalDefaultCtrl';
            return $uibModal.open({
                templateUrl:tpl,
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
            WebApp.modals.InsertKeys=WebApp.openModal('ModalInsertKeys.html');
        },
        showSeeKeysModal:function(){
            WebApp.modals.ShowKeys=WebApp.openModal('ModalShowKeys.html');
        },
        tagsData:'',
        showTagsModal:function(){
            WebApp.modals.Tags=WebApp.openModal('ModalTags.html');
        },
getTimeDiff:function(start,now){return (now-start);},
//ENCRYPTION
        _keyWords:[],
        getKey:function(){
            return WebApp._keyWords.join(' ');
        },
        generateKey:function(){
            WebApp._keyWords=xkcd_pw_gen();
        },
        encryptArrFiles:function(){
          return EncryptSrv.encryptArrFiles(WebApp.arrFiles,WebApp.getKey());
        },
        decryptFiles:function(){
          WebApp.show.decryptLoader=true;
          WebApp.errors.decrypt=false;
          EncryptSrv.decryptFiles(WebApp.encryptedFiles,WebApp.getKey()).then(function(urls){
            WebApp.encryptedFiles=false;
            WebApp.ViewerApp.loadURLs(urls);
            WebApp.modals.InsertKeys.close();
            WebApp.show.decryptLoader=false;
          },function(r){
            var msg='decrypt error. check keys.';
            if(r!==undefined && r.length){msg=r;}
            WebApp.errors.decrypt=msg;
          })
          .finally(function(){
            WebApp.show.decryptLoader=false;
            $rootScope.$digest();
          });
        },
        handleFiles:function(){
            if(!WebApp.currentFile){WebApp.currentFile=WebApp.uploadedFiles[0];}
            angular.forEach(WebApp.uploadedFiles,function(file){
              WebApp.arrFiles.push(file);
            });
            WebApp.uploadedFiles=[];
/*return;

              WebApp.encryptSelectedFiles().then(function(encryptedFiles){
                WebApp.encryptedFiles=encryptedFiles;
                WebApp.show.fileinputLoader=false;
                WebApp.showSaveBtn=true;
WebApp.currentAction='done';
                $rootScope.$digest();
              });

            });*/
        },
        saveFiles:function(){
            FileSrv.saveFile(JSON.stringify(WebApp.encryptedFiles)).then(function(r){
                //show url/qr code & passworte
                WebApp.idResource=r.data.id;
                WebApp.generateUrl();
                WebApp.showSaveBtn=false;
                WebApp.show.seeKeysBtn=true;
                WebApp.showSeeKeysModal();
                WebApp.encryptedFiles=false; //free memory
            });
        },
        loadResource:function(id){
            FileSrv.getFile(id).then(function(r){
                WebApp.encryptedFiles=JSON.parse(r.data.files);
                WebApp.showInsertKeysModal();
            },function(r){
              //[TODO] handle nonextistent resource
              console.log('error',r);
            });
        },
    };

    var hash=window.location.hash.split('='); //url.com/#key=HASH
    if(hash.length && hash[1]!==undefined && hash[1].length){
        WebApp.show.fileinput=false;
        WebApp.loadResource(hash[1]);
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
    scope:{uploadedFiles:"=",},
    link:function(scope, element, attributes){

      function saveAsOneFile(fileList){
        var newFile={
          id:randomString(),
          name:'N/A',
          type:'',
          thumbnail:false,
        };
        return new Promise(function(resolve){
          FileSrv.readUploadedFiles(fileList).then(function(fileData){
            newFile.fileData=fileData;
            resolve(newFile);
          });
        });
      }


      element.bind("change", function(e){
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
          });
        });
      });
    }
  }
});
