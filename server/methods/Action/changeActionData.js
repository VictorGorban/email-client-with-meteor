function changeActionDataChecks(field, id, data) {
  field = field ? field.trim() : field;
  data = data ? data.trim() : data;

  // validations
  var requiredFields = ['name', 'budget', 'condition', 'item', 'action', 'points', 'status'];
  if (requiredFields.includes(field) && !data) {
    throw new Meteor.Error('error-not-allowed', 'Поле обязательно', {method: 'changeActionData'});
  }

  var possibleFields = ['name', 'budget', 'condition', 'item', 'action', 'points', 'status'];
  if (!possibleFields.includes(field)) {
    throw new Meteor.Error('error-not-allowed', 'Поле не позволено', {method: 'changeActionData'});
  }

  if (field == 'action' && !['add', 'mult'].includes(data)) {
    throw new Meteor.Error('error-not-allowed', 'Неверное действие', {method: 'changeActionData'});
  }

  // end of validations

  return [field, id, data];
}

Meteor.methods({
                 changeActionData(field, id, data) {

                   check(field, String);
                   check(id, String);
                   check(data, String);

                   // [field, id, data] = changeActionDataChecks(field, id, data);

                   var query;
                   query = '{"' + field + '": "' + data + '"}';

                   return Actions.update(id, {
                     $set: JSON.parse(query),
                   });

                 },

               });
