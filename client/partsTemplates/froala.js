Template.froala.rendered = function () {
  this.editor = new FroalaEditor('#froala-editor', {

    height: 300,
    quickInsertTags: [], // отключил quick insert, там есть вставка изображений
    imagePaste: false,
    toolbarButtonsMD: {
      moreText: {
        // List of buttons used in the  group.
        buttons: [
          'bold',
          'italic',
          'underline',
          'strikeThrough',
          'subscript',
          'superscript',
          'fontFamily',
          'fontSize',
          'textColor',
          'backgroundColor',
          'inlineClass',
          'inlineStyle',
          'clearFormatting',
        ],

        // Alignment of the group in the toolbar.
        align: 'left',

        // By default, 3 buttons are shown in the main toolbar. The rest of them are available when using the more button.
        buttonsVisible: 3,
      },


      moreParagraph: {
        buttons: [
          'alignLeft',
          'alignCenter',
          'alignRight',
          'alignJustify',
          'formatOLSimple',
          'formatOL',
          'formatUL',
          'paragraphFormat',
          'paragraphStyle',
          'lineHeight',
          'outdent',
          'indent',
          'quote',
        ],
        align: 'left',
        buttonsVisible: 3,
      },

      moreRich: {
        buttons: ['insertLink', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly', 'insertHR'],
        align: 'left',
        buttonsVisible: 3,
      },

      moreMisc: {
        buttons: ['undo', 'redo', 'html', 'fullscreen', 'selectAll', 'print', 'getPDF', 'spellChecker', 'help'],
        align: 'right',
        buttonsVisible: 3,
      },
    },


    events: {
      'initialized': function () {
        // Do something here.
        // this is the editor instance.
        // console.log(this);
        // console.log(Template.instance());
        // this.html.set($('#froalaInitHelper').val());
        // let html = Emails.findOne(Session.get('thisMailId')).html; // это дерьмо не работает,
        // потому что из-за логичной сборки Метеор все его пакеты загружаются раньше npm. Надо потом переделать на нормальную.
        // t.editor.html.set(html)
      },
      'contentChanged': function () {
        let html = this.html.get();
        $('#froalaHelper').text(html);

      }
    },
  })
};

Template.froala.events({
                         'click #loadHtml': function (e, t) {
                           console.log('in click #loadHtml');
                           let html = Emails.findOne(Session.get('thisMailId')).html;
                           t.editor.html.set(html)
                         },


                       })
