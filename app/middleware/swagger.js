const send = require('koa-send')
const path = require('path')
const UIHtml = require('../../src/ui-html')
const swaggerPath =  require('../../src').swaggerPath
const swaggerFileName =  require('../../src').swaggerFileName

module.exports = function swagger() {
  return async (context, next) => {
    const {swaggerOpt} = context.app.config.jc2sr
    let pathRoot = swaggerOpt.root
    const pathPrefix = pathRoot.endsWith('/') ? pathRoot.substring(0, pathRoot.length - 1) : pathRoot
    const html = UIHtml(pathPrefix, swaggerFileName, JSON.stringify(swaggerOpt))

    if (context.path.startsWith(pathRoot)) {
      if (context.path === pathRoot && context.method === 'GET') {
        context.type = 'text/html charset=utf-8'
        context.body = html
        context.status = 200
        return
      } else if (
        context.path.startsWith(pathRoot + '/') &&
        context.method === 'GET'
      ) {
        const filePath = context.path.substring(pathRoot.length)
        await send(context, filePath, { root: swaggerPath, maxage: 0})
        return
      }
    }
    return next()
  }
}