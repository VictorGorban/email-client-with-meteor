Meteor.methods({
                 updateUserPersonal(data) {

                   check(data, Object);

                   Timeline.insert({_createdAt: new Date(), user: this.userId, action: 'updateUserPersonal'});

                   Meteor.users.update(this.userId, {
                     $set: {
                       name: data.name,
                       name2: data.name2,
                       phone: data.phone,
                       city: data.city,
                       job: data.job,
                       birth: data.birth,
                       _updatedAt: new Date,
                     },
                   });

                   const oldEmail = Meteor.user().emails[0].address;

                   if (data.email && oldEmail != data.email) {

                     //add new email
                     Accounts.addEmail(this.userId, data.email);

                     //remove old email
                     Accounts.removeEmail(this.userId, oldEmail);

                     Timeline.insert({_createdAt: new Date(), user: this.userId, action: 'updateUserEmail'});
                   }

                   return true;
                 },
               });
