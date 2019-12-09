var validator = require('email-validator');

Meteor.methods({
                 registUserAndCompany(createUser) {

                   check(createUser, Object);
                   check(createUser.email, String);
                   check(createUser.tempPassword, String);
                   check(createUser.name, String);

                   if (!validator.validate(createUser.email)) {
                     throw new Meteor.Error('error-invalid-email', 'Неверный Email', {method: 'registUserAndCompany'});
                   }

                   if (Meteor.call('findUserByEmail', createUser.email)) {
                     throw new Meteor.Error('error-invalid-email', 'Email уже существует в системе', {method: 'registUserAndCompany'});
                   }

                   var object2 = {};
                   object2.name = createUser.name;
                   object2._createdAt = new Date;

                   object2.pref = {};
                   object2.pref.email = createUser.email;

                   object2.counters = {
                     users: 1,
                     bracelets: 0,
                     braceletslimit: 20,
                     itemviews: 0,
                   };

                   createUser.profile = {};
                   var cid = Companys.insert(object2);
                   createUser.profile.company = cid;

                   return Accounts.createUser(createUser);

                 },
               });
