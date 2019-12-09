Meteor.methods({
                 updateUserImage(string) {

                   check(string, String);


                   if (Meteor.user().img) {
                     Timeline.insert({
                                       _createdAt: new Date(),
                                       user: this.userId,
                                       action: 'updateUserImage',
                                       revert: Meteor.user().img,
                                     });
                     var imgId = Usermedia.findOne({avatar: 1, user: this.userId});
                     if (imgId) {
                       Usermedia.remove(imgId._id);
                     }
                   }

                   Usermedia.update(string, {
                     $set: {
                       avatar: 1,
                       user: this.userId,
                     },
                   });

                   var img = Usermedia.findOne(string).link('thumbnail');

                   return Meteor.users.update(this.userId, {
                     $set: {
                       img: img.replace('https://185.251.89.179:3000/', 'https://185.251.89.179:3000/'),
                       _updatedAt: new Date,
                     },
                   });

                 }
               });
