const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
const _ = require('lodash')

/**
 * 用于Joi参数校验与swagger文档生成
 */
class BaseSchema {
  constructor() {
    this.Joi = Joi
  }

  getDefault() {
    return {}
  }

  create(otherParams = {}) {
    return {
      ...this.getDefault(),
      ...otherParams
    }
  }

  /**
   * 更新就是把创建所需的所有参数都变成非必须的
   */
  update() {
    let schemas = _.cloneDeep(this.create())
    for (let v in schemas) {
      if (_.get(schemas[v], '_flags.presence') === 'required') {
        schemas[v]._flags.presence = undefined
      }
    }
    return schemas
  }

  detail(otherParams = {}) {
    return {
      ...this.getDefault(),
      ...otherParams
    }
  }

  bulkCreate() {
    return Joi.array().items(this.create())
  }

  list() {
    return Joi.array().items(this.detail())
  }
}


/**
 * 创建schema类
 * @param {default, create, response}
 */
function createSchema(cb) {
  const params = cb(Joi)
  class Schema extends BaseSchema {
    getDefault() {
      return params.default
    }

    create() {
      return super.create(params.create)
    }

    detail() {
      return super.detail(params.response)
    }
  }

  return new Schema()
}

/* 创建一个简单schema */
function createSingleSchema(cb) {
  return cb(Joi)
}

module.exports = {
  createSchema,
  createSingleSchema
}