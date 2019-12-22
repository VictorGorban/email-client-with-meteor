let crypto = require('crypto')

Meteor.methods({
    cypherAndSignEmail(email, passphrase, rsaPublicKey, dsaPrivateKey) {
        const algorithm = 'aes-192-cbc';

        let iv = crypto.randomBytes(16); // Initialization vector.
        iv = new Uint8Array(iv);
        const key = crypto.scryptSync(passphrase, crypto.randomBytes(4), 24); // соль тут для галочки

        console.log('key: ' + key);

        let encryptedKey = crypto.publicEncrypt(rsaPublicKey, Buffer.from(key)); // потом мы шифруем сообщение этим зашифрованным ключом

        let doEncryptAndSign = function (text) {
            //todo: один ключ и iv на все письмо.
            // create sign from text
            let signature;
            const signer = crypto.createSign('SHA1');
            signer.write(text);
            signer.end();
            signature = signer.sign(dsaPrivateKey, 'hex');

            const cipher = crypto.createCipheriv(algorithm, key, iv);
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


        email.html = email.html || "";
        email.attachments = email.attachments || [];

        let toEncrypt = {html: email.html, attachments: email.attachments};
        toEncrypt = EJSON.stringify(toEncrypt);

        email.html = EJSON.stringify(doEncryptAndSign(toEncrypt));
        email.attachments = [];

        // console.log(email.html);

        // для каждого приложения, шифруем содержимое

        // а еще sign

        return email;

    },

    decipherAndVerifyEmail(email, passphrase, rsaPrivateKey, dsaPublicKey) {
        const algorithm = 'aes-192-cbc';

        //todo см. encrypt
        email.html = EJSON.parse(email.html); // потому что нам сразу нужен html.iv, html.encryptedKey
        let encryptedKey = email.html.encryptedKey;
        let iv = email.html.iv;
        const key = crypto.privateDecrypt(rsaPrivateKey, Buffer.from(encryptedKey));
        let doDecryptAndVerify = function (obj) {
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

            return decrypted; // string
        };


        // email.html =

        let decrypted;
        try {
          decrypted = doDecryptAndVerify(email.html);
          decrypted = EJSON.parse(decrypted);
        }catch (e) {
          throw new Meteor.Error('email corrupt or not encrypted');
        }
        // для каждого приложения, дешифруем содержимое


        email.html = decrypted.html;
        email.attachments = decrypted.attachments;

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