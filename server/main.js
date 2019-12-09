import {Meteor} from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {BlazeLayout} from 'meteor/kadira:blaze-layout';
import {AccountsServer} from 'meteor/accounts-base';

import '../lib/common';

import './publications/imports';

import './methods/imports';



Meteor.startup(function () {
  // Meteor.absoluteUrl.defaultOptions.rootUrl = 'http://185.251.89.179:3000/';
  console.log('in Meteor.startup');

});
