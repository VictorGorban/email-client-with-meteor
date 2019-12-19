import '../commonFunctions'
import {Meteor} from 'meteor/meteor';

function showError(message) {
  toastr.error(message);
}

function showSuccess(message) {
  toastr.success(message);
}

function showInfo(message) {
  toastr.success(message);
}


Template.processMailModal.events({
                                   'click #browseProcessMail': function (e, t) {
                                     $('#fileProcessMail').click();
                                   },

                                   'change #fileProcessMail': async function (e, t) {
                                     {
                                       const fileToText = file => new Promise((resolve, reject) => {
                                         const reader = new FileReader();
                                         reader.onload = () => resolve(reader.result);
                                         reader.onerror = error => reject(error);
                                         reader.readAsText(file);
                                       });

                                       let file = e.currentTarget.files[0];
                                       let ejson = await fileToText(file);


                                       let email;
                                       try {
                                         email = EJSON.parse(ejson); // ejson - потому что нужен UTF8 array (binary)
                                       } catch (e) {
                                         showError('can\'t parse your message file. Maybe it\'s corrupted?');
                                         console.log(e);
                                         return;
                                       }

                                       // console.log(email);
                                       // return;

                                       Session.set('mailToProcess', email);


                                       // $('#processMailModal').modal();
                                     }
                                   },
                                   'click #saveProcessMail': function (e, t) {
                                     //  get email

                                     let email = Session.get('mailToProcess');

                                     // to string
                                     let json = EJSON.stringify(email);

                                     function download(filename, text) {
                                       var pom = document.createElement('a');
                                       pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                                       pom.setAttribute('download', filename);

                                       if (document.createEvent) {
                                         var event = document.createEvent('MouseEvents');
                                         event.initEvent('click', true, true);
                                         pom.dispatchEvent(event);
                                       } else {
                                         pom.click();
                                       }
                                     }

                                     download('email.txt', json)

                                   },

                                   'click #processSend': async (e, t) => {
                                     e.preventDefault();


                                     let options = Session.get('thisAccount');
                                     let mail = Session.get('mailToProcess');

                                     function bytesToBase64(bytes) {
                                       const base64abc = (() => {
                                         let abc = [],
                                             A = 'A'.charCodeAt(0),
                                             a = 'a'.charCodeAt(0),
                                             n = '0'.charCodeAt(0);
                                         for (let i = 0; i < 26; ++i) {
                                           abc.push(String.fromCharCode(A + i));
                                         }
                                         for (let i = 0; i < 26; ++i) {
                                           abc.push(String.fromCharCode(a + i));
                                         }
                                         for (let i = 0; i < 10; ++i) {
                                           abc.push(String.fromCharCode(n + i));
                                         }
                                         abc.push('+');
                                         abc.push('/');
                                         return abc;
                                       })();
                                       let result = '', i, l = bytes.length;
                                       for (i = 2; i < l; i += 3) {
                                         result += base64abc[bytes[i - 2] >> 2];
                                         result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
                                         result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
                                         result += base64abc[bytes[i] & 0x3F];
                                       }
                                       if (i === l + 1) { // 1 octet missing
                                         result += base64abc[bytes[i - 2] >> 2];
                                         result += base64abc[(bytes[i - 2] & 0x03) << 4];
                                         result += '==';
                                       }
                                       if (i === l) { // 2 octets missing
                                         result += base64abc[bytes[i - 2] >> 2];
                                         result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
                                         result += base64abc[(bytes[i - 1] & 0x0F) << 2];
                                         result += '=';
                                       }
                                       return result;
                                     }

                                     mail.attachments.forEach(att => att.content = bytesToBase64(att.content)); // binary uint8Array to base64
                                     mail.from = Session.get('thisAccount').user;

                                     console.log(mail);
                                     // return;

                                     Meteor.call('sendMessage', Session.get('thisBox'), options, mail, (err, res) => {
                                       if (err) {
                                         showError('can\'t submit the message. Check your credentials');
                                       }
                                       if (res) {
                                         showSuccess(res);
                                       }
                                     });

                                   },

                                   'click #generateKeys': async (e, t) => {
                                     e.preventDefault();

                                     Meteor.call('generateKeys', (err, keys) => {
                                       if (err) {
                                         showError('can\'t generate the keys for some reason');
                                       }
                                       if (keys) {

                                         Session.set('keys', keys);
                                       }
                                     });

                                   },

                                   'click #cypherProcessMail': async (e, t) => {
                                     e.preventDefault();


                                     let passphrase = $('#passPhrase').val().trim();
                                     if (!passphrase) {
                                       showError('Please set the pass phrase');
                                       return;
                                     }
                                     let keys = Session.get('keys');
                                     if (!keys) {
                                       showError('Looks like you don\'t have keys. Import them or generate');
                                       return;
                                     }

                                     Meteor.call('cypherAndSignEmail', Session.get('mailToProcess'), passphrase, keys.rsa.public, keys.dsa.private, keys.dsa.public, (err, mail) => {
                                       if (err) {
                                         showError('can\'t cypher you mail');
                                       }
                                       if (mail) {
                                         Session.set('mailToProcess', mail);
                                       }
                                     });

                                   },

                                   'click #decipherProcessMail': async (e, t) => {
                                     e.preventDefault();


                                     let passphrase = $('#passPhrase').val().trim();
                                     if (!passphrase) {
                                       showError('Please set the pass phrase');
                                       return;
                                     }
                                     let keys = Session.get('keys');
                                     if (!keys) {
                                       showError('Looks like you don\'t have keys. Import them or generate');
                                       return;
                                     }

                                     Meteor.call('decipherAndVerifyEmail', Session.get('mailToProcess'), passphrase, keys.rsa.private, keys.dsa.public, (err, mail) => {
                                       if (err) {
                                         console.log(err);
                                         if (err.error !== 500) {
                                           showError(err.error);
                                           return;
                                         }
                                         showError('can\'t decipher you mail');
                                       }
                                       if (mail) {
                                         Session.set('mailToProcess', mail);
                                       }
                                     });

                                   },

                                   'click #exportKeys': async (e, t) => {
                                     e.preventDefault();
                                     let keys = Session.get('keys');

                                     let json = EJSON.stringify(keys);

                                     function download(filename, text) {
                                       var pom = document.createElement('a');
                                       pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                                       pom.setAttribute('download', filename);

                                       if (document.createEvent) {
                                         var event = document.createEvent('MouseEvents');
                                         event.initEvent('click', true, true);
                                         pom.dispatchEvent(event);
                                       } else {
                                         pom.click();
                                       }
                                     }

                                     download('keys.txt', json)
                                   },

                                   'click #exportKeysToDecipherAndVerify': async (e, t) => {
                                     e.preventDefault();
                                     let keys = Session.get('keys');
                                     keys.rsa.public = undefined;
                                     keys.dsa.private = undefined;

                                     let json = EJSON.stringify(keys);

                                     function download(filename, text) {
                                       var pom = document.createElement('a');
                                       pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                                       pom.setAttribute('download', filename);

                                       if (document.createEvent) {
                                         var event = document.createEvent('MouseEvents');
                                         event.initEvent('click', true, true);
                                         pom.dispatchEvent(event);
                                       } else {
                                         pom.click();
                                       }
                                     }

                                     download('keys.txt', json)
                                   },
                                   'click #exportKeysToCypherAndSign': async (e, t) => {
                                     e.preventDefault();
                                     let keys = Session.get('keys');
                                     keys.rsa.private = undefined;
                                     keys.dsa.public = undefined;

                                     let json = EJSON.stringify(keys);

                                     function download(filename, text) {
                                       var pom = document.createElement('a');
                                       pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                                       pom.setAttribute('download', filename);

                                       if (document.createEvent) {
                                         var event = document.createEvent('MouseEvents');
                                         event.initEvent('click', true, true);
                                         pom.dispatchEvent(event);
                                       } else {
                                         pom.click();
                                       }
                                     }

                                     download('keys.txt', json)
                                   },

                                   'click #exportPublicKeys': async (e, t) => {
                                     e.preventDefault();
                                     let keys = Session.get('keys');
                                     keys.rsa.private = undefined;
                                     keys.dsa.private = undefined; // убираем из объекта лишнее

                                     let json = EJSON.stringify(keys);

                                     function download(filename, text) {
                                       var pom = document.createElement('a');
                                       pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                                       pom.setAttribute('download', filename);

                                       if (document.createEvent) {
                                         var event = document.createEvent('MouseEvents');
                                         event.initEvent('click', true, true);
                                         pom.dispatchEvent(event);
                                       } else {
                                         pom.click();
                                       }
                                     }

                                     download('public keys.txt', json)
                                   },

                                   'click #importKeys': async (e, t) => {
                                     e.preventDefault();

                                     $('#importKeysFile').click();
                                   },

                                   'change #rsaPublicKey': function (e, t) {
                                     let key = e.currentTarget.value;
                                     let keys = Session.get('keys');
                                     if (!keys) {
                                       keys = {
                                         rsa: {},
                                         dsa: {},
                                       };
                                     } else {
                                       if (!keys.rsa) {
                                         keys.rsa = {};
                                       }
                                       if (!keys.dsa) {
                                         keys.dsa = {};
                                       }
                                     }

                                     keys.rsa.public = key;
                                     Session.set('keys', keys)
                                   },

                                   'change #dsaPublicKey': function (e, t) {
                                     let key = e.currentTarget.value;
                                     let keys = Session.get('keys');
                                     if (!keys) {
                                       keys = {
                                         rsa: {},
                                         dsa: {},
                                       };
                                     } else {
                                       if (!keys.rsa) {
                                         keys.rsa = {};
                                       }
                                       if (!keys.dsa) {
                                         keys.dsa = {};
                                       }
                                     }

                                     keys.dsa.public = key;
                                     Session.set('keys', keys)
                                   },

                                   'change #rsaPrivateKey': function (e, t) {
                                     let key = e.currentTarget.value;
                                     let keys = Session.get('keys');
                                     if (!keys) {
                                       keys = {
                                         rsa: {},
                                         dsa: {},
                                       };
                                     } else {
                                       if (!keys.rsa) {
                                         keys.rsa = {};
                                       }
                                       if (!keys.dsa) {
                                         keys.dsa = {};
                                       }
                                     }

                                     keys.rsa.private = key;
                                     Session.set('keys', keys)
                                   },

                                   'change #dsaPrivateKey': function (e, t) {
                                     let key = e.currentTarget.value;
                                     let keys = Session.get('keys');
                                     if (!keys) {
                                       keys = {
                                         rsa: {},
                                         dsa: {},
                                       };
                                     } else {
                                       if (!keys.rsa) {
                                         keys.rsa = {};
                                       }
                                       if (!keys.dsa) {
                                         keys.dsa = {};
                                       }
                                     }

                                     keys.dsa.private = key;
                                     Session.set('keys', keys)
                                   },

                                   'change #importKeysFile': async function (e, t) {
                                     {
                                       const fileToText = file => new Promise((resolve, reject) => {
                                         const reader = new FileReader();
                                         reader.onload = () => resolve(reader.result);
                                         reader.onerror = error => reject(error);
                                         reader.readAsText(file);
                                       });

                                       let file = e.currentTarget.files[0];
                                       let ejson = await fileToText(file);


                                       let keys;
                                       try {
                                         keys = EJSON.parse(ejson); // ejson на всякий случай
                                       } catch (e) {
                                         showError('can\'t parse your keys file. Maybe it\'s corrupted?');
                                         console.log(e);
                                         return;
                                       }


                                       Session.set('keys', keys);
                                     }
                                   },
                                 });

Template.processMailModal.helpers({
                                    keys() {
                                      return Session.get('keys');
                                    },
                                    thisMail() {
                                      return Session.get('mailToProcess');
                                    },

                                    getHtml(html) {
                                      if (typeof html == 'object') {
                                        return EJSON.stringify(html);
                                      }
                                      return html;
                                    },

                                    hasAttachment: function (email) {
                                      // console.log(email.from);
                                      // console.log(email.attachments);
                                      if (email.attachments && email.attachments.length > 0) {
                                        console.log(email.subject);
                                      }
                                      // console.log(Template.instance());
                                      // console.log(Template.instance().actionCondition.get());
                                      return email.attachments && email.attachments.length > 0;
                                    },
                                    attachmentsCount(email) {
                                      return email.attachments.length;
                                    },
                                    getAttachmentUrl(attachment) {
                                      if (!attachment.content) {
                                        return;
                                      }

                                      var getObjectUrl, getDownloadLink;

                                      getObjectUrl = function (arr, fileName, mimeType) {
                                        var blob, url;
                                        blob = new Blob([arr], {
                                          type: mimeType,
                                        });
                                        url = window.URL.createObjectURL(blob);
                                        return url;
                                      };


                                      return getObjectUrl(attachment.content, attachment.filename, attachment.contentType);
                                    },
                                    date(email) {
                                      return email.date ? email.date.toDateString() : new Date().toDateString();
                                    },
                                    unread(email) {
                                      return email.flags.includes('\\Seen') ? '' : 'unread';
                                    },

                                  })