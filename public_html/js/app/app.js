//check if browser supports file api and filereader features
if(!window.File || !window.FileReader || !window.FileList || !window.Blob){
    alert('The File APIs are not fully supported in this browser.');
}

var WebsiteApp=angular.module('rxModule', ['ui.bootstrap'])
.controller('BaseCtrl',function(){
    console.log('base ctrl');
})
.controller('ViewerCtrl',function(){
    console.log('viewer ctrl');
})
;