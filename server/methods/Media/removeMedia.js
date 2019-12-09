Meteor.methods({
                 /*removeMedia(mediaId, itemId) {

                  check(mediaId, String);
                  check(itemId, String);

                  if (Meteor.user().roles != 'company') {
                  throw new Meteor.Error('error-not-allowed', 'Недостаточно прав', { method: 'removeMedia' });
                  }

                  var item = Bracelets.findOne(itemId);
                  if (item.company != this.userId) {
                  throw new Meteor.Error('error-not-allowed', 'Недостаточно прав', { method: 'removeMedia' });
                  }

                  var file = Media.find({_id: mediaId}).fetch();

                  // if(file){
                  //     return Media.remove(mediaId);
                  // }

                  },
                  removeOldImage(itemId) {

                  check(itemId, String);

                  var item = Bracelets.findOne(itemId);
                  console.log(item);
                  if (item.company == this.userId) {

                  if ( item.img ) {

                  console.log(item);
                  Media.remove(item.img);

                  }
                  }
                  return true
                  }*/
               });


