//check if browser supports file api and filereader features
if(!window.File || !window.FileReader || !window.FileList || !window.Blob){
    alert('The File APIs are not fully supported in this browser.');
}
if (typeof(Worker)===undefined){alert('WebWorkers not found');}

Array.prototype.remove = Array.prototype.remove || function(val){
    var i = this.length; while(i--){if(this[i]===val){this.splice(i,1);}}
};

var WebsiteApp=angular.module('rxModule', ['ui.bootstrap'])
.controller('BaseCtrl',function($rootScope,FileSrv,EncryptSrv,$uibModal){
    var WebApp={
        ViewerApp:new ViewerApp(),
        showSaveBtn:false,
        disableFileinput:false,
        showFileinput:true,
        showFileinputLoader:false,
        showSeeKeysBtn:false,
        showDecryptLoader:false,
        selectedFiles:[],
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
        },
        showInsertKeysModal:function(){
            WebApp.modals.InsertKeys=WebApp.openModal('ModalInsertKeys.html');
        },
        showSeeKeysModal:function(){
            WebApp.openModal('ModalShowKeys.html');
        },
getTimeDiff:function(start,now){return (now-start);},
//ENCRYPTION
        _keyWords:[],
        getKey:function(){
            return WebApp._keyWords.join(' ');
        },
        generateKey:function(){
            WebApp._keyWords=['aaa','bbb','ccc','ddd'];
        },
        encryptSelectedFiles:function(){
          return EncryptSrv.encryptArrFiles(WebApp.selectedFiles,WebApp.getKey());
        },
        decryptFiles:function(){
          WebApp.showDecryptLoader=true;
          EncryptSrv.decryptFiles(WebApp.encryptedFiles,WebApp.getKey()).then(function(urls){
console.log(urls);
            WebApp.ViewerApp.loadURLs(urls);
            WebApp.modals.InsertKeys.close();
          });
        },
        handleFiles:function(){
            WebApp.showFileinput=false;
            WebApp.showFileinputLoader=true;
            //show files in viewer
            WebApp.ViewerApp.loadURLs(WebApp.selectedFiles);

            WebApp.ViewerApp.App.addEventListener("load-end",function(){
              WebApp.encryptSelectedFiles().then(function(encryptedFiles){
                WebApp.encryptedFiles=encryptedFiles;
                WebApp.showFileinputLoader=false;
                WebApp.showSaveBtn=true;
                $rootScope.$digest();
              });
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
        WebApp.showFileinput=false;
        WebApp.loadResource(hash[1]);
    }

    $rootScope.$watch('WebApp.selectedFiles',function(data){ //selected files, begin encrypt
        if(data && data.length){WebApp.handleFiles();}
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
    scope:{selectedFiles:"=",},
    link:function(scope, element, attributes){
      element.bind("change", function(e){
        FileSrv.readUploadedFiles(e.target.files).then(function(files){
          scope.$apply(function(){
            scope.selectedFiles=files;
          });
        });
      });
    }
  };
})
;
