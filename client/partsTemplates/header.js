// import '../commonFunctions'


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
      if (err.error == '500') {
        showError('cannot retrieve data via IMAP. Check your credentials');
        return;
      }
      showError(err);
      return;
    }
    ;

    console.log('in getBoxes callback');
    Session.set('boxes', boxes);
    localStorage.setItem('boxes', JSON.stringify(boxes));
  });


  Meteor.call('syncBox', Session.get('thisBox'), Session.get('thisAccount'), (err, res) => {
    doneSyncing();
    console.log('syncBox finished');
    if (err) {
      if (err.error == '500') {
        showError('cannot retrieve data via IMAP. Check your credentials');
        return;
      }
      showError(err);
      return;
    }
    ;
    if (res) {
      showSuccess(res)
    }
  });

  setTimeout(doneSyncing, 5000); // Хрен его знает, почему imap не завершает fetch из trash
}


Template.header.onCreated(function () {
  // this.actionCondition.set('товар');
  Session.set('hello', 'its me');
});

//  this.fetchComp = new ReactiveVar []
Template.header.events({
                         'click #syncButton': function () {
                           syncEmailsAndBoxes();
                         },
                         'click #logout': function (e, t) {
                           e.preventDefault();
                           let thisAccount = Session.get('thisAccount');
                           let accounts = Session.get('accounts');
                           for (var i in accounts) {
                             if (accounts[i].user == thisAccount.user) {
                               accounts.splice(i, 1);
                               break;
                             }
                           }
                           if(accounts.length>0){
                             Session.set('thisAccount', accounts[accounts.length - 1]);
                             localStorage.setItem('thisAccount', JSON.stringify(accounts[accounts.length - 1]));
                           }else{
                             Session.set('thisAccount', null);
                             localStorage.setItem('thisAccount', null);
                           }

                           Session.set('accounts', accounts);
                           localStorage.setItem('accounts', JSON.stringify(accounts));

                           Session.set('thisBox', 'INBOX');
                           localStorage.setItem('thisBox', 'INBOX');

                           Session.set('boxes', []);
                           localStorage.setItem('boxes', JSON.stringify([]));
                           syncEmailsAndBoxes();
                         },

                         'click .account-link': function (e, t) {
                           e.preventDefault();
                           let email = e.currentTarget.text.trim();
                           console.log(email);


                           let account = Session.get('accounts').find(e => e.user == email);
                           if(!account)
                             return;
                           Session.set('thisAccount', account);
                           localStorage.setItem('thisAccount', JSON.stringify(account));

                           syncEmailsAndBoxes();
                         },

                         'click #accountSettingsButton': function (e, t) {
                           // e.preventDefault();
                           let thisAccount = Session.get('thisAccount');
                           let account = Session.get('accounts').find(e => e.user == thisAccount.user);
                           if (!account) {
                             return;
                           }

                           updateSettingsModal(account);

                           function updateSettingsModal(account) {
                             $('#settingsUser').val(account.user);
                             $('#settingsPassword').val(account.password);

                             $('#settingsSmtpAddress').val(account.smtp.address);
                             $('#settingsSmtpPort').val(account.smtp.port);

                             $('#settingsImapAddress').val(account.imap.address);
                             $('#settingsImapPort').val(account.imap.port);
                           }

                         },
                       });

Template.header.helpers({
                          emails: function () {
                            var folder = Session.get('thisFolder');
                            return Emails.find({folder});
                          },
                          thisAccount: function () {
                            return Session.get('thisAccount');
                          },
                          accounts: function () {
                            let accounts = Session.get('accounts');
                            console.log(accounts);
                            return accounts;
                          },
                          hcondition: function () {
                            // console.log(Template.instance());
                            // console.log(Template.instance().actionCondition.get());
                            return Template.instance().actionCondition.get();
                          },

                        });
