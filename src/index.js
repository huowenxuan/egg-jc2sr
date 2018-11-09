'use strict';
require('reflect-metadata')
const _ = require('lodash')
const moment = require('moment')
const fs = require('fs')
const nodePath = require('path')
const ControllerHandler = require('./ControllerHandler')
const BaseSchema = require('./BaseSchema')
const MethodHandler = require('./MethodHandler')
const joiToSwagger = require('joi-to-swagger')

const ctMap = new Map();
const ctHandler = new ControllerHandler();
const methodHandler = new MethodHandler(ctMap);

const initRouter = (app, options = {}) => {
  const {router, jwt} = app;
  // 设置全局路由前缀
  if (options.prefix) router.prefix(options.prefix);
  options.befores = options.befores || [];
  options.after = options.after || [];

  let swaggerJson = null;
  let swaggerOpt = null;
  let swaggerOpened = options.swaggerOpt && options.swaggerOpt.open
  if (swaggerOpened) {
    swaggerOpt = options.swaggerOpt;
    swaggerJson = {
      swagger: '2.0',
      info: {
        title: swaggerOpt.title || '',
        version: swaggerOpt.version || '',
        description: `
Host ${app.config.host}\n
更新于 ${moment().format('YYYY-MM-DD HH:mm:ss')}\n
<strong>浏览器有缓存 Cmd+Shift+R（或Ctrl + F5） 强制刷新</strong>\n
    返回格式统一为
    {
      success: true | false,
      data: object | null,
      error: null | string
    }
    也可根据状态码判断是否正确
    
百翠山居scenic_id 1037975263817895936\n
一个user_id 1
`
      },
      host: '',
      basePath: options.prefix,
      schemes: ['http', 'https'],
      tags: [],
      paths: {},
      definitions: {}
    };
  }

  for (const c of ctMap.values()) {
    // 解析控制器元数据
    let {ignoreJwtAll, beforeAll, afterAll, prefix, tagsAll, tokenTypeAll, renderController} = ctHandler.getMetadata(c.constructor);
    const propertyNames = _.filter(Object.getOwnPropertyNames(c), pName => {
      return pName !== 'constructor' && pName !== 'pathName' && pName !== 'fullPath';
    });

    // 以文件名为路由前缀，暂不使用
    // 解析前缀
    // const fullPath = c.fullPath.split('\\').join('/').replace(/[\/]{2,9}/g, '/').replace(/(\.ts)|(\.js)/g, '');
    // const rootPath = 'controller/';
    // prefix = prefix || fullPath.substring(fullPath.indexOf(rootPath) + rootPath.length);
    // prefix = prefix.startsWith('/') ? prefix : '/' + prefix;
    prefix = '';

    if (swaggerOpened && tagsAll) {
      tagsAll.name = tagsAll.name || prefix;
      swaggerJson.tags.push(tagsAll);
    }

    for (const pName of propertyNames) {
      // 解析函数元数据
      let {
        reqMethod, path, befores, after, message, ignoreJwt, deprecated, tags, summary, description,
        body, query,
        response, produces, consumes, tokenType, render
      } = methodHandler.getMetadata(c[pName]);
      if (!reqMethod) {
        continue
      }

      const finallyBefores = [...options.befores, ...beforeAll, ...befores];
      const afters = [...options.after, ...afterAll, ...after];

      let parameters = []

      let params = getParams(path);
      parameters.push(...(params || []).map(el => {
        let defaultValue = {name: 'el', in: 'path', required: false, type: 'string'}
        if (_.isString(el)) {
          return {...defaultValue, name: el}
        } else {
          return {...defaultValue, ...el}
        }
      }))

      parameters.push(...(query || []).map(el => {
        let defaultValue = {name: '', in: 'query', required: false, type: 'string'}
        if (_.isString(el)) {
          return {...defaultValue, name: el}
        } else {
          return {...defaultValue, ...el}
        }
      }))

      if (body) {
        parameters.push({name: 'body', in: 'body', schema: joiToSwagger(body).swagger})
      }

      let responses = response
        ? {200: {schema: joiToSwagger(response).swagger}}
        : null

      if (swaggerOpened) {
        let finallyPath = prefix + path;
        finallyPath = replaceColon(finallyPath);

        if (!_.isEmpty(swaggerOpt.tokenOpt) && jwt && !ignoreJwtAll && !ignoreJwt) {
          const tokenOpt = swaggerOpt.tokenOpt;
          let token = null;
          if (!_.isEmpty(tokenOpt.tokens)) {
            let globalTokenType = null;
            let partTokenType = null;
            let defaultTokenType = tokenType || tokenTypeAll || tokenOpt.defaultTokenType || partTokenType || globalTokenType;
            if (!defaultTokenType) {
              defaultTokenType = Object.keys(tokenOpt.tokens)[0];
            }
            token = tokenOpt.tokens[defaultTokenType];
          } else if (tokenOpt.token) {
            token = tokenOpt.token;
          }
          if (token) {
            parameters.unshift({
              name: 'Authorization', in: 'header', description: 'Token', type: 'string', defaultValue: 'Bearer ' + token
            });
          }
        }

        if (!swaggerJson.paths[finallyPath]) {
          swaggerJson.paths[finallyPath] = {};
        }
        swaggerJson.paths[finallyPath][reqMethod] = {
          tags: ((tags && !Array.isArray(tags)) ? [tags] : tags)
            || (tagsAll && [tagsAll.name])
            || [prefix],
          summary: summary || description,
          description,
          deprecated,
          produces: (produces && !Array.isArray(produces)) ? [produces] : produces,
          consumes: (consumes && !Array.isArray(consumes)) ? [consumes] : consumes,
          parameters,
          responses
        };
      }

      const routerCb = async (ctx, next) => {
        const instance = new c.constructor(ctx);
        try {
          if (!ignoreJwt && !ignoreJwtAll && jwt && options.jwtValidation) {
            await options.jwtValidation()(ctx, next);
          }
          for (const before of finallyBefores) {
            await before(app)(ctx, next);
          }

          body && await ctx.validateJoi(body)
          await instance[pName]({
            body: ctx.request ? ctx.request.body : {},
            query: ctx.request ? ctx.request.query : {},
            params: ctx.params || {}
          });
          if (renderController || render) {
            ctx.set('Content-Type', 'text/html;charset=utf-8');
          }
          for (const after of afters) {
            await after()(ctx, next);
          }
        } catch (error) {
          throw error;
        }
      };

      // app.logger.debug(`${reqMethod.toUpperCase()} ${prefix + path}`)
      router[reqMethod](prefix + path, routerCb);
    }
  }

  if (swaggerOpened) {
    const outPath = nodePath.join(__dirname, nodePath.normalize('../../../public/swagger/swagger.json'));
    fs.writeFileSync(outPath, JSON.stringify(swaggerJson), {encoding: 'utf8'});
    app.logger.debug('swagger文档已生成  ' + app.config.host + '/swagger')
  }
};

const paramsRegex = /:[\w-]*/g;

function getParams(path) {
  let params = []
  const getParam = () => {
    const matchs = paramsRegex.exec(path);
    if (!matchs) return path;
    let length = matchs[0].length
    let param = matchs[0].substr(1, length - 1)
    path = path.replace(matchs[0], param);
    params.push(param)
    getParam(path)
  }
  getParam()
  return params
}

// 将冒号更换为{}
function replaceColon(path) {
  // 是否有冒号开头的参数
  const matchs = paramsRegex.exec(path);
  if (!matchs) return path;
  const pathItem = matchs[0].replace(':', '{') + '}';
  path = path.replace(matchs[0], pathItem);
  return replaceColon(path);
}

module.exports = {
  initRouter,
  createSchema: BaseSchema.createSchema,
  createSingleSchema: BaseSchema.createSingleSchema,
  methodHandler,
  ctHandler
};
