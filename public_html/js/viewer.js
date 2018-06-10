dwv.image.decoderScripts = {
    "jpeg2000": "node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "node_modules/dwv/decoders/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js"
};

// base function to get elements
dwv.gui.getElement = dwv.gui.base.getElement;
dwv.gui.displayProgress = function (percent) {};

var ViewerApp=function(){
    var $this=this;

    $this.App=new dwv.App();

    $this.loadResourceLocally=function(id){
        return window.localStorage.getItem('encryptedFile');
    };
    $this.saveResourceLocally=function(resource){
        window.localStorage.setItem('encryptedFile',resource);
    };

    $this.loadResource=function(id){
        return new Promise(function(resolve,reject){
            reject({
                status:'error',
                msg:'tu vieja'
            });
            resolve({
                status:'success',
                id:id, //id server-side
                files:[], //files
            });
        });
    };
    $this.saveFiles=function(resource){
        return new Promise(function(resolve,reject){
            resolve({
                status:'success',
                id:'xyz' //id server-side
            });
        });
    };
    $this.loadURLs=function(urls){$this.App.loadURLs(urls);};
    $this.loadFiles=function(files){$this.App.loadFiles(files);};

    $this.readFile=function(file){
        return new Promise(function(resolve,reject){
            var Reader=new FileReader();
            Reader.onload=function(){resolve(Reader.result);};
            Reader.readAsDataURL(file);
        });
    };

    $this.encryptFiles=function(files,_key){
        $this.readFile(files[0]).then(function(readFile){
            triplesec.encrypt({
                data:new triplesec.Buffer(readFile),
                key:new triplesec.Buffer(_key),
                progress_hook:function(obj){}
            },function(err,buff){
                if(!err){
                    $this.saveResourceLocally(buff.toString('hex'));
                    $this.showSaveButton();
                }
            });
        });

    }

    $this.decryptFiles=function(_key){
        triplesec.decrypt({
            data:new triplesec.Buffer(encryptedFile,'hex'),
            key:new triplesec.Buffer(_key),
            progress_hook:function(obj){}
        },function(err,buff){
            if(!err){
                var decrypted=buff.toString();
                Viewer.loadURLs([decrypted]);
            }
        });
    }

    $this.showSaveButton=function(){
        document.getElementById('save-button').style.display='block';
    };

    $this.init=function(){
        // initialise with the id of the container div
        $this.App.init({
            "containerDivId":"dwv",
            "tools":[
                "Scroll",
//                "WindowLevel",
                "ZoomAndPan",
                //        "Draw",
//                "Livewire",
                //        "Filter",
//                "Floodfill"
            ],
        });
    };

    return $this;
};