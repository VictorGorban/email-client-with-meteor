Meteor.methods({
                 removeTimeline(id) {

                   check(id, String);

                   var action = Timeline.findOne(id);

                   var current = Companys.findOne(Meteor.user().company);


                   // var tid = Timeline.insert({_createdAt: new Date(), user: this.userId, action: 'updateCompanyImage', company: current._id });

                   return Timeline.remove(id)

                 },
               });
