import {Meteor} from 'meteor/meteor';

import '../lib/collections/All';

// import './connections/imports';


import './methods/Emails/imports';

import './publications/imports';



Meteor.startup(function () {
  console.log('in server Meteor.startup');

});
