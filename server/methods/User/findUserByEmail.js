Meteor.methods({
                 findUserByEmail(email) {


                   // if (Meteor.user().permission != '1') {
                   // 	throw new Meteor.Error('error-application-not-found', 'Нет доступа', { method: 'findUserByEmail' });
                   // }


                   var user = Meteor.users.findOne({'emails.0.address': email, 'emails.0.verified': true});

                   if (user) {
                     return user._id
                   }
                   return false;
                 },
               });
