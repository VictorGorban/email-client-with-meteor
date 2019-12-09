function removeUserDataChecks(userId) {
  if (!Meteor.users.findOne(userId)) {
    throw new Meteor.Error('error-invalid-user', 'Неверный пользователь', {method: 'removeUser'});
  }
  if (Meteor.user().status == 'архивный') {
    throw new Meteor.Error('error-not-allowed', 'Недостаточно прав', {method: 'removeUser'});
  }
  if (!Meteor.user().company) {
    throw new Meteor.Error('error-not-allowed', 'Недостаточно прав', {method: 'removeUser'});
  }

  var user = Meteor.users.findOne({_id: userId})// Meteor.users.find({_id: userId});

  if (Meteor.user()._id == user._id) {
    throw new Meteor.Error('error-not-allowed', 'Вы не можете удалить себя', {method: 'removeUser'});
  }

  if (Meteor.user().company != user.company) {
    throw new Meteor.Error('error-not-allowed', 'Недостаточно прав', {method: 'removeUser'});
  }

  return [userId];
}

Meteor.methods({
                 removeUser(userId) {

                   check(userId, String);

                   [userId] = removeUserDataChecks(userId);

                   Timeline.insert({
                                     _createdAt: new Date(),
                                     user: this.userId,
                                     action: 'removeUser',
                                     company: Meteor.user().company,
                                     item: userId,
                                     admin: true,
                                   });

                   return Meteor.users.remove(userId)

                 },
               });
