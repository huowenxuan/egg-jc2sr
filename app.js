'use strict';

const fs = require('fs')
const path = require('path')
const initRouter = require('./src').initRouter

module.exports = async app => {
  app.beforeStart(async ()=>{
    await initRouter(app, app.config.jc2sr)
  })
  app.config.middleware.unshift('swagger')
};
