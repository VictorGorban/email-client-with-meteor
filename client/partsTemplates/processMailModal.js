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

                                     Meteor.call('cypherAndSignEmail', Session.get('mailToProcess'), passphrase, keys.rsa.public, keys.dsa.private, (err, mail) => {
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