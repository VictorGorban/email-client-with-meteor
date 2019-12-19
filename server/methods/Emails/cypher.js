let crypto = require('crypto')

Meteor.methods({
                 cypherAndSignEmail(email, passphrase, rsaPublicKey, dsaPrivateKey) {
                   const algorithm = 'aes-192-cbc';

                   let doEncrypt = function (text) {
                     const iv = crypto.randomBytes(16); // Initialization vector.
                     const key = crypto.scryptSync(passphrase, crypto.randomBytes(4), 24); // соль тут для галочки

                     console.log('key: ' + key);

                     // return ;
                     let encryptedKey = crypto.publicEncrypt(rsaPublicKey, Buffer.from(key)); // потом мы шифруем сообщение этим зашифрованным ключом
                     const cipher = crypto.createCipheriv(algorithm, key, iv);

                     console.log('encrypting...');
                     console.log('iv: ' + new Uint8Array(iv));
                     console.log('key: ' + key.toString());

                     let encrypted = cipher.update(text, 'utf8', 'hex');
                     encrypted += cipher.final('hex'); // шифруем как hex

                     let doDecrypt = function (obj) {
                       const iv = obj.iv; // Initialization vector.
                       const encryptedKey = obj.encryptedKey;


                       console.log('decrypting...');
                       console.log('iv: ' + iv);
                       console.log('key: ' + key);


                       const decipher = crypto.createDecipheriv(algorithm, key, iv);

                       let decrypted = decipher.update(obj.content, 'hex', 'utf8');
                       decrypted += decipher.final('utf8'); // дешифруем как utf8
                       // console.log(encrypted);


                       console.log('wow, decrypted');

                       return decrypted;
                     };

                     let encryptedResult = {
                       iv: iv,
                       content: encrypted,
                       encryptedKey: encryptedKey,
                     };

                     let decryptedResult = doDecrypt(encryptedResult);

                     return decryptedResult;
                   };


                   email.html = doEncrypt(email.html);

                   // console.log(email.html);

                   // для каждого приложения, шифруем содержимое
                   // for (let i = 0; i < email.attachments.length; i++) {
                   //   email.attachments[i].content = doCypher(email.attachments[i].content, passphrase);
                   // }

                   // а еще sign

                   return email;
                   // try to decrypt?


                 },

                 decipherAndVerifyEmail(email, passphrase, rsaPrivateKey, dsaPublicKey) {
                   // console.log(rsaPrivateKey.length);
                   // проблема: как юзать rsa для шифрования ключа aes, если ключ при public и private получается разный? И при этом какой смысл шифровать голую passPhrase, если public key и так есть? Тогда при наличии public мы дешифруем вообще все.
                   // если просто шифровать в 2 уровня: message -> aes(passphrase) -> res(public), то все понятно. res(private)-> aes(passphrase) -> message
                   // шифровать ключ aes? passphrase -> res(public) -> aes. passphrase-> res(private) -> aes  :не работает.


                   const algorithm = 'aes-192-cbc';
// Use the async `crypto.scrypt()` instead.
// Use `crypto.randomBytes` to generate a random iv instead of the static iv
// shown here.

                   let doDecipher = function (obj) {
                     const iv = obj.iv; // Initialization vector.
                     const encryptedKey = obj.encryptedKey;

                     const key = crypto.privateDecrypt(rsaPrivateKey, Buffer.from(encryptedKey)).toString();

                     // return ;

                     console.log('decrypting...');
                     console.log('iv: ' + iv);
                     console.log('key: ' + key);


                     return;
                     const decipher = crypto.createDecipheriv(algorithm, key, iv);

                     let decrypted = decipher.update(obj.content, 'hex', 'utf8');
                     decrypted += decipher.final('utf8'); // дешифруем как utf8
                     // console.log(encrypted);

                     return decrypted;
                   };

                   email.html = doDecipher(email.html);

                   // для каждого приложения, дешифруем содержимое
                   // for (let i = 0; i < email.attachments.length; i++) {
                   //   email.attachments[i].content = doDecipher(email.attachments[i].content, passphrase);
                   // }

                   // а еще sign
                   return email;
                   // try to decrypt?


                 },

                 generateKeys() {
                   // синхронно. Надо сделать async, ибо долго
                   let rsa = Meteor.call('generateRsaKeyPair');
                   let dsa = Meteor.call('generateDsaKeyPair');

                   return {
                     rsa: rsa,
                     dsa: dsa,
                   }
                 },

                 generateRsaKeyPair() {
                   const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                     modulusLength: 2048,
                     publicKeyEncoding: {
                       type: 'spki',
                       format: 'pem',
                     },
                     privateKeyEncoding: {
                       type: 'pkcs8',
                       format: 'pem',
                     },
                   });

                   // console.log(privateKey, publicKey);

                   return {
                     private: privateKey,
                     public: publicKey,
                   }
                 },
                 generateDsaKeyPair() {
                   const {privateKey, publicKey} = crypto.generateKeyPairSync('dsa', {
                     modulusLength: 2048,
                     publicKeyEncoding: {
                       type: 'spki',
                       format: 'pem',
                     },
                     privateKeyEncoding: {
                       type: 'pkcs8',
                       format: 'pem',
                     },
                   });

                   // console.log(privateKey, publicKey);

                   return {
                     private: privateKey,
                     public: publicKey,
                   }
                 },

               });