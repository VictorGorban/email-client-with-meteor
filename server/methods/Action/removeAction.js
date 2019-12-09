function removeActionChecks(actionId) {
  if (Meteor.user().status == 'архивный') {
    throw new Meteor.Error('error-not-allowed', 'Недостаточно прав', {method: 'removeAction'});
  }
  if (!Meteor.user().company) {
    throw new Meteor.Error('error-not-allowed', 'Недостаточно прав', {method: 'removeAction'});
  }

  return [actionId];
}

Meteor.methods({
                 removeAction(actionId) {

                   check(actionId, String);

                   [actionId] = removeActionChecks(actionId);

                   Timeline.insert({
                                     _createdAt: new Date(),
                                     user: this.userId,
                                     action: 'removeAction',
                                     company: Meteor.user().company,
                                     item: actionId,
                                   });

                   return Actions.remove(actionId)
                 },
               });
