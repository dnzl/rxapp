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


var iv = CryptoJS.enc.Hex.parse('101112131415161718191a1b1c1d1e1f');
data=CryptoJS.enc.Hex.parse('tuvieja');
//key=CryptoJS.enc.Hex.parse(key);
console.log(data,key);
    var encrypted = CryptoJS.AES.encrypt(data,key,{iv:iv});
console.log(encrypted.toString());
console.log(encrypted,key);
var decrypted = CryptoJS.AES.decrypt(encrypted,key,{iv:iv});
console.log(decrypted.words,decrypted.toString());
console.log('--------------------------');
var encrypted = CryptoJS.AES.encrypt("Message", "Secret Passphrase",{iv:iv});
console.log(encrypted.toString());
var decrypted = CryptoJS.AES.decrypt(encrypted, "Secret Passphrase",{iv:iv});
console.log(decrypted.toString());

var encrypted = CryptoJS.TripleDES.encrypt("Message", "Secret Passphrase",{iv:iv});
console.log(encrypted.toString());
var decrypted = CryptoJS.TripleDES.decrypt(encrypted, "Secret Passphrase",{iv:iv});
console.log(decrypted.toString());

    resolve(encrypted.toString());
  });

}
