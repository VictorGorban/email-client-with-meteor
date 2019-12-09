
Meteor.publish('companys.my', function () {
  if (!this.userId) {
    return ready();
  } else {
    return Companys.find({users: {$in: [this.userId]}});
  }
});

publishComposite('company.data', function () {
  if (!this.userId) {
    return this.ready();
  } else {
    return {
      find() {
        return Companys.find({_id: Meteor.user().company});
      },
      children: [
        {
          find(x){
            return Media.find({ _id: x.img}).cursor;
          }
        }
      ],
    }
  }
});
