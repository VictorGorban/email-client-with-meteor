// import '../commonFunctions'


function showError(message) {
  toastr.error(message);
}

function showSuccess(message) {
  toastr.success(message);
}

function showInfo(message) {
  toastr.success(message);
}

function syncEmails() {
  if (Session.equals('isSyncing', true)) {
    return;
  }
  Session.set('isSyncing', true);

  function doneSyncing() {
    Session.set('isSyncing', false);
  }

  Meteor.call('syncBox', Session.get('thisBox'), Session.get('thisAccount'), (err, res) => {
    doneSyncing();
    if (err) {
      showError(err);
    }
    if (res) {
      showSuccess(res)
    }
  });

  setTimeout(doneSyncing, 2000);
}


Template.header.onCreated(function () {
  // this.actionCondition.set('товар');
  Session.set('hello', 'its me');
});

//  this.fetchComp = new ReactiveVar []
Template.header.events({
                         'click #syncButton': function () {
                           syncEmails();
                         },

                         'click .account-link': function () {
                           let thisAccount = Session.get('thisAccount');
                           let account = Session.get('accounts').find(e => e.user == thisAccount.user);
                           if (!account) {
                             return;
                           }

                           updateSettingsModal(account);

                           function updateSettingsModal(account) {
                             $('#settingsUser').val(account.user);

                             $('#settingsSmtpAddress').val(account.smtp.address);
                             $('#settingsSmtpPort').val(account.smtp.port);
                             $('#settingsSmtpPassword').val(account.smtp.password);

                             $('#settingsImapAddress').val(account.imap.address);
                             $('#settingsImapPort').val(account.imap.port);
                             $('#settingsImapPassword').val(account.imap.password);
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
