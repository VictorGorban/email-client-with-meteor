Blaze.registerHelper('pathFor', function (path, kw) {
  return FlowRouter.path(path, kw.hash);
});

FlowRouter.triggers.enter([
                            () => {
                              window.scrollTo(0, 0);
                            },
                          ]);

FlowRouter.route('/', {
  name: 'mailList.html',
  action() {
    Session.set('sidebar', 'mailList.html');
    // console.log("in / route");
    BlazeLayout.render('mainTemplate', {
      mailAction: 'readMail'
    });
  },
});


/*

FlowRouter.route('/readMail/:id', {
  name: 'readMail',
  action: function (params) {
    Session.set('sidebar', 'readMail');
    BlazeLayout.render('mainTemplate', {
      wrapper: 'pageContent',
      pageContent: 'readMail',
      params: params,
    });
  },
});
*/
