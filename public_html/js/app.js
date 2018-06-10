/**
 * in this file:
 * transactions btwn app (whole website) & btwn app ctrls and viewerApp
 */
//check if browser supports file api and filereader features
if(!window.File || !window.FileReader || !window.FileList || !window.Blob){
    alert('The File APIs are not fully supported in this browser.');
}

var _key='palabra1 palabra2 palabra3 palabra4';

var App=new ViewerApp();

var SiteCtrl=function(){

};





$(document).ready(function(){
    new SiteApp=new SiteCtrl();
    App.init();

    var hash=window.location.hash.split('='); //url.com/#key=HASH
    if(hash.length && hash[1]!==undefined && hash[1].length){
        App.loadResource(hash[1]).then(function(r,a,b,c){
console.log(r);
            $('#modal-insert-keys').modal('show');
        },function(a,b,c){
console.log('error',a,b,c);
        });
    }

    $('#input-file').change(function(){
        App.loadFiles(this.files);
        App.encryptFiles(this.files,_key);
    });
    $('#save-button').click(function(){
        App.saveFilesToServer();
    });

    $('#see-files').click(function(){
        //[TODO] disable btn, show load while working
        var keys=[];
        $('#form-passworts input.input-passwort').map(function(i,input){keys.push($(this).val());});
        var _key=keys.join(' ');
        App.desencryptFiles(_key);
    });
});