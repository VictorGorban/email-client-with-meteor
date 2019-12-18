import '../commonFunctions'
import {Meteor} from 'meteor/meteor';


Template.processMailModal.events({
                                   'click #deleteMail': function (e, t) {
                                     e.preventDefault();
                                     let seqno = Emails.findOne(Session.get('thisMailId')).seqno;

                                     if (Session.get('thisBox') != 'Trash') {
                                       Meteor.call('moveEmailToOtherBox', Session.get('thisBox'), 'Trash', Session.get('thisAccount'), seqno, (err, res) => {
                                         if (err) {
                                           showError(err);
                                         }
                                         if (res) {
                                           showSuccess(res)
                                         }
                                       });
                                     } else {
                                       Meteor.call('deleteEmail', Session.get('thisBox'), Session.get('thisAccount'), seqno, (err, res) => {
                                         if (err) {
                                           showError(err);
                                         }
                                         if (res) {
                                           showSuccess(res)
                                         }
                                       });
                                     }
                                   },
                                   'click .folder-name': function (e, t) {
                                     e.preventDefault();
                                     console.log('in click .folder-name');

                                     let seqno = Emails.findOne(Session.get('thisMailId')).seqno;
                                     Meteor.call('moveEmailToOtherBox', Session.get('thisBox'), e.currentTarget.text, Session.get('thisAccount'), seqno, (err, res) => {
                                       console.log('in moveEmailToOtherBox client callback')
                                       if (err) {
                                         showError(err);
                                       }
                                       if (res) {
                                         showSuccess(res)
                                       }
                                     });
                                   },
                                   'click #saveMailButton': function (e, t) {
                                     //  get email

                                     let email = Emails.findOne(Session.get('thisMailId'));

                                     // to string
                                     let json = JSON.stringify(email);

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

                                     download('email', json)

                                   },
                                 });

Template.processMailModal.helpers({
                                    thisMail() {
                                      return Session.get('mailToProcess');
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
                                        /*setTimeout(function() {
                                         return window.URL.revokeObjectURL(url);
                                         }, 1000);*/
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