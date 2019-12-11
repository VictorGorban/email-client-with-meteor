import '../commonFunctions'


Template.composeModal.onCreated(() => {
  this.fileIndex = 0;
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
                                 let lists = $.map($('input[type="file"].compose-attachment'), elem => elem.files);
                                 let attachments = [];
                                 for (list of lists) {
                                   for (f of list) {
                                     attachments.push(f);
                                   }
                                 }
                                 console.log(attachments);
                                 let at = attachments[0];
                                 const fileToBase64 = file => new Promise((resolve, reject) => {
                                   const reader = new FileReader();
                                   reader.readAsDataURL(file);
                                   reader.onload = () => resolve(reader.result);
                                   reader.onerror = error => reject(error);
                                 });
                                 console.log(await fileToBase64(at));
                                 (file=> {
                                   if (!file) {
                                     return;
                                   }
                                   var reader = new FileReader();
                                   reader.onload = function (e) {
                                     var contents = e.target.result;
                                     console.log('contents of file is ' + contents);
                                   };
                                   reader.readAsText(file)
                                 })(at);

                               },
                             });