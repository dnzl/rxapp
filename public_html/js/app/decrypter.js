importScripts('../vendor/crypto.js');
var onmessage=function(msg){
  decryptFiles(msg.data.files,msg.data.key).then(function(decryptedFiles){
console.log(decryptedFiles);
    postMessage(decryptedFiles);
  });
};

function decryptFiles(encryptedFiles,key){
console.log(encryptedFiles,key);
  return new Promise(function(resolve,reject){
    var decrypted = CryptoJS.AES.decrypt(encryptedFiles,key);
console.log(decrypted);
    resolve(decrypted.toString());
  });
}
