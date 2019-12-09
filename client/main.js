import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';

// FlowRouter.wait();

// import './router'


// import './collections'
import '/lib/common.js';


import './partsTemplates/imports'

import './main.html';

/*
import './partsTemplates/loader.html';

import './partsTemplates/sidebar.html';
import './partsTemplates/sidebar';

import './partsTemplates/mailList.html';
import './partsTemplates/mailList';

import './partsTemplates/readMail.html';
import './partsTemplates/readMail';
*/




// BlazeLayout.setRoot('#root');

Meteor.startup(function () {

  // FlowRouter.initialize();
  // company и так загружается в mainTemplate
  // Meteor.subscribe('userData', {
  //                    onReady: function () {
  //                      FlowRouter.initialize();
  //                    },
  //                    onError: function () {
  //                      console.log('userData Subscribe error');
  //                    },
  //                  },
  // );


});




