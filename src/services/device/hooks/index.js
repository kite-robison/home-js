'use strict';

const trigger = require('./trigger');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const push = require('./push');
const commonHooks = require('feathers-hooks-common');

exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    // debug()
  ],
  find: [],
  get: [],
  create: [],
  update: [
    commonHooks.iff(commonHooks.isProvider('external'), push()),
    trigger() 
  ],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
