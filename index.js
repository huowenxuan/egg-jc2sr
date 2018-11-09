const src = require('./src')
const methodHandler = src.methodHandler
const ctHandler = src.ctHandler

module.exports = {
  initRouter:src.initRouter,
  createSchema:src.createSchema,
  createSingleSchema:src.createSingleSchema,

  Get:methodHandler.get(),
  Post:methodHandler.post(),
  Put:methodHandler.put(),
  Delete:methodHandler.delete(),
  Patch:methodHandler.patch(),
  Options:methodHandler.options(),
  Head:methodHandler.head(),

  Befores:methodHandler.befores(),
  After:methodHandler.after(),
  Message:methodHandler.message(),
  IgnoreJwt:methodHandler.ignoreJwt(),
  Deprecated:methodHandler.deprecated(),

  Tags:methodHandler.tags(),
  Summary:methodHandler.summary(),
  Description:methodHandler.description(),
  Body:methodHandler.body(),
  Query:methodHandler.query(),
  Response:methodHandler.response(),
  Produces:methodHandler.produces(),
  Consumes:methodHandler.consumes(),
  TokenType:methodHandler.tokenType(),
  Render:methodHandler.render(),

  IgnoreJwtAll:ctHandler.ignoreJwtAll(),
  BeforeAll:ctHandler.beforeAll(),
  AfterAll:ctHandler.afterAll(),
  Prefix:ctHandler.prefix(),
  TagsAll:ctHandler.tagsAll(),
  TokenTypeAll:ctHandler.tokenTypeAll(),
  RenderController:ctHandler.renderController(),
}
