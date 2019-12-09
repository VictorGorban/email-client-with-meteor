Meteor.methods({
                 createNewContent(options) {
                   //todo: нормальная валидация
                   check(options, Object);

                   try {

                     console.log('in createNewContent');

                     var newObj = {};
                     newObj._id = options._id || Random.id();
                     newObj._createdAt = new Date();
                     newObj.title = options.title;
                     newObj.videos = options.videos || [];
                     newObj.images = options.images || [];
                     newObj.company = Meteor.user().company;
                     newObj.action = options.action;

                     if (!newObj.action || !newObj.title) {
                       throw new Meteor.Error('please set all params', '', {method: 'createNewContent'});
                     }

                     var result = Timeline.insert({
                                       _createdAt: new Date(),
                                       user: this.userId,
                                       company: Meteor.user().company,
                                       action: 'createNewContent',
                                       item: newObj._id,
                                     });

                     // console.log('after timeline.insert');
                     // console.log(result);

                     var result = Contents.insert(newObj);
                     // console.log('contents.insert');
                     console.log(result);
                     return result; // все нормально, вставляется
                   }catch (e) {
                     throw new Meteor.Error(e.message);
                   }
                 },
               });