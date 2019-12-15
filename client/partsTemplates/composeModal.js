import '../commonFunctions'

function showError(message) {
  toastr.error(message);
}

function showSuccess(message) {
  toastr.success(message);
}

function showInfo(message) {
  toastr.success(message);
}


Template.composeModal.onCreated(() => {
  this.fileIndex = 0;
});

Template.composeModal.helpers({
                                /*mailToCompose(){
                                 let id = Session.get('thisMailId');
                                 if (!id)
                                 return;
                                 let mail = Emails.findOne(id);
                                 if (!mail)
                                 return;
                                 let box = mail.box;
                                 if(box!='Drafts'){
                                 return;
                                 }
                                 return mail;
                                 }*/
                              });

Template.composeModal.events({
                               'click #addAttachment': () => {
                                 this.fileIndex++;
                                 let index = this.fileIndex;
                                 console.log('in click #addAttachment');
                                 $('#composeFilesList').append(`<li style="margin-top: 5px;"> <input type="file" multiple hidden class="btn btn-white compose-attachment"></li>`);
                               },

                               'submit #composeForm': async (e, t) => {
                                 e.preventDefault();

                                 // прохожусь по всем input[type="file"], забираю file


                                 async function getAttachmentsAsBase64() {
                                   let lists = $.map($('input[type="file"].compose-attachment'), elem => elem.files);
                                   let attachments = [];
                                   for (list of lists) {
                                     for (f of list) {
                                       attachments.push(f);
                                     }
                                   }
                                   if (!attachments.length) {
                                     return [];
                                   }

                                   // console.log(attachments);
                                   let at = attachments[0];
                                   const fileToBase64 = file => new Promise((resolve, reject) => {
                                     const reader = new FileReader();
                                     reader.readAsDataURL(file);
                                     reader.onload = () => resolve(reader.result);
                                     reader.onerror = error => reject(error);
                                   });

                                   let attachmentStrings = attachments.map(async att => fileToBase64(att));
                                   attachmentStrings = await Promise.all(attachmentStrings);
                                   for (let i in attachments) {
                                     attachments[i] = {
                                       filename: attachments[i].name,
                                       content: attachmentStrings[i].split(',')[1], // base64 part of DataURL
                                     };
                                   }
                                   return attachments;

                                 }

                                 let options = Session.get('thisAccount');
                                 let attachments = await getAttachmentsAsBase64();
                                 let mail = {
                                   from: options.user,
                                   to: $('#composeTo').val(),
                                   subject: $('#composeSubject').val(),
                                   html: $('#froalaHelper').text(),
                                   attachments: attachments,
                                 }

                                 console.log(mail);
                                 // return;

                                 Meteor.call('sendMessage', Session.get('thisBox'), options, mail, (err, res) => {
                                   if (err) {
                                     showError(err);
                                   }
                                   if (res) {
                                     showSuccess(res);
                                   }
                                 });

                               },
                             });