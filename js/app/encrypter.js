importScripts('../vendor/crypto.js');
var onmessage=function(msg){
  encryptFile(msg.data.file,msg.data.key,msg.data.iv).then(function(encryptedFile){
    postMessage(encryptedFile);
  }).catch(function(msg){
    postMessage('error');
  });
};

function encryptFile(data,key,iv){
  return new Promise(function(resolve,reject){
    var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data),key,{format:JsonFormatter,iv:iv});
    resolve(encrypted.toString());
  });

}
