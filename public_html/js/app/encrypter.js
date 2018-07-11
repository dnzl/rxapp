importScripts('../vendor/crypto.js');
var onmessage=function(msg){
  encryptFiles(msg.data.files,msg.data.key).then(function(encryptedFiles){
    postMessage(encryptedFiles);
  });
};

function encryptFiles(data,key){
  return new Promise(function(resolve,reject){
    var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data),key,{format:JsonFormatter});
    resolve(encrypted.toString());
  });

}
