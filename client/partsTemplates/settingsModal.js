import '../commonFunctions'
import {Meteor} from "meteor/meteor";

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
      if (err.error=='500') {
        showError('cannot retrieve data via IMAP. Check your credentials');
        return;
      }
      showError(err);
      return;
    };

    console.log('in getBoxes callback');
    Session.set('boxes', boxes);
    localStorage.setItem('boxes', JSON.stringify(boxes));
  });


  Meteor.call('syncBox', Session.get('thisBox'), Session.get('thisAccount'), (err, res) => {
    doneSyncing();
    console.log('syncBox finished');
    if (err) {
      if (err.error=='500') {
        showError('cannot retrieve data via IMAP. Check your credentials');
        return;
      }
      showError(err);
      return;
    };
    if (res) {
      showSuccess(res)
    }
  });

  setTimeout(doneSyncing, 5000); // Хрен его знает, почему imap не завершает fetch из trash
}

Template.settingsModal.events({
                                'submit #settingsForm': function (e, t) {
                                  e.preventDefault();

                                  console.log('in submit #settingsForm');

                                  // return;

                                  function getAccountSettingsFromSettingsModal() {
                                    return {
                                      user: $('#settingsUser').val(),
                                      password: $('#settingsPassword').val(),
                                      smtp: {
                                        address: $('#settingsSmtpAddress').val(),
                                        port: $('#settingsSmtpPort').val(),
                                      },
                                      imap: {
                                        address: $('#settingsImapAddress').val(),
                                        port: $('#settingsImapPort').val(),
                                      },
                                    }
                                  }

                                  const account = getAccountSettingsFromSettingsModal();
                                  // console.log(account);
                                  // return;
                                  const currentAccount = Session.get('thisAccount');


                                  let accounts = Session.get('accounts');
                                  if (!accounts || (typeof accounts) != 'object') {
                                    accounts = [];
                                  }
                                  let index = accounts.findIndex(e => e.user == currentAccount.user);
                                  accounts[index] = account;

                                  Session.set('accounts', accounts);
                                  localStorage.setItem('accounts', JSON.stringify(accounts));

                                  Session.set('thisAccount', account);
                                  localStorage.setItem('thisAccount', JSON.stringify(account));

                                  syncEmailsAndBoxes();

                                  $('#closeSettingsModalButton').click();
                                },
                              });