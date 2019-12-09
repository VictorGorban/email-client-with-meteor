var emailValidator = require('email-validator');

function createNewUserChecks(email, phone, tempPassword, name) {
  if (!name || !email || !tempPassword) {
    throw new Meteor.Error('error-not-allowed', 'Заполните все обязательные поля!', {method: 'createNewUser'});
  }

  if (phone) {
    // remove [-() ] from phone
    phone = phone.split(/[-() ]/).join('');
  }

  if (email && !emailValidator.validate(email)) {
    throw new Meteor.Error('error-invalid-email', 'Неверный email', {method: 'createNewUser'});
  }

  // check if phone contains only numerics. You can check it by console.
  if (phone && !/^\+?(0|[1-9]\d*)$/.test(phone)) {
    throw new Meteor.Error('error-invalid-phone', 'Неверный телефон', {method: 'createNewUser'});
  }

  if (Meteor.users.findOne({'emails.0.address': email})) {
    throw new Meteor.Error('error-not-allowed', 'Пользователь уже в системе', {method: 'createNewUser'});
  }

  return [
    email,
    phone,
    tempPassword,
    name,
  ];
}


Meteor.methods({

                 createNewUser(object) {

                   check(object, Object);


                   // check(object.company, String);

                   var email = object.email ? object.email.trim() : null;
                   var phone = object.phone ? object.phone.trim() : null;

                   var tempPassword = object.tempPassword ? object.tempPassword.trim() : null;

                   var name = object.name ? object.name.trim() : null;

                   [
                     email,
                     phone,
                     tempPassword,
                     name,
                   ] = createNewUserChecks(email, phone, tempPassword, name);

                   var createUser = {};
                   // create user with temp password
                   createUser.password = tempPassword;

                   // current company
                   createUser.company = Meteor.user().company;
                   createUser.access = object.access ? object.access.trim() : null;

                   createUser.email = email;
                   createUser.tempPassword = object.tempPassword ? object.tempPassword.trim() : null;
                   createUser.img = object.img ? object.img.trim() : null;
                   createUser.name = name;
                   createUser.name2 = object.name2 ? object.name2.trim() : null;
                   createUser.position = object.position ? object.position.trim() : null;
                   createUser.age = object.age ? object.age.trim() : null;
                   createUser.phone = object.phone ? object.phone.trim() : null;
                   createUser.email = object.email ? object.email.trim() : null;

                   Timeline.insert({
                                     _createdAt: new Date(),
                                     user: this.userId,
                                     company: createUser.company,
                                     action: 'createNewUser',
                                     item: email,
                                   });

                   return Accounts.createUser(createUser);

                 },
               });
