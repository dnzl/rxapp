//check if browser supports file api and filereader features
if(!window.File || !window.FileReader || !window.FileList || !window.Blob){
    alert('The File APIs are not fully supported in this browser.');
}

dwv.image.decoderScripts = {
    "jpeg2000": "node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "node_modules/dwv/decoders/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js"
};

// base function to get elements
dwv.gui.getElement = dwv.gui.base.getElement;
dwv.gui.displayProgress = function (percent) {};

// create the dwv app
var app = new dwv.App();
// initialise with the id of the container div
app.init({
    "containerDivId": "dwv",
    "tools" : [
        "Scroll",
        "WindowLevel",
        "ZoomAndPan",
//        "Draw",
        "Livewire",
//        "Filter",
        "Floodfill"
    ],
});
// load dicom data

var _key='palabra1 palabra2 palabra3 palabra4';

function readFile(file){
    return new Promise(function(resolve,reject){
        var Reader=new FileReader();
        Reader.onload=function(){
            resolve(Reader.result);
        };
        Reader.readAsDataURL(file);
    });

}

function encryptFiles(files){
    readFile(files[0]).then(function(readFile){
        triplesec.encrypt({
            data:new triplesec.Buffer(readFile),
            key:new triplesec.Buffer(_key),
            progress_hook:function(obj){}
        },function(err,buff){
            if(!err){
                window.localStorage.setItem('encryptedFile',buff.toString('hex'));
            }
        });
    });

}

function decryptFiles(){
    var encryptedFile=window.localStorage.getItem('encryptedFile');

    triplesec.decrypt({
        data:new triplesec.Buffer(encryptedFile,'hex'),
        key:new triplesec.Buffer(_key),
        progress_hook:function(obj){}
    },function(err,buff){
        if(!err){
            var decrypted=buff.toString();
            app.loadURLs([decrypted]);
        }
    });
}

$(document).ready(function(){
    $('#input-file').change(function(){
        app.loadFiles(this.files);
        encryptFiles(this.files);
    });
});