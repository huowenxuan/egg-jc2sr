'use strict';
require('reflect-metadata');

const METADATA = {
  CONTROLLER_PREFIX: 'controller_prefix',
  CONTROLLER_AFTER_ALL: 'controller_after',
  CONTROLLER_BEFORE_ALL: 'controller_before_all',
  CONTROLLER_IGNORE_JWT_ALL: 'controller_ignore_jwt_all',
  CONTROLLER_TAGS_ALL: 'controller_tags_all',
  CONTROLLER_TOKEN_TYPE_ALL: 'controller_token_type_all',
  CONTROLLER_RENDER: 'controller_render'
}

const createArrayDecorator = Symbol('createArrayDecorator');
const createSingleDecorator = Symbol('createSingleDecorator');
const createTagsAllDecorator = Symbol('createTagsAllDecorator');

class ControllerHandler {
  ignoreJwtAll () {
    return this[createSingleDecorator](METADATA.CONTROLLER_IGNORE_JWT_ALL)(true);
  }

  beforeAll () {
    return this[createArrayDecorator](METADATA.CONTROLLER_BEFORE_ALL);
  }

  afterAll () {
    return this[createArrayDecorator](METADATA.CONTROLLER_AFTER_ALL);
  }

  prefix () {
    return this[createSingleDecorator](METADATA.CONTROLLER_PREFIX);
  }

  tagsAll () {
    return this[createTagsAllDecorator](METADATA.CONTROLLER_TAGS_ALL);
  }

  tokenTypeAll () {
    return this[createSingleDecorator](METADATA.CONTROLLER_TOKEN_TYPE_ALL);
  }

  renderController () {
    return this[createSingleDecorator](METADATA.CONTROLLER_RENDER)(true);
  }

  getMetadata (target) {
    const ignoreJwtAll = Reflect.getMetadata(METADATA.CONTROLLER_IGNORE_JWT_ALL, target);
    const beforeAll = Reflect.getMetadata(METADATA.CONTROLLER_BEFORE_ALL, target) || [];
    const afterAll = Reflect.getMetadata(METADATA.CONTROLLER_AFTER_ALL, target) || [];
    const prefix = Reflect.getMetadata(METADATA.CONTROLLER_PREFIX, target);
    const tagsAll = Reflect.getMetadata(METADATA.CONTROLLER_TAGS_ALL, target);
    const tokenTypeAll = Reflect.getMetadata(METADATA.CONTROLLER_TOKEN_TYPE_ALL, target);
    const renderController = Reflect.getMetadata(METADATA.CONTROLLER_RENDER, target);
    return {
      ignoreJwtAll,
      beforeAll,
      afterAll,
      prefix,
      tagsAll,
      tokenTypeAll,
      renderController
    };
  }

  [createSingleDecorator] (metadata) {
    return value => {
      return (target, key, descriptor) => {
        Reflect.defineMetadata(metadata, value, target);
      };
    };
  }

  [createTagsAllDecorator] (metadata) {
    return (value1, value2) => {
      return (target, key, descriptor) => {
        Reflect.defineMetadata(metadata, {
          name: value1,
          description: value2
        }, target);
      };
    };
  }

  [createArrayDecorator] (metadata) {
    return values => {
      return target => {
        const _values = Reflect.getMetadata(metadata, target) || [];
        values = (values instanceof Array) ? values : [ values ];
        values = values.concat(_values);
        Reflect.defineMetadata(metadata, values, target);
      };
    };
  }
}

module.exports = ControllerHandler;
