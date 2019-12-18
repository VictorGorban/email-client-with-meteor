let crypto = require('crypto')

Meteor.methods({
                 cypherAndSignEmail(emailId, passphrase, rsaPublicKey, dsaPrivateKey) {
                   let email = Emails.findOne(emailId);
                   if (!email)
                     return new Meteor.Error('email not found');
                   passphrase = crypto.publicEncrypt(rsaPublicKey, Buffer.from(passphrase));

                   let html = email.html;
                   let attachments = email.attachments;
                   attachments = JSON.stringify(attachments);

                   const algorithm = 'aes-192-cbc';
                   const password = 'Password used to generate key';
// Use the async `crypto.scrypt()` instead.
                   const key = crypto.scryptSync(passphrase, 'salt', 24);
// Use `crypto.randomBytes` to generate a random iv instead of the static iv
// shown here.
                   const iv = crypto.randomBytes(16); // Initialization vector.

                   const cipher = crypto.createCipheriv(algorithm, key, iv);


                   let encrypted = cipher.update(html, 'utf8', 'hex');
                   encrypted += cipher.final('hex');
                   console.log(encrypted);



                   return 'encrypted';

                   email.html = html;
                   email.attachments = attachments;
                   email.iv = iv;

                   // а еще sign
                   return email;
                   // try to decrypt?
// Prints: e5f79c5915c02171eec6b212d5520d44480993d7d622a7c4c2da32f6efda0ffa


                 },

                 generateRsaKeyPair() {
                   const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                     modulusLength: 2048,
                     publicKeyEncoding: {
                       type: 'spki',
                       format: 'pem'
                     },
                     privateKeyEncoding: {
                       type: 'pkcs8',
                       format: 'pem'
                     }
                   });

                   console.log(privateKey, publicKey);

                   return {private: privateKey, public: publicKey}
                 },
                 generateDsaKeyPair() {
                   const { privateKey, publicKey } = crypto.generateKeyPairSync('dsa', {
                     modulusLength: 2048,
                     publicKeyEncoding: {
                       type: 'spki',
                       format: 'pem'
                     },
                     privateKeyEncoding: {
                       type: 'pkcs8',
                       format: 'pem'
                     }
                   });

                   console.log(privateKey, publicKey);

                   return {private: privateKey, public: publicKey}
                 },

               });