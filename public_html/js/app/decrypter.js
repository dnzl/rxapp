importScripts('../vendor/crypto.js');
var onmessage=function(msg){
  decryptFile(msg.data.file,msg.data.key,msg.data.iv).then(function(decryptedFile){
    postMessage(decryptedFile);
  }).catch(function(msg){
    postMessage('error');
  });
};

function decryptFile(encrypted,key,iv){
  return new Promise(function(resolve,reject){
      var decrypted = CryptoJS.AES.decrypt(encrypted,key,{format:JsonFormatter,iv:iv});
      resolve(JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)));
  });
}
