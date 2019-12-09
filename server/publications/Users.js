publishComposite('userData', function () {
  if (!this.userId) {
    return this.ready();
  } /*else*/

  return {
    find() {
      return Meteor.users.find({_id: this.userId}/*, {fields: {company: 1, role: 1}}*/);
    },
    children: [
      {
      	find(x) {
      		return Media.find({_id: x.img}).cursor;
      	},

      },
    ],

  }
});

publishComposite('user.one', function (id) {
  return {
    find() {
      return Meteor.users.find({_id: id});
    },
    children: [
      {
      	find(x) {
      		return Media.find({_id: x.img}).cursor;
      	}
      },

    ],
  }
});

publishComposite('company.usersList', function (companyId) {
  return {
    find() {
      return Meteor.users.find({company: companyId}, {sort: {_createdAt :-1}});
    },
    children: [
      // {
      // 	find(x) {
      // 		return Media.find(x.img).cursor;
      // 	}
      //
      // }
    ],
  }
});