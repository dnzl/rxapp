importScripts('../vendor/crypto.js');
var onmessage=function(msg){
  encryptFiles(msg.data.files,msg.data.key,msg.data.iv).then(function(encryptedFiles){
    postMessage(encryptedFiles);
  }).catch(function(msg){
    postMessage('error');
  });
};

function encryptFiles(data,key,iv){
  return new Promise(function(resolve,reject){
    var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data),key,{format:JsonFormatter,iv:iv});
    resolve(encrypted.toString());
  });

}
