importScripts('../vendor/crypto.js');
var onmessage=function(msg){
  encryptFiles(msg.data.files,msg.data.key).then(function(encryptedFiles){
console.log(encryptedFiles);
    postMessage(encryptedFiles);
  });
};

function encryptFiles(arrFiles,key){
  return new Promise(function(resolve,reject){
    var data=JSON.stringify(arrFiles);
console.log(data);
data='tuvieja';
    var encrypted = CryptoJS.AES.encrypt(data,key);
console.log(encrypted);
console.log(encrypted.toString());
    resolve(encrypted.toString());
  });
}
