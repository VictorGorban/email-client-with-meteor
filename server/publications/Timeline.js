// Timeline = new Mongo.Collection('timeline');


publishComposite('company.change.log', function (limit) {
  if (!this.userId) {
    return this.ready();
  } else {
    return {
      // only company changes. Create user - not this case.
      find() {
        return Timeline.find({company: Meteor.user().company}, {sort: {_createdAt: -1}, limit: limit});
      },
      children: [
        {
          find(x) {
            return Meteor.users.find({_id: x.user}, {fields: {name: 1, name2: 1}})
          },
        },
      ],
    }
  }
});
