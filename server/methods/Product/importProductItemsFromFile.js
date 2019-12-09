Meteor.methods({
                 importProductItemsFromFile(productId, fileId) {
                   //todo: нормальная валидация
// console.log(`productId is ${productId}, fileId is ${fileId}`);

                   try {

                     // console.log('in importProductItemsFromFile');
                     let path = Media.findOne(fileId).path;
                     // console.log('path is');
                     // console.log(path);

                     var XLSX = require('xlsx');

                     var workbook = XLSX.readFile(path);
                     var sheet_name_list = workbook.SheetNames;

                     var sh = workbook.Sheets[sheet_name_list[0]];

                     var data = XLSX.utils.sheet_to_json(sh, {header: 'A'});

                     for (var i in data) {
                       let id = '' + data[i].A;
                       if (!id || !id.trim()){
                         // string is not null, is not empty and not just whitespace
                         continue;
                       }
                       if (Items.findOne(id)) {
                         console.log('the duplicate id is '+id);
                         throw new Meteor.Error('E11000 duplicate key', 'E11000');
                       }
                     }

                     for (var i in data) {
                       // console.log(data[i].A);
                       // console.log(typeof data[i].A);
                       var item = {};
                       item._id = '' + data[i].A;
                       item._createdAt = new Date;
                       item.product = productId;
                       item.company = Meteor.user().company;
                       // item.barcode = data[i].C;
                       // item.status = 'preactive';
                       // if(!Items.findOne(item._id))
                       Items.insert(item);
                       // todo: как показать ошибку на клиенте, если это async? в callback? ага. Где мой async/await?
                     }

                     Timeline.insert({
                                       _createdAt: new Date(),
                                       user: this.userId,
                                       action: 'importItems',
                                       // admin: true,
                                     });


                     // console.log('after timeline.insert');
                     // console.log(result);

                   } catch (e) {
                     console.log(e);
                     throw new Meteor.Error(e.message);
                   }
                 },
               });