// function createNewActionChecks(options) {
//   var requiredFields = ['name', 'budget', 'condition', 'item', 'action', 'points'];
//   for (var key of requiredFields) {
//     if (!options[key]) {
//       throw new Meteor.Error('please fill all required fields');
//     }
//   }
//
//   var possibleOptions = ['name', 'budget', 'condition', 'item', 'action', 'points'];
//   for (var key of Object.keys(options)) {
//     if (!possibleOptions.includes(key)) {
//       delete options[key];
//     }
//   }
//
//   return [options];
// }


Meteor.methods({
                 createNewAction(options) {
                   check(options, Object);

                   // [options] = createNewActionChecks(options);
                   var newObj = {
                     // _id: Random.id(), // если не тут, то вставка не получится.
                     // _createdAt: new Date(),
                     // status: 'Активный',
                     // company: Meteor.user().company,
                     ...options,
                   };

                   // switch (newObj.condition) {
                   //   case 'товар':
                   //     Products.update({_id: newObj.item}, {$set: {action: newObj._id}});
                   //     break;
                   //   case 'опрос':
                   //     Surveys.update({_id: newObj.item}, {$set: {action: newObj._id}});
                   //     break;
                   //   case 'новостной пост':
                   //     Contents.update({_id: newObj.item}, {$set: {action: newObj._id}});
                   //     break;
                   //   case 'видео':
                   //     Media.update({_id: newObj.item}, {$set: {action: newObj._id}});
                   //     break;
                   // }

                   // Timeline.insert({
                   //                   _createdAt: new Date(),
                   //                   user: this.userId,
                   //                   company: Meteor.user().company,
                   //                   action: 'createNewAction',
                   //                   item: newObj._id,
                   //                 });

                   return Actions.insert(options);
                 },
               });
