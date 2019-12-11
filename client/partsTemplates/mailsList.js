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

  let thisAccount = localStorage.getItem('thisAccount');
  Meteor.call('getBoxes', thisAccount, (err, boxes) => {
    Session.set('boxes', boxes);
    localStorage.setItem('boxes', JSON.stringify(boxes));
  });


  Meteor.call('syncBox', Session.get('thisBox'), Session.get('thisAccount'));

  setTimeout(doneSyncing, 3000);
}


Template.mailsList.onCreated(function () {

  let accountsList = JSON.parse(localStorage.getItem('accountsList') || '[]');
  // console.log(accountsList);
  Session.set('accountsList', accountsList);

  let thisAccount = JSON.parse(localStorage.getItem('thisAccount') || '{}');
  // console.log(thisAccount);
  Session.set('thisAccount', thisAccount);


  let boxes = localStorage.getItem('boxes');
  if (boxes == 'undefined') {
    boxes = '{}';
  }
  boxes = JSON.parse(boxes || '{}');

  // console.log(boxes);
  Session.set('boxes', boxes);

  let thisBox = localStorage.getItem('thisBox') || 'INBOX';
  Session.set('thisBox', thisBox);


  Meteor.subscribe('timeline.all');

  /*  const cursor = Timeline.find();
   cursor.observeChanges({
   added(id, tl) {
   switch (tl.type) {
   case 'error':
   showError(tl.message);
   break;
   case 'success':
   showSuccess(tl.message);
   break;
   default:
   showInfo(tl.message);
   }
   console.log(tl);
   },
   });*/


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
                               return Emails.find({box: Session.get('thisBox')}, {sort: {date: -1}});
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
