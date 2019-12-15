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

function loadThisMailAttachments() {
  let id = Session.get('thisMailId');
  let seqNumber = Emails.findOne(id).seqno;

  Meteor.call('loadEmail', Session.get('thisBox'), Session.get('thisAccount'), seqNumber);
}


Template.mailsList.onCreated(function () {

  let accounts;
  try {
    accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  }catch (e) {
    accounts = [];
  }
  // console.log(accountsList);
  Session.set('accounts', accounts);

  let thisAccount;
  try {
    thisAccount = JSON.parse(localStorage.getItem('thisAccount') || '{}');
  }catch (e) {
    thisAccount = {};
  }
  // console.log(thisAccount);
  Session.set('thisAccount', thisAccount);


  let boxes = localStorage.getItem('boxes') || {};
  if (boxes == 'undefined') {
    boxes = '{}';
  }
  boxes = JSON.parse(boxes);

  // console.log(boxes);
  Session.set('boxes', boxes);

  let thisBox = localStorage.getItem('thisBox') || 'INBOX';
  Session.set('thisBox', thisBox);


  Meteor.subscribe('timeline.all');

  syncEmailsAndBoxes();
  setInterval(syncEmailsAndBoxes, 60 * 1000);


  Tracker.autorun(() => {
    Meteor.subscribe('emails', Session.get('thisBox'));

  });


});

Template.mailsList.events({
                            'click .email-row': function (e, t) {
                              let id = e.currentTarget.getAttribute('data-id');
                              Session.set('thisMailId', id);

                              loadThisMailAttachments();
                              // if (Session.get('thisBox') == 'Drafts') {
                              //   $('.btn.btn-compose').click()
                              // }
                            },
                          });

Template.mailsList.helpers({
                             thisBox() {
                               return Session.get('thisBox');
                             },
                             from(email) {
                               return email.from ? email.from.substring(email.from.indexOf('<') + 1, email.from.indexOf('>')) : '';
                             },
                             subject(email) {
                               return email.subject ? email.subject.substring(0, 20) + '...' : '';
                             },
                             trim(str, limit = 20) {
                               return str.substring(0, limit);
                             },
                             emails: function () {
                               // return Template.mailsList.emails;
                               // var folder = Session.get('thisFolder');
                               // let box = 'inbox';
                               let user = Session.get('thisAccount').user;
                               if (!user) {
                                 return;
                               }
                               return Emails.find({
                                                    box: Session.get('thisBox'),
                                                    user: user,
                                                  }, {sort: {date: -1}});
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
                             date(email) {
                               return email.date.toDateString();
                             },
                             unread(email) {
                               return email.flags.includes('\\Seen') ? '' : 'unread';
                             },

                           });
