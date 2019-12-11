

Meteor.publish('emails', function (boxName = 'INBOX') {
  // boxName = boxName.toUpperCase(); // неа, не катит.



  console.log('in publish');
  // console.log(Emails.find({box: boxName}).count());

  return Emails.find({box: boxName}); // Когда emails обновятся, клиент тоже должен обновиться
});
