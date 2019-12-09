Meteor.methods({
                 setUserLang(value) {
                   check(value, String);

                   return Meteor.users.update(this.userId, {
                     $set: {lang: value},
                   });
                 },
                 setUserEmailFiles(value) {
                   check(value, Boolean);

                   return Meteor.users.update(this.userId, {
                     $set: {emailFiles: value},
                   });
                 },
               });