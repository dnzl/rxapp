// Default colour maps.
dwv.tool.colourMaps = {
    "plain": dwv.image.lut.plain,
    "invplain": dwv.image.lut.invPlain,
    "rainbow": dwv.image.lut.rainbow,
    "hot": dwv.image.lut.hot,
    "hotiron": dwv.image.lut.hot_iron,
    "pet": dwv.image.lut.pet,
    "hotmetalblue": dwv.image.lut.hot_metal_blue,
    "pet20step": dwv.image.lut.pet_20step
};

dwv.image.decoderScripts = {
    "jpeg2000": "node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "node_modules/dwv/decoders/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js"
};

// base function to get elements
dwv.gui.getElement=dwv.gui.base.getElement;
dwv.gui.displayProgress=function(percent){};
dwv.gui.getWindowSize = function () {
  var a=angular.element(document.getElementById(id)).clientWidth;
  console.log(a);
    return { 'width': 200, 'height':200 };
};

var ViewerApp=function(){
    var $this=this;

    // Focus
    dwv.gui.focusImage = dwv.gui.base.focusImage;
    // get element
    dwv.gui.getElement = dwv.gui.base.getElement;
    // refresh
    dwv.gui.refreshElement = dwv.gui.base.refreshElement;

    // post process table
    dwv.gui.postProcessTable = dwv.gui.base.postProcessTable;
    // Tags table
    dwv.gui.DicomTags = dwv.gui.base.DicomTags;
    // DrawList table
    dwv.gui.DrawList = dwv.gui.base.DrawList;

    // Loaders
    dwv.gui.Loadbox = dwv.gui.base.Loadbox;
    // File loader
    dwv.gui.FileLoad = dwv.gui.base.FileLoad;
    // File loader
    dwv.gui.FolderLoad = dwv.gui.base.FolderLoad;
    // Url loader
    dwv.gui.UrlLoad =  dwv.gui.base.UrlLoad;

    //Window/level
    dwv.gui.WindowLevel = dwv.gui.base.WindowLevel;
    // Draw
    dwv.gui.Draw = dwv.gui.base.Draw;
    // ColourTool
    dwv.gui.ColourTool = dwv.gui.base.ColourTool;
    // ZoomAndPan
    dwv.gui.ZoomAndPan = dwv.gui.base.ZoomAndPan;
    // Scroll
    dwv.gui.Scroll = dwv.gui.base.Scroll;
    // Filter
    dwv.gui.Filter = dwv.gui.base.Filter;

    // Filter: threshold
    dwv.gui.Threshold = dwv.gui.base.Threshold;
    // Filter: sharpen
    dwv.gui.Sharpen = dwv.gui.base.Sharpen;
    // Filter: sobel
    dwv.gui.Sobel = dwv.gui.base.Sobel;

    // Undo/redo
    dwv.gui.Undo = dwv.gui.base.Undo;

    // Version
    dwv.gui.appendVersionHtml = dwv.gui.base.appendVersionHtml;

    dwv.gui.Slider = function (app)
    {
        this.append = function ()
        {
            // nothing to do
        };
        this.initialise = function ()
        {
            var min = app.getImage().getDataRange().min;
            var max = app.getImage().getDataRange().max;

            // jquery-ui slider
            $( ".thresholdLi" ).slider({
                range: true,
                min: min,
                max: max,
                values: [ min, max ],
                slide: function( event, ui ) {
                    app.onChangeMinMax(
                            {'min':ui.values[0], 'max':ui.values[1]});
                }
            });
        };
    };

    // plot
    dwv.gui.plot = function (div, data, options)
    {
return;
        var plotOptions = {
            "bars": { "show": true },
            "grid": { "backgroundcolor": null },
            "xaxis": { "show": true },
            "yaxis": { "show": false }
        };
        if (typeof options !== "undefined" &&
            typeof options.markings !== "undefined") {
            plotOptions.grid.markings = options.markings;
        }
console.log(div,data,plotOptions);
return;
        $.plot(div, [ data ], plotOptions);
    };

    dwv.gui.setup = function(){
    };

    dwv.gui.setup();

    // Toolbox
    dwv.gui.Toolbox = function (app)
    {
        var base = new dwv.gui.base.Toolbox(app);

        this.setup = function(list)
        {
//            base.setup(list);
        }

        this.display = function (bool)
        {
//            base.display(bool);
        };
        this.initialise = function (list)
        {
//            base.initialise(list);
        };
      };

      dwv.i18nOnInitialised( function () {
      //  dwv.gui.info.overlayMaps=false;
        i18nInitialised=true;
      //  launchApp();
        // return;
          // call next once the overlays are loaded
          var onLoaded = function (data) {
            console.log(data);
              dwv.gui.info.overlayMaps = data;
              i18nInitialised = true;
              launchApp();
          };
          // load overlay map info
          $.getJSON( dwv.i18nGetLocalePath("overlays.json"), onLoaded )
          .fail( function () {
              console.log("Using fallback overlays.");
              $.getJSON( dwv.i18nGetFallbackLocalePath("overlays.json"), onLoaded );
          });
      });

        // check browser support
        dwv.browser.check();
        // initialise i18n
        dwv.i18nInitialise("auto", "js/locales");


    $this.loadURLs=function(urls){$this.App.loadURLs(urls);};
    $this.loadFiles=function(files){$this.App.loadFiles(files);};

    $this.init=function(){

        $this.App=new dwv.App();

        var options = {
            "containerDivId": "dwv",
            "fitToWindow": false,
            "gui": [
              "tool",
//              "load",
              "undo",
              "version",
              "tags",
              "drawList"
          ],
//            "loaders": ["File", "Url"],
            "tools": [
              "Scroll",
              "WindowLevel",
              "ZoomAndPan",
              "Draw",
              "Livewire",
              "Filter",
              "Floodfill",
            ],
            "filters": ["Threshold", "Sharpen", "Sobel"],
            "shapes": ["Arrow", "Ruler", "Protractor", "Rectangle", "Roi", "Ellipse", "FreeHand"],
            "isMobile": false,
    //        "helpResourcesPath": "resources/help"
        };
        if(dwv.browser.hasInputDirectory()){
//            options.loaders.splice(1, 0, "Folder");
        }

        $this.App.init(options);

    };

    $this.init();

    return $this;
};
