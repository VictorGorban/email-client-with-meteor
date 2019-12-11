Meteor.methods({
                 connectImap(options) {
                   var Imap = require('imap'),
                       inspect = require('util').inspect;

                   ImapConnection = new Imap({
                                         user: options.user,
                                         password: options.password,
                                         host: options.host,
                                         port: options.port,
                                         tls: true
                                       });

                 },
                 connectSmtp(options) { // нет необходимости?


                 },
               });
