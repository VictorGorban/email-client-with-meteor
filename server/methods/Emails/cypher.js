let crypto = require('crypto')

Meteor.methods({
                 cypherAndSignEmail(email, passphrase, rsaPublicKey, dsaPrivateKey, dsaPublicKey) {
                   const algorithm = 'aes-192-cbc';

                   let doEncryptAndSign = function (text) {
                     // create sign from text
                     let signature;
                     const signer = crypto.createSign('SHA1');
                     signer.write(text);
                     signer.end();
                     signature = signer.sign(dsaPrivateKey, 'hex');


                     let iv = crypto.randomBytes(16); // Initialization vector.
                     iv = new Uint8Array(iv);
                     const key = crypto.scryptSync(passphrase, crypto.randomBytes(4), 24); // соль тут для галочки

                     console.log('key: ' + key);

                     // return ;
                     let encryptedKey = crypto.publicEncrypt(rsaPublicKey, Buffer.from(key)); // потом мы шифруем сообщение этим зашифрованным ключом
                     const cipher = crypto.createCipheriv(algorithm, key, iv);

                     console.log('encrypting...');
                     console.log('iv: ' + iv);
                     console.log('key: ' + key);

                     let encrypted = cipher.update(text, 'utf8', 'hex');
                     encrypted += cipher.final('hex'); // шифруем как hex


                     let encryptedResult = {
                       iv: new Uint8Array(iv),
                       content: encrypted,
                       encryptedKey: encryptedKey,
                       signature: signature,
                     };

                     return encryptedResult;
                   };


                   email.html = doEncryptAndSign(email.html);

                   // console.log(email.html);

                   // для каждого приложения, шифруем содержимое
                   for (let i = 0; i < email.attachments.length; i++) {
                     email.attachments[i].content = doEncryptAndSign(email.attachments[i].content);
                   }

                   // а еще sign

                   return email;
                   // try to decrypt?


                 },

                 decipherAndVerifyEmail(email, passphrase, rsaPrivateKey, dsaPublicKey) {
                   const algorithm = 'aes-192-cbc';

                   let doDecryptAndVerify = function (obj) {
                     const iv = obj.iv; // Initialization vector.
                     const encryptedKey = obj.encryptedKey;

                     const key = crypto.privateDecrypt(rsaPrivateKey, Buffer.from(encryptedKey));

                     const decipher = crypto.createDecipheriv(algorithm, key, iv);

                     let decrypted = decipher.update(obj.content, 'hex', 'utf8');
                     decrypted += decipher.final('utf8'); // дешифруем как utf8

                     const verify = crypto.createVerify('SHA1');
                     verify.write(decrypted);
                     verify.end();
                     let signature = obj.signature;
                     let verified = verify.verify(dsaPublicKey, signature, 'hex');

                     // для изображений false? Наверное, потому что я читаю их как текст

                     if (!verified) {
                       throw new Meteor.Error('Verify failed.');
                     }

                     console.log('wow, decrypted');

                     return decrypted;
                   };


                   email.html = doDecryptAndVerify(email.html);

                   // для каждого приложения, дешифруем содержимое
                   for (let i = 0; i < email.attachments.length; i++) {
                     email.attachments[i].content = doDecryptAndVerify(email.attachments[i].content);
                   }

                   return email;

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