var emailValidator = require('email-validator');

function changeUserDataChecks(field, id, data) {
  field = field ? field.trim() : field;
  data = data ? data.trim() : data;


  // validations
  var requiredFields = ['name', 'name2', 'email'];

  if (requiredFields.includes(field) && !data) {
    throw new Meteor.Error('error-not-allowed', 'Поля обязательно', {method: 'changeUserData'});
  }

  if (!Meteor.user().company) {
    throw new Meteor.Error('error-not-allowed', 'Недостаточно прав', {method: 'changeUserData'});
  }

  var user = Meteor.users.findOne({_id: id});// Meteor.users.find({_id: userId});

  if (Meteor.user().company != user.company) {
    throw new Meteor.Error('error-not-allowed', 'Недостаточно прав', {method: 'changeUserData'});
  }


  if (field == 'email' && !emailValidator.validate(data)) {
    throw new Meteor.Error('error-invalid-email', 'Неверный Email', {method: 'changeUserData'});
  }

  if (field == 'email' && !emailValidator.validate(data)) {
    throw new Meteor.Error('error-invalid-email', 'Неверный Email', {method: 'changeUserData'});
  }

  if (field == 'email' && Meteor.users.findOne({'emails.0.address': data})) {
    throw new Meteor.Error('error-invalid-email', 'Email уже в системе', {method: 'changeUserData'});
  }

  if (field == 'phonenumber') {
    data = data.split(/[-() ]/).join('');
  }

  if (field == 'phone' && !/^\+?(0|[1-9]\d*)$/.test(data)) {
    throw new Meteor.Error('error-invalid-phone', 'Неверный телефон', {method: 'changeUserData'});
  }

  // end of validations

  // other checks
  var thisUser = Meteor.users.findOne(id);

  if (field == 'img' && thisUser.img != 'smGwtp2k4kF6aFnEe') {
    Media.remove(thisUser.img)
  }


  return [field, id, data];
}

Meteor.methods({
                 changeUserData(field, id, data) {

                   check(field, String);
                   check(id, String);
                   check(data, String);

                   [field, id, data] = changeUserDataChecks(field, id, data);

                   var query;
                   if (field == 'email') {
                     query = '{"' + 'emails.0.address' + '": "' + data + '"}';
                   } else {
                     query = '{"' + field + '": "' + data + '"}';
                   }

                   return Meteor.users.update(id, {
                     $set: JSON.parse(query),
                   });

                 },

                 resetbracelet(id) {
                   check(id, String);

                   if (!this.userId) {
                     throw new Meteor.Error('error-invalid-device', 'Неверный пользователь', {method: 'resetbracelet'});
                   }

                   if (Meteor.user().status != 'активный') {
                     throw new Meteor.Error('error-invalid-device', 'Неверный статус', {method: 'resetbracelet'});
                   }


                   if (!Meteor.users.findOne(id)) {
                     throw new Meteor.Error('error-invalid-device', 'Неверный пользователь', {method: 'resetbracelet'});
                   }


                   if (!Meteor.user().company || !Meteor.users.findOne(id).company) {
                     throw new Meteor.Error('error-invalid-device', 'Неверная компания пользователя', {method: 'resetbracelet'});
                   }

                   if (Meteor.user().company != Meteor.users.findOne(id).company) {
                     throw new Meteor.Error('error-invalid-device', 'Неверная компания пользователя', {method: 'resetbracelet'});
                   }
                   Timeline.insert({
                                     _createdAt: new Date(),
                                     user: this.userId,
                                     action: 'resetBracelet',
                                   });


                   return Meteor.users.update(id, {$unset: {bracelet: ''}})
                 },
               });
