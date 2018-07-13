importScripts('../vendor/crypto.js');
var onmessage=function(msg){
  decryptFiles(msg.data.files,msg.data.key,msg.data.iv).then(function(decryptedFiles){
    postMessage(decryptedFiles);
  }).catch(function(msg){
    postMessage('error');
  });
};

function decryptFiles(encrypted,key,iv){
  return new Promise(function(resolve,reject){
      var decrypted = CryptoJS.AES.decrypt(encrypted,key,{format:JsonFormatter,iv:iv});
      resolve(JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)));
  });
}
