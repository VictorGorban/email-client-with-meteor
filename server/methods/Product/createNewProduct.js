Meteor.methods({
                 createNewProduct(options) {
                   //todo: нормальная валидация
                   check(options, Object);

                   try {

                     // console.log('in createNewProduct');

                     var newObj = {};
                     newObj._id = options._id || Random.id();
                     newObj._createdAt = new Date();
                     newObj.name = options.name;
                     newObj.company = Meteor.user().company;
                     newObj.action = options.action;

                     if (!newObj.action || !newObj.name) {
                       throw new Meteor.Error('please set all params', '', {method: 'createNewProduct'});
                     }

                     var result = Timeline.insert({
                                       _createdAt: new Date(),
                                       user: this.userId,
                                       company: Meteor.user().company,
                                       action: 'createNewProduct',
                                       item: newObj._id,
                                     });

                     // console.log('after timeline.insert');
                     // console.log(result);

                     var result = Products.insert(newObj);
                     // console.log('contents.insert');
                     // console.log(result);
                     return result; // все нормально, вставляется
                   }catch (e) {
                     throw new Meteor.Error(e.message);
                   }
                 },
               });