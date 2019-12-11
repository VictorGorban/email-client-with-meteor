import '../commonFunctions'
import {Meteor} from 'meteor/meteor';

function syncEmailsAndBoxes() {
  if(Session.equals('isSyncing', true))
    return;

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


/*Template.sidebar.onRendered(() => {

});*/

Template.sidebar.helpers({
                           boxes() {
                             return Session.get('boxes');
                           },
                           boxesNames() {
                             let boxes = Session.get('boxes');
                             if(!boxes) return null;
                             return Object.getOwnPropertyNames(boxes);
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
