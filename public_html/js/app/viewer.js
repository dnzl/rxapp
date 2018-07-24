dwv.utils.decodeQuery = dwv.utils.base.decodeQuery;
dwv.gui.getElement = dwv.gui.base.getElement;
dwv.gui.refreshElement = dwv.gui.base.refreshElement;
dwv.gui.Scroll = dwv.gui.base.Scroll;
dwv.gui.postProcessTable = dwv.gui.base.postProcessTable;
dwv.image.decoderScripts = {
    "jpeg2000": "node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "node_modules/dwv/decoders/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js"
};
dwv.gui.displayProgress = function(){};
dwv.gui.getWindowSize=function(){
  var h=window.innerHeight-147; /*if(h<500){h=500;}*/
  return {'width':window.innerWidth,'height':h};
};

WebsiteApp.directive('ngViewer',function(FileSrv,$rootScope,$filter,$timeout){
  return{
    scope:{arrFiles:"=",currentFile:'='},
    templateUrl:'viewer.html',
    link:function(scope, element, attributes){

      Split(['#app-main','#app-column'],{sizes:[70,30]});

      var ViewerApp={
        tools:[
          {label:'Scroll',value:'Scroll',ico:'clone'},
          {label:'Zoom/Pan',value:'ZoomAndPan',ico:'search-plus'},
          {label:'Levels',value:'WindowLevel',ico:'signal'},
  //        {label:'Draw',value:'Draw',ico:'pencil-alt'},
          {label:'Tags',value:'Tags',ico:'tags'},
          {label:'Info',value:'Info',ico:'info-circle',active:true},
        ],
        activeTool:'Scroll',
        changeTool:changeTool,
        openFile:openFile,
        showLoader:false,
      };

      dwv.gui.DicomTags=function(app){
        var base = new dwv.gui.base.DicomTags(app);
          this.update = function(tagsData){
            if(!tagsData || tagsData.length===0){
              getToolBtn('Tags').disabled=true; return;
            }
            getToolBtn('Tags').disabled=false;
            $rootScope.WebApp.tagsData=tagsData;
          };
      };

      function getToolBtn(toolname){
        return $filter('filter')(ViewerApp.tools, {value:toolname})[0];
      }

      function changeTool(e){
        var val=e.currentTarget.value;
        if(val=='Tags'){$rootScope.WebApp.showTagsModal();return;}
        if(val=='Info'){
          scope.dwvApp.onToggleInfoLayer();
          var btn=getToolBtn('Info'); btn.active=!btn.active;
          return;
        }
        ViewerApp.activeTool=val;
        scope.dwvApp.onChangeTool(e);
      }

      function openFile(file){scope.currentFile=file;}

      function loadFiles(files){
        ViewerApp.showLoader=true;
        $timeout(function(){
          scope.dwvApp.reset();
          scope.dwvApp.loadURLs(files);
        },500);
      }

      function onLoadedFiles(){
        scope.$apply(function(){
          ViewerApp.showLoader=false;
          //disable scroll btn if 1 slice
          if(scope.currentFile.fileData.length==1){
            getToolBtn('Scroll').disabled=true;
            ViewerApp.changeTool({currentTarget:{value:'ZoomAndPan'}});
          }else{
            getToolBtn('Scroll').disabled=false;
          }
        });
      }

      function initApp(){
        var dwvApp = new dwv.App();
        dwvApp.init({
          'containerDivId': 'app-main',
          'fitToWindow': true,
          "gui": [
//            "tool",
//              "load",
//            "undo",
//            "version",
            "tags",
//            "drawList"
        ],
          'tools': ['Scroll', 'ZoomAndPan','WindowLevel','Draw'],
          'shapes': ['Ruler'],
          'isMobile':false
        });

        dwvApp.addEventListener("load-end",onLoadedFiles);
        scope.dwvApp=dwvApp;
      }

      function createThumbnailApp(file){
        if(scope["thumbApp"+file.id]===undefined){
          var app=new dwv.App();
          app.init({"containerDivId": "app-thumb-"+file.id});
          app.loadURLs([file.fileData[0]]);
          scope["thumbApp"+file.id]=app;
        }
      };

      dwv.i18nOnInitialised(function(){
        dwv.gui.info.overlayMaps=false;
        FileSrv.get(dwv.i18nGetLocalePath("overlays.json")).then(function(r){
          dwv.gui.info.overlayMaps = r.data;
          initApp();
        });
      });

      dwv.browser.check();
      dwv.i18nInitialise("auto", "node_modules/dwv");

      scope.$watch('currentFile',function(data){
        if(data && !angular.equals(data,{})){
          loadFiles(scope.currentFile.fileData);
        }
      });

      scope.$on('renderThumbnailApps', function(ngRepeatFinishedEvent){
        angular.forEach(scope.arrFiles,function(file){
          createThumbnailApp(file);
        });
      });
      scope.ViewerApp=ViewerApp;
    }
  };
})
.directive('onFinishRender',function($timeout){
  return{
    restrict: 'A',
    link:function(scope,element,attr){
      if(scope.$last===true){
          $timeout(function(){scope.$emit(attr.onFinishRender);});
      }
    }
  }
});


/*
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


scroller pra pasar btwn slices
    var range = document.getElementById("sliceRange");
    range.min = 0;
    app.addEventListener("load-end", function () {
        range.max = app.getImage().getGeometry().getSize().getNumberOfSlices() - 1;
    });
    app.addEventListener("slice-change", function () {
        range.value = app.getViewController().getCurrentPosition().k;
    });
    range.oninput = function () {
        var pos = app.getViewController().getCurrentPosition();
        pos.k = this.value;
        app.getViewController().setCurrentPosition(pos);
    }
    */
/*
})
*/
