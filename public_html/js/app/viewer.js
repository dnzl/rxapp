dwv.image.decoderScripts = {
    "jpeg2000": "node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "node_modules/dwv/decoders/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js"
};

// base function to get elements
dwv.gui.getElement = dwv.gui.base.getElement;
dwv.gui.displayProgress = function (percent){};

var ViewerApp=function(){
    var $this=this;

    $this.App=new dwv.App();

    $this.loadURLs=function(urls){$this.App.loadURLs(urls);};
    $this.loadFiles=function(files){$this.App.loadFiles(files);};

    $this.init=function(){
        // initialise with the id of the container div
        $this.App.init({
            "containerDivId":"dwv",
            "tools":[
                "Scroll",
                "WindowLevel",
//                "ZoomAndPan",
                //        "Draw",
//                "Livewire",
                //        "Filter",
//                "Floodfill"
            ],
        });
    };

    $this.init();

    return $this;
};
