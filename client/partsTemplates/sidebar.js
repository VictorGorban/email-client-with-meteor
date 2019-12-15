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

  Session.set('isSyncing', true);

  function doneSyncing() {
    Session.set('isSyncing', false);
  }

  let thisAccount = Session.get('thisAccount');
  Meteor.call('getBoxes', thisAccount, (err, boxes) => {
    Session.set('boxes', boxes);
    localStorage.setItem('boxes', JSON.stringify(boxes));
  });


  Meteor.call('syncBox', Session.get('thisBox'), Session.get('thisAccount'), (err, res) => {
    doneSyncing();
    if (err) {
      showError(err);
    }
    if (res) {
      showSuccess(res)
    }
  });

  console.log('sidebar.js. before setTimeout(doneSyncing, 5000);');
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

                             let props =Object.getOwnPropertyNames(boxes);
                             props.splice(props.indexOf('Outbox'),1);
                             return props;
                           },
                         });

Template.sidebar.events({
                          'click .email-box': function (e, t) {
                            e.preventDefault();
                            let boxName = e.currentTarget.text;
                            let boxes = Session.get('boxes');
                            Session.set('thisBox', boxName);
                            localStorage.setItem('thisBox', boxName);

                            syncEmailsAndBoxes();
                          },
                        });
