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
  if(Session.equals('isSyncing', true))
    return;
  Session.set('isSyncing', true);
  function doneSyncing() {
    Session.set('isSyncing', false);
  }

  Meteor.call('syncBox', Session.get('thisBox'), Session.get('thisAccount'));

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
                       });

Template.header.helpers({
                          emails: function () {
                            var folder = Session.get('thisFolder');
                            return Emails.find({folder});
                          },
                          hello: () => {
                            return Session.get('hello');
                          },
                          hcondition: function () {
                            // console.log(Template.instance());
                            // console.log(Template.instance().actionCondition.get());
                            return Template.instance().actionCondition.get();
                          },

                        });
