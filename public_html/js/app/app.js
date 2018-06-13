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

.factory('FileSrv',function(){
    var $this=this;

    $this.saveFile=function(encryptedFile){
//        $http.... send file to server
return new Promise(function(resolve,reject){
    resolve({
        id:'xxx',
    });
});
    };
    $this.getFile=function(id){
//        $http.... send file to server
return new Promise(function(resolve,reject){
    resolve({
        id:id,
        files:false,
    });
});
    };

    $this.encryptFile=function(file,key){
        return new Promise(function(resolve,reject){
            triplesec.encrypt({
                data:new triplesec.Buffer(file),
                key:new triplesec.Buffer(key),
                progress_hook:function(obj){}
            },function(err,buff){
                if(!err){
                    resolve(buff);
                }else{
                    reject(err);
                }
            });
        });
    };

    $this.decryptFile=function(file,key){
        return new Promise(function(resolve,reject){
            triplesec.decrypt({
                data:new triplesec.Buffer(file),
                key:new triplesec.Buffer(key),
                progress_hook:function(obj){}
            },function(err,buff){
                if(!err){
                    resolve(buff);
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
        generateUrl:function(){
            return '#k='+WebApp.idResource;
        },
        handleFile:function(){
            WebApp.showFileinput=false;
            WebApp.showFileinputLoader=true;
            //show files in viewer
            WebApp.ViewerApp.loadURLs([WebApp.selectedFiles]);
            //encrypt file
            FileSrv.encryptFile(WebApp.selectedFiles,WebApp.getKey()).then(function(buff){
                WebApp.encryptedFiles=buff;
                WebApp.showFileinputLoader=false;
                WebApp.showSaveBtn=true;
                $rootScope.$digest();
            });
        },
        saveFiles:function(){
            FileSrv.saveFile(WebApp.encryptedFiles).then(function(r){
                //show url/qr code & passworte
                WebApp.idResource=r.id;
                WebApp.resourceUrl=WebApp.generateUrl();
                WebApp.showSaveBtn=false;
                WebApp.showSeeKeysBtn=true;
                WebApp.showSeeKeysModal();
            });
        },
        decryptFiles:function(){
            FileSrv.decryptFile(WebApp.encryptedFiles,WebApp.getKey()).then(function(r){
console.log('decrypted, show in viewer!!',r);
            });
        },
        loadResource:function(id){
            FileSrv.getFile(id).then(function(r){
console.log(r);
                WebApp.encryptedFiles=r.files;
                WebApp.openModal('ModalInsertKeys.html');

            },function(){
//[TODO] handle nonextistent resource
            });
        },
    };

    var hash=window.location.hash.split('='); //url.com/#key=HASH
    if(hash.length && hash[1]!==undefined && hash[1].length){
        WebApp.showFileinput=false;
        WebApp.loadResource(hash[1]);
    }

    $rootScope.$watch('WebApp.selectedFiles',function(data){ //selected files, begin encrypt
        if(data){WebApp.handleFile(data);}
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

.directive('ngFileUploader', [function(){
    return{
        scope:{
            fileread:"="
        },
        link:function(scope, element, attributes){
            element.bind("change", function(changeEvent){
                var reader=new FileReader();
                reader.onload=function(loadEvent){
                    scope.$apply(function(){
                        scope.fileread=loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    };
}]);
;