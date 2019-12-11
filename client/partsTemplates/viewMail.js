import '../commonFunctions'


Template.viewMail.helpers({
                            thisMail() {
                              return Emails.findOne(Session.get('thisMailId'));
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
                            date(email) {
                              return email.date.toDateString();
                            },
                            unread(email) {
                              return email.flags.includes('\\Seen') ? '' : 'unread';
                            },

                          })