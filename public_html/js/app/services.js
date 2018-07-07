WebsiteApp.factory('EncryptSrv',function(){
  var $this=this;

  $this.arrFiles=[];
  $this.arrEncryptedFiles=[];
  $this.key='';

  $this.encryptFile=function(file,key){
    return new Promise(function(resolve,reject){
      try{
        var a=CryptoJS.AES.encrypt(file,key);
        resolve(a.toString());
      }catch(e){
        reject(e);
      }
    });
  };

  $this.decryptFile=function(file,key){
    return new Promise(function(resolve,reject){
      resolve(CryptoJS.AES.decrypt(file,key).toString());
    });
  };



$this.chunkSize = 1024*1024;
$this.timeout = 10;
$this.lastOffset = 0;
$this.chunkReorder = 0;
$this.chunkTotal = 0;
// time reordering
$this.callbackRead_waiting=function(reader, file, evt, callbackProgress, callbackFinal){
    if($this.lastOffset === reader.offset){
//console.log("[",reader.size,"]",reader.offset,'->', reader.offset+reader.size,"");
        $this.lastOffset = reader.offset+reader.size;
        $this.callbackProgress(evt.target.result);
        if ( reader.offset + reader.size >= file.size ){
            $this.lastOffset = 0;
            $this.callbackFinal();
        }
        $this.chunkTotal++;
    } else {
//console.log("[",reader.size,"]",reader.offset,'->', reader.offset+reader.size,"wait");
        setTimeout(function () {
            $this.callbackRead_waiting(reader,file,evt, callbackProgress, callbackFinal);
        }, timeout);
        $this.chunkReorder++;
    }
}
// memory reordering
$this.previous = [];
$this.callbackRead_buffered=function(reader, file, evt, callbackProgress, callbackFinal){
    $this.chunkTotal++;

    if($this.lastOffset !== reader.offset){
        // out of order
//console.log("[",reader.size,"]",reader.offset,'->', reader.offset+reader.size,">>buffer");
        $this.previous.push({ offset: reader.offset, size: reader.size, result: reader.result});
        $this.chunkReorder++;
        return;
    }

    function parseResult(offset, size, result) {
        $this.lastOffset = offset + size;
        callbackProgress(result);
        if (offset + size >= file.size) {
            $this.lastOffset = 0;
            callbackFinal();
        }
    }

    // in order
//    console.log("[",reader.size,"]",reader.offset,'->', reader.offset+reader.size,"");
    parseResult(reader.offset, reader.size, reader.result);

    // resolve previous buffered
    var buffered = [{}]
    while (buffered.length > 0) {
        buffered = $this.previous.filter(function(item){
            return item.offset===$this.lastOffset;
        });
        buffered.forEach(function (item) {
//console.log("[", item.size, "]", item.offset, '->', item.offset + item.size, "<<buffer");
            parseResult(item.offset, item.size, item.result);
            $this.previous.remove(item);
        });
    }
};
$this.callbackRead=function(obj, file, evt, callbackProgress, callbackFinal){
    $this.callbackRead_buffered(obj, file, evt, callbackProgress, callbackFinal);
    //$this.callbackRead_waiting(obj, file, evt, callbackProgress, callbackFinal);
}
$this.loading=function(file, callbackProgress, callbackFinal) {
    var offset=0;
    var size=$this.chunkSize;
    var partial;
    var index = 0;
    if(file.size===0){callbackFinal();}
    while (offset < file.size) {
        partial = file.slice(offset, offset+size);
        var reader = new FileReader;
        reader.size = $this.chunkSize;
        reader.offset = offset;
        reader.index = index;
        reader.onload = function(evt) {
            $this.callbackRead(this, file, evt, callbackProgress, callbackFinal);
        };
        reader.readAsArrayBuffer(partial);
        offset += $this.chunkSize;
        index += 1;
    }
};
  $this.encryptFileByChunks=function(file,key){
    return new Promise(function(resolve,reject){
      var SHA256 = CryptoJS.algo.SHA256.create();
      var counter = 0;
      $this.loading(file,
          function(data){
            var wordBuffer = CryptoJS.lib.WordArray.create(data);
            SHA256.update(wordBuffer);
            counter += data.byteLength;
//console.log((( counter / file.size)*100).toFixed(0) + '%');
          }, function(data){
//console.log('100%');
              var encrypted = SHA256.finalize().toString();
              resolve(encrypted);
          });


    });
  };

  $this.decryptChunkedFile=function(file,key){
    return new Promise(function(resolve,reject){
//      resolve(CryptoJS.AES.decrypt(file,key).toString());
    });
  };

  //APPROACH: simulated synchronic
  $this.recEncryptArrFiles=function(i,arrEncryptedFiles){
    if(i===undefined){i=0;}
    if(arrEncryptedFiles===undefined){arrEncryptedFiles=[];}
    return new Promise(function(resolve,reject){
      $this.encryptFile($this.arrFiles[i],$this.key).then(function(encryptedFile){
        arrEncryptedFiles[i]=encryptedFile;
        if($this.arrFiles[i+1]!==undefined){
          resolve($this.recEncryptArrFiles(i+1,arrEncryptedFiles));
        }else{
          resolve(arrEncryptedFiles);
        }
      });
    });
  };
  $this.syncEncryptArrFiles=function(arrFiles,key){
    $this.arrFiles=arrFiles;
    $this.key=key;
    return $this.recEncryptArrFiles();
  };
  // end simulated synchronic

  //APPROACH: 100% sync
  $this.asyncEncryptArrFiles=function(arrFiles,key){
    var Promises=[];
    angular.forEach(arrFiles,function(file){
      Promises.push($this.encryptFile(file,key));
    });
    return Promise.all(Promises);
  };

  //APPROACH: meter todas las files en 1 solo string, encrypt entero
  $this.encryptArrAsSingleFile=function(arrFiles,key){
    var json=JSON.stringify(arrFiles);
    return $this.encryptFile(json,key);
  };

  //APPROACH: meter todas las files en 1 solo string, encrypt en chunks
  $this.encryptArrAsSingleChunkedFile=function(arrFiles,key){
    var json=JSON.stringify(arrFiles);
    var file=new File([json],'files.txt');
    return $this.encryptFileByChunks(file,key);
  };

  return $this;
})

.factory('FileSrv',function(){
    var $this=this;

    $this.saveFile=function(files){
      return $http.post('backend.php',{files:files});
    };
    $this.getFile=function(id){
      return $http.get('backend.php?id='+id);
    };

    //reads the uploaded files, returns a promise.all resolve all the files as array of dataurls
    $this.readUploadedFiles=function(fileList){
      var Promises=[];
      angular.forEach(fileList,function(file,i){
        Promises.push(new Promise(function(resolve){
          var reader=new FileReader();
          reader.onload=function(loadEvent){resolve(loadEvent.target.result);};
          reader.readAsDataURL(file);
        }));
      });
      return Promise.all(Promises);
    };

    return $this;
});
