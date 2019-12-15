import '../commonFunctions'

function showError(message) {
  toastr.error(message);
}

function showSuccess(message) {
  toastr.success(message);
}

function showInfo(message) {
  toastr.success(message);
}

Template.addAccountModal.events({
                                  'submit #addAccountForm': function (e, t) {
                                    e.preventDefault();

                                    function getAccountSettingsFromAddAccountModal() {
                                      return {
                                        user: $('#addAccountUser').val(),
                                        password: $('#addAccountPassword').val(),
                                        smtp: {
                                          address: $('#addAccountSmtpAddress').val(),
                                          port: $('#addAccountSmtpPort').val(),
                                        },
                                        imap: {
                                          address: $('#addAccountImapAddress').val(),
                                          port: $('#addAccountImapPort').val(),
                                        },
                                      }
                                    }

                                    const account = getAccountSettingsFromAddAccountModal();
                                    // console.log(account);
                                    // return;
                                    let accountSmtp = {
                                      user: account.user,
                                      password: account.password,
                                      host: account.smtp.address,
                                      port: account.smtp.port,
                                    };
                                    let accountImap = {
                                      user: account.user,
                                      password: account.password,
                                      address: account.imap.address,
                                      port: account.imap.port,
                                    };

                                    let accounts = Session.get('accounts');
                                    if (!accounts || (typeof accounts) != "object") {
                                      accounts = [];
                                    }
                                    if (accounts.find(e => e.user == account.user)) {
                                      showError('account already exists');
                                      return;
                                    }


                                    accounts.push(account);

                                    Session.set('accounts', accounts);
                                    localStorage.setItem('accounts', JSON.stringify(accounts));

                                    Session.set('thisAccount', account);
                                    localStorage.setItem('thisAccount', JSON.stringify(account));

                                    // Meteor.call('tryConnectSmtp', accountSmtp, (err, res) => {
                                    //   if (err) {
                                    //     showError(err);
                                    //   }
                                    //
                                    //   if (res) {
                                    //     showSuccess('successfully connected to smtp server');
                                    //   }
                                    // });
                                    // Meteor.call('tryConnectImap', accountImap, (err, res) => {
                                    //   if (err) {
                                    //     showError('can\'t connect to imap server');
                                    //   }
                                    //
                                    //   if (res) {
                                    //     showSuccess('successfully connected to imap server');
                                    //   }
                                    // });
                                  }
                                });