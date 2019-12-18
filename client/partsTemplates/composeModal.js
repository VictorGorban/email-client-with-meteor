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

async function getAttachmentsAsUtf8Array() {
  let convertBase64ToBinary = function (base64) {
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for(i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  };

  let attachments = await getAttachmentsAsBase64();

  for (let i = 0; i < attachments.length; i++) {
    attachments[i].content = convertBase64ToBinary(attachments[i].content);
  }

  return attachments;

}

Template.composeModal.events({
                               'click .processModalTrigger': async function (e, t) {
                                 $('#composeModal').modal('hide');


                                 let options = Session.get('thisAccount');
                                 let attachments = await getAttachmentsAsUtf8Array();
                                 for(let att of attachments){
                                   // att.content =
                                   console.log(att.content);
                                 }
                                 let mail = {
                                   from: options.user,
                                   to: $('#composeTo').val(),
                                   subject: $('#composeSubject').val(),
                                   html: $('#froalaHelper').text(),
                                   attachments: attachments,
                                 };

                                 Session.set('mailToProcess', mail);

                                 $('#processMailModal').modal('show');
                               },
                               'click #addAttachment': () => {
                                 this.fileIndex++;
                                 let index = this.fileIndex;
                                 console.log('in click #addAttachment');
                                 $('#composeFilesList').append(`<li style="margin-top: 5px;"> <input type="file" multiple hidden class="btn btn-white compose-attachment"></li>`);
                               },

                               'submit #composeForm': async (e, t) => {
                                 e.preventDefault();

                                 // прохожусь по всем input[type="file"], забираю file


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
                                     showError('can\'t submit the message. Check your credentials');
                                   }
                                   if (res) {
                                     showSuccess(res);
                                   }
                                 });

                               },
                             });