function retrieveEmails(boxName, options, limit) {
  // return;

  // console.log(options);

  var bound = Meteor.bindEnvironment(function (callback) {
    return callback();
  });


  var Imap = require('imap'),
      inspect = require('util').inspect;
  const parser = require('mailparser').simpleParser;

  var imap = new Imap({
                        ...options,
                        tls: true,
                      });

  return new Promise((resolve, reject) => {
    bound(function () {
      imap.once('ready', function () {
        // console.log('in imap.once(ready');
        bound(function () {
          imap.openBox(boxName, false, function (err, box) {
            bound(function () {
              if (err) {
                reject(err);
                // throw err;
              }

              // console.log(box.messages.total + ' messages found!');
              let total = box.messages.total;
              // 1:* - Retrieve all messages
              // 3:5 - Retrieve messages #3,4,5
              // console.log(typeof total);
              if (total == 0) {
                Emails.remove({
                                box: boxName,
                                user: options.user,
                              });
                resolve('no emails');
                return;
              }
              if (total - limit < limit) {
                limit -= (limit - total + 1);
              }
              // console.log('search by ' + `${total - limit}:${total}`); // все что больше -удалить, все что меньше - удалить. Остальное upsert.

              console.log('user: ' + options.user);
              Emails.remove({
                              box: boxName,
                              seqno: {$gt: total},
                              user: options.user,
                            });
              Emails.remove({
                              box: boxName,
                              seqno: {$lt: total - limit},
                              user: options.user,
                            });

              // console.log('extras removed');

              var f = imap.seq.fetch(`${total - limit}:${total}`, { // seq работает, просто fetch нет. Заебись.
                bodies: '',
              });
              f.on('message', function (msg, seqno) {
                bound(function () {
                  // console.log('Message #%d', seqno);

                  let mailObj = {
                    seqno,
                    box: boxName,
                    user: options.user,
                  };

                  var prefix = '(#' + seqno + ') ';
                  msg.once('attributes', function (attrs) {
                    mailObj.flags = attrs.flags;
                    // console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                  });
                  msg.on('body', function (stream, info) {
                    // use a specialized mail parsing library (https://github.com/andris9/mailparser)
                    bound(function () {
                      parser(stream, (err, parsed) => {
                        // console.log(prefix + mail.subject);
                        // console.log(prefix + mail.text);
                        bound(function () {
                          let options = {
                            subject: parsed.subject,
                            from: parsed.from.text,
                            to: parsed.to.text,
                            date: parsed.date,
                            // html: parsed.html,
                            messageId: parsed.messageId,
                            // attachments: parsed.attachments.map(a => {
                            //   return {
                            //     filename: a.filename,
                            //     size: a.size,
                            //     contentType: a.contentType, /*content: a.content*/
                            //   };
                            // }),

                          };

                          mailObj = {...mailObj, ...options};

                          // console.log('mailObj.user is '+ mailObj.user);
                          // console.log('lets upsert');
                          Emails.upsert({
                                          seqno: mailObj.seqno,
                                          box: mailObj.box,
                                          user: mailObj.user,
                                        }, {$set: mailObj}); // update or insert. Решает проблему с синхронизацией входящих писем. Хотя не удаляет уже удаленные.
                          // console.log(mailObj); // иначе никак, из-за парсера end получается раньше чем заканчивается парсинг.
                          // where to return??? Need to wrap into function, then return Emails.find
                        });
                      });

                    });
                    // or, write to file
                    //stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
                  });


                  msg.once('end', function () {
                    // console.log(mailObj);
                    // console.log(prefix + 'Finished');
                  });
                });
              });


              f.once('error', function (err) {
                reject(err);
                console.log('Fetch error: ' + err);
              });
              f.once('end', function () {
                console.log('fetch finished');
                resolve('fetch finished');
                // console.log('syncing done');
                imap.end(); // отменить нельзя, ошибка (reset)
              });
            });
            // search example
            //    imap.search([ 'UNSEEN', ['SINCE', 'May 20, 2010'] ], function(err, results) {
            //      if (err) throw err;
            //      var f = imap.fetch(results, { bodies: '' });
            //      ...
            //    }

          });
        });
      });

      imap.once('error', function (err) {
        reject(err);
        bound(function (err) {
          console.log(err);
          Timeline.insert({
                            type: 'error',
                            message: 'an error occured. Maybe you passed incorrect params? Or you lost the connection?',
                            details: err,
                          })
        });
      });

      imap.once('end', function () {
        console.log('Connection ended');
      });
      imap.connect();
    });
  });
}

async function sendOutbox(options) {
  let mails = Emails.find({notSent: true});
  if (!mails.count()) {
    return;
  }
  // connection, send
}

Meteor.method('loadEmail', (boxName, options, seqNumber) => {
  // boxName = boxName.toUpperCase();
  // console.log(boxName);
  console.log(`in loadEmail from ${boxName} with seq #${seqNumber}`);

  options = {
    user: options.user,
    password: options.password,
    host: options.imap.address,
    port: options.imap.port,
  };
  // console.log(options);

  var bound = Meteor.bindEnvironment(function (callback) {
    return callback();
  });


  var Imap = require('imap'),
      inspect = require('util').inspect;
  const parser = require('mailparser').simpleParser;

  var imap = new Imap({
                        ...options,
                        tls: true,
                      });
  return new Promise((resolve, reject) => {
    bound(function () {
      imap.once('ready', function () {
        // console.log('in loadAttachments imap.once(ready');
        bound(function () {
          imap.openBox(boxName, false, function (err, box) {
            // console.log(box.messages);
            bound(function () {
              if (err) {
                // throw err;
                reject(err);
              }
              // console.log('search by ' + `${seqNumber}:${seqNumber}`); // все что больше -удалить, все что меньше - удалить. Остальное upsert.

              var f = imap.seq.fetch(`${seqNumber}:${seqNumber}`, { // seq работает, просто fetch нет. Заебись.
                bodies: '',
                markSeen: true, // mark as seed when fetching
              });
              f.on('message', function (msg, seqno) {
                bound(function () {
                  // console.log('Message #%d', seqno);

                  let mailObj = {
                    seqno,
                    box: boxName,
                    user: options.user,
                  };

                  msg.on('body', function (stream, info) {
                    // use a specialized mail parsing library (https://github.com/andris9/mailparser)
                    bound(function () {
                      parser(stream, (err, parsed) => {
                        // console.log(prefix + mail.subject);
                        // console.log(prefix + mail.text);
                        bound(function () {
                          console.log(parsed.attachments);
                          let options = {
                            html: parsed.html,
                            attachments: parsed.attachments.map(a => {
                              return {
                                filename: a.filename,
                                size: a.size,
                                contentType: a.contentType,
                                content: a.content,
                              };
                            }),

                          };

                          mailObj = {...mailObj, ...options};

                          // console.log('lets upsert');
                          Emails.upsert({
                                          seqno: mailObj.seqno,
                                          box: mailObj.box,
                                          user: mailObj.user,
                                        }, {$set: mailObj}); // update or insert. Решает проблему с синхронизацией входящих писем. Хотя не удаляет уже удаленные.
                          // console.log(mailObj); // иначе никак, из-за парсера end получается раньше чем заканчивается парсинг.
                          // where to return??? Need to wrap into function, then return Emails.find
                        });
                      });

                    });
                    // or, write to file
                    //stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
                  });

                  msg.once('attributes', function (attrs) {
                    mailObj.flags = attrs.flags;
                    // console.log('Attributes: ', inspect(attrs, false, 8));
                  });
                  msg.once('end', function () {
                    // console.log(mailObj);
                    // console.log(prefix + 'Finished');
                  });
                });
              });


              f.once('error', function (err) {
                console.log('Fetch error: ' + err);
                reject(err);
              });
              f.once('end', function () {
                // console.log('fetch finished');
                resolve('fetching email done');

                imap.end(); // отменить нельзя, ошибка (reset)
              });
            });

          });
        });
      });

      imap.once('error', function (err) {
        reject(err);
        bound(function (err) {
          console.log(err);
        });
      });

      imap.once('end', function () {
        // console.log('Connection ended');
      });
      imap.connect();
    });
  });
});

Meteor.method('moveEmailToOtherBox', (boxName, targetBoxName, options, seqNumber) => {
  console.log(boxName, targetBoxName, options, seqNumber);
  // boxName = boxName.toUpperCase();
  // console.log(boxName);
  console.log(`in moveEmailToOtherBox from ${boxName} to ${targetBoxName} with seq #${seqNumber}`);
  if (!options || Object.entries(options).length === 0) {
    options = {
      user: 'victorgorban2@ya.ru',
      password: '1999gorban',
      host: 'imap.yandex.ru',
      port: 993,
    }
  }

  // console.log(options);

  var bound = Meteor.bindEnvironment(function (callback) {
    return callback();
  });

  var Imap = require('imap'),
      inspect = require('util').inspect;
  const parser = require('mailparser').simpleParser;

  var imap = new Imap({
                        ...options,
                        tls: true,
                      });
  return new Promise((resolve, reject) => {
    bound(function () {
      imap.once('ready', function () {
        console.log('in loadAttachments imap.once(ready');
        bound(function () {
          imap.openBox(boxName, false, function (err, box) {
            // console.log(box.messages);
            bound(function () {
              imap.seq.move(seqNumber, targetBoxName, function (err) {
                bound(function () {
                  console.log('in imap.seq.move callback');

                  if (err) {
                    reject('failed to move');
                  }

                  // emails
                  // если письмо переместилось, то я увижу это при синхронизации. Т.е. надо удалить из emails
                  Emails.remove({
                                  box: boxName,
                                  seqno: seqNumber,
                                });
                  resolve('moved');
                });
              });
            });

          });
        });
      });

      imap.once('error', function (err) {
        reject(err);
        bound(function (err) {
          console.log(err);
          Timeline.insert({
                            type: 'error',
                            message: 'an error occured. Maybe you passed incorrect params? Or you lost the connection?',
                            details: err,
                          })
        });
      });

      imap.once('end', function () {
        // console.log('Connection ended');
      });
      imap.connect();
    });
  });
});
Meteor.method('deleteEmail', (boxName, options, seqNumber) => {
  console.log(boxName, options, seqNumber);
  // boxName = boxName.toUpperCase();
  // console.log(boxName);
  console.log(`in deleteEmail from ${boxName} with seq #${seqNumber}`);
  if (!options || Object.entries(options).length === 0) {
    options = {
      user: 'victorgorban2@ya.ru',
      password: '1999gorban',
      host: 'imap.yandex.ru',
      port: 993,
    }
  }

  // console.log(options);

  var bound = Meteor.bindEnvironment(function (callback) {
    return callback();
  });

  var Imap = require('imap'),
      inspect = require('util').inspect;
  const parser = require('mailparser').simpleParser;

  var imap = new Imap({
                        ...options,
                        tls: true,
                      });
  return new Promise((resolve, reject) => {
    bound(function () {
      imap.once('ready', function () {
        bound(function () {
          imap.openBox(boxName, false, function (err, box) {
            // console.log(box.messages);
            bound(function () {
              imap.seq.addFlags(seqNumber, 'Deleted', function (err) {
                if (err) {
                  reject(err);
                }
                bound(function () {
                  Emails.remove({
                                  box: boxName,
                                  seqno: seqNumber,
                                });
                  imap.closeBox(true, function (err) {
                    if (err) {
                      reject(err);
                    }
                  });
                  resolve('completely deleted');
                });
              });
            });
          });

        });
      });
    });

    imap.once('error', function (err) {
      reject(err);
    });

    imap.once('end', function () {
      // console.log('Connection ended');
    });
    imap.connect();
  });
});

Meteor.method('syncBox', async (boxName = '', options = null, limit = 30) => {
  options = {
    user: options.user,
    password: options.password,
    host: options.imap.address,
    port: options.imap.port,
  };
  // retrieveEmails(boxName, options, limit);
  // Timeline.remove({}, async () => {
  // await sendOutbox(options);
  // Emails.remove({box: boxName});
  let result = await retrieveEmails(boxName, options, limit);
  // console.log(result);
  return result;
  // }); // Мне нужен только сам факт добавления в коллекцию
});


Meteor.method('sendEmail', function (options, email) {

});

/*Meteor.method('tryConnectSmtp', function (options) {
 if (!options.host) {
 options.host = options.address;
 }

 if (!options.pass) {
 options.pass = options.password;
 }
 const SMTPConnection = require('nodemailer/lib/smtp-connection');

 return new Promise((resolve, reject) => {
 let connection = new SMTPConnection({
 ...options,
 secure: true,
 });

 console.log('before login');
 connection.login(options, (err, res) => {
 if (err) {
 console.log(err);
 reject(err);
 }
 });
 });

 });

 Meteor.method('tryConnectImap', function (options) {

 });*/

Meteor.method('getBoxes', (options = null) => {
  // return;
  console.log('in getBoxes');
  // options = {
  //   user: 'victorgorban2@ya.ru',
  //   password: '1999gorban',
  //   host: 'imap.yandex.ru',
  //   port: 993,
  // };
  options = {
    user: options.user,
    password: options.password,
    host: options.imap.address,
    port: options.imap.port,
  };

  // options.password = '2354325';

  console.log(options);
  // return;


  var Imap = require('imap');

  var imap = new Imap({
                        ...options,
                        tls: true,
                      });

  // console.log('before return new Promise');
  return new Promise((resolve, reject) => {
    imap.once('ready', function () {
      console.log('imap.once(ready');

      imap.getBoxes('', (err, boxes) => {
        if (err) {
          reject(err.textCode);
        }


        console.log(Object.getOwnPropertyNames(boxes));
        for (let key of Object.getOwnPropertyNames(boxes))
        {
          delete boxes[key].children;
          // console.log(boxes[key]);
        }

        // reject('wait a bit');
        resolve(boxes); // if there is a filter, than we have circular in children
      })
    });

    imap.once('error', function (err) {
      reject(err.textCode);
    });

    imap.connect();
  });


});
