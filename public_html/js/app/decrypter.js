importScripts('../vendor/crypto.js');
var onmessage=function(msg){
  decryptFiles(msg.data.files,msg.data.key).then(function(decryptedFiles){
    postMessage(decryptedFiles);
  });
};

function decryptFiles(encrypted,key){
  return new Promise(function(resolve,reject){
    var decrypted = CryptoJS.AES.decrypt(encrypted,key,{format:JsonFormatter});
    resolve(JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)));
  });
}
