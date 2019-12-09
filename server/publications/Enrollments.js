/*publishComposite('enrollment.one', function (id) {
  return {
    find() {
      return Actions.find({_id: id});
    },
    children: [
      {
        find(x) {
          if (x.condition == 'видео') {
            return Media.find({_id: x.item}).cursor;
          }
        },
      },
      {
        find(x) {
          if (x.condition == 'товар') {
            return Products.find({_id: x.item});
          }
        },

      },
      // {
      //   find(x) {
      //     return Documents.find({_id: x.mhistoryfile}).cursor;
      //   },
      //
      // },
    ],
  }
})
;*/

publishComposite('company.enrollmentsList', function (companyId) {
  return {
    find() {
      // console.log(Actions.find({company: companyId}).fetch());
      return Enrollments.find(/*{company: companyId}*/);
    },
    children: [
      {
        find(x) { // search item
          // console.log('action.item: '+action.item);
          return Meteor.users.find(x.user);
        },
      },
      {
        find(x) { // search item
          // console.log('action.item: '+action.item);
          return Actions.find(x.action);
        },
      },
    ],
  }
});

publishComposite('company.enrollmentsListByUser', function (companyId, userId) {
  console.log('companyId is '+companyId+' and userId is '+userId);
  return {
    find() {
      // console.log(Actions.find({company: companyId}).fetch());
      return Enrollments.find({company: companyId, user: userId});
    },
    children: [
      {
        find(x) { // search item
          // console.log('action.item: '+action.item);
          return Meteor.users.find(x.user);
        },
      },
      {
        find(x) { // search item
          // console.log('action.item: '+action.item);
          return Actions.find(x.action);
        },
      },
    ],
  }
});

publishComposite('company.enrollmentsListByAction', function (companyId, actionId) {
  return {
    find() {
      // console.log(Actions.find({company: companyId}).fetch());
      return Enrollments.find({company: companyId, action: actionId});
    },
    children: [
      {
        find(x) { // search item
          // console.log('action.item: '+action.item);
          return Meteor.users.find(x.user);
        },
      },
      {
        find(x) { // search item
          // console.log('action.item: '+action.item);
          return Actions.find(x.action);
        },
      },
    ],
  }
});