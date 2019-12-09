Meteor.methods({
                 sendResetPassword(email) {

                   var validator = require('email-validator');

                   if (!validator.validate(email)) {
                     throw new Meteor.Error('error-invalid-email', 'Неверный Email', {method: 'sendResetPassword'});
                   }

                   var user = Accounts.findUserByEmail(email);

                   if (user._id) {
                     return Accounts.sendResetPasswordEmail(user._id);
                   } else {
                     throw new Meteor.Error('error-invalid-email', 'Email не найден в системе', {method: 'sendResetPassword'});
                   }

                 },
               });