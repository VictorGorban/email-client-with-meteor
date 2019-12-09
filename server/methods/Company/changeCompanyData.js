var emailValidator = require('email-validator');

function changeCompanyDataChecks(field, data) {
  // чтобы если поле пустое, в БД не записывался "null"
  field = field ? field.trim() : field;
  data = data ? data.trim() : data;

  var requiredFields = ['name', 'email'];

  // throw new Meteor.Error('error-not-allowed', field+"  "+data, { method: 'changeCompanyData' });

  if (requiredFields.includes(field) && !data) {
    throw new Meteor.Error('error-not-allowed', 'Поле обязательно', {method: 'changeCompanyData'});
  }

  if (field == 'email' && !emailValidator.validate(data)) {
    throw new Meteor.Error('error-invalid-email', 'Неверный Email', {method: 'changeCompanyData'});
  }

  if (field == 'email' && Companys.findOne({'email': data})) {
    throw new Meteor.Error('error-invalid-email', 'Email уже существует в системе', {method: 'changeCompanyData'});
  }

  if (field == 'phone') {
    data = data.split(/[-() ]/).join('');
  }

  if (field == 'phone' && !/^\+?(0|[1-9]\d*)$/.test(data)) {
    throw new Meteor.Error('error-invalid-phone', 'Неверный телефон', {method: 'changeCompanyData'});
  }

  var userCompany = Companys.findOne(Meteor.user().company);

  if (field == 'img' && userCompany.img) {
    Media.remove(userCompany.img);
  }

  return [field, data];
}

Meteor.methods({
                 changeCompanyData(field, data) {

                   check(field, String);
                   check(data, String);

                   [field, data] = changeCompanyDataChecks(field, data);

                   // user company id
                   var id = Companys.findOne(Meteor.user().company)._id;

                   var query = '{"' + field + '": "' + data + '"}';

                   return Companys.update(id, {
                     $set: JSON.parse(query),
                   });

                 },
               });
