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

function syncEmailsAndBoxes() {
  if (Session.equals('isSyncing', true)) {
    return;
  }

  let thisAccount = Session.get('thisAccount');
  if (!thisAccount || Object.getOwnPropertyNames(thisAccount).length == 0) {
    return;
  }

  Session.set('isSyncing', true);

  function doneSyncing() {
    Session.set('isSyncing', false);
  }

  Meteor.call('getBoxes', thisAccount, (err, boxes) => {
    if (err) {
      showError(err);
      return;
    }
    console.log('in getBoxes callback')
    Session.set('boxes', boxes);
    localStorage.setItem('boxes', JSON.stringify(boxes));
  });


  Meteor.call('syncBox', Session.get('thisBox'), Session.get('thisAccount'), (err, res) => {
    doneSyncing();
    console.log('syncBox finished');
    if (err) {
      showError(err);
    }
    if (res) {
      showSuccess(res)
    }
  });

  setTimeout(doneSyncing, 5000); // Хрен его знает, почему imap не завершает fetch из trash
}


Template.sidebar.helpers({
                           boxes() {
                             return Session.get('boxes');
                           },
                           boxesNames() {
                             let boxes = Session.get('boxes');
                             if (!boxes) {
                               return null;
                             }

                             let props = Object.getOwnPropertyNames(boxes);
                             props.splice(props.indexOf('Outbox'), 1);
                             return props;
                           },
                         });

Template.sidebar.events({
                          'click #buttonViewSavedMail': function (e, t) {
                            // e.preventDefault();
                            $('#loadSavedFile').click();
                          },
                          'change #loadSavedFile': async function (e, t) {
                            const fileToText = file => new Promise((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve(reader.result);
                              reader.onerror = error => reject(error);
                              reader.readAsText(file);
                            });

                            let file = e.currentTarget.files[0];
                            let json = await fileToText(file);


                            let email;
                            try {
                              email = JSON.parse(json);
                            }catch (e) {
                              showError('can\'t parse your message file. Maybe it\'s corrupted?');
                              console.log(e);
                              return;
                            }

                            console.log(email);
                            // return;

                            Session.set('mailToProcess', email);


                            $('#processMailModal').modal();
                          },
                          'click .email-box': function (e, t) {
                            e.preventDefault();
                            let boxName = e.currentTarget.text;
                            let boxes = Session.get('boxes');
                            Session.set('thisBox', boxName);
                            localStorage.setItem('thisBox', boxName);

                            syncEmailsAndBoxes();
                          },
                        });
