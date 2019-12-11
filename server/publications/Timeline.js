Meteor.publish('timeline.all', function () {

  return Timeline.find();
});
