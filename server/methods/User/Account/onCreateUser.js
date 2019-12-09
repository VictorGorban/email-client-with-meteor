import {AccountsServer} from 'meteor/accounts-base';

var validator = require('email-validator');


Meteor.methods({
                 checkAndRegisterUser(createUser) {

                   check(createUser, Object);
                   check(createUser.email, String);
                   check(createUser.tempPassword, String);

                   if (!validator.validate(createUser.email)) {
                     throw new Meteor.Error('error-invalid-email', 'Неверный email', {method: 'checkAndRegisterUser'});
                   }

                 },
               });


/**
 * Here we add additional fields to our user object.
 */
Accounts.onCreateUser((options, user) => {
// Тут создаются как пользователи системы, администраторы, так и точки продаж
// Если в предварительных данных нет emails параметра, это однозначно точка продаж. Она всегда создается с логином.

  var possibleOptions = ['tempPassword','company','img','username','name','name2','age','phone','position', 'access'];

  console.log(JSON.stringify(options));
  console.log(Object.keys(options));

  for (var key of Object.keys(options)){
    if (possibleOptions.includes(key))
      user[key] = options[key];
    else
      delete options[key];
  }

  // console.log(JSON.stringify(user));


  user.emails[0].verified = true;
  user.status = 'активный';

  if (user.access == 'full') {
    user.dashboard = true; // + counters
    user.usersList = true;
    user.changeCompany = true; // + enrollments
    user.surveys = true; // + Results
    user.content = true; // + Media
    user.products = true; // + Items
    user.actions = true; // + enrollments
    user.timeline = true;
  } else if (user.access == 'low') {
    user.dashboard = true; // + counters
  }
  delete user.access;

  return user;

});

