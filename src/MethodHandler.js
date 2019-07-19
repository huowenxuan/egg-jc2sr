'use strict';

const METADATA = {
  PATH: 'path',
  METHOD: 'method',
  BEFORES: 'befores',
  AFTER: 'after',
  MESSAGE: 'message',
  DEPRECATED: 'deprecated',
  TAGS: 'tags',
  SUMMARY: 'summary',
  DESCRIPTION: 'description',
  BODY: 'body',
  QUERY: 'query',
  RESPONSE: 'response',
  PRODUCES: 'produces',
  CONSUMES: 'consumes',
  TOKEN_TYPE: 'token_type',
  RENDER: 'render',
  JWT: 'jwt',
  FOR: 'For'
}

const createMappingDecorator = Symbol('createMappingDecorator');
const createSingleDecorator = Symbol('createSingleDecorator');
const createArrayDecorator = Symbol('createArrayDecorator');
const mappingRequest = Symbol('mappingRequest');

class MethodHandler {
  constructor (cMap) {
    this.cMap = cMap;
  }

  getMetadata (targetCb) {
    const reqMethod = Reflect.getMetadata(METADATA.METHOD, targetCb);
    const path = Reflect.getMetadata(METADATA.PATH, targetCb);
    const befores = Reflect.getMetadata(METADATA.BEFORES, targetCb) || [];
    const after = Reflect.getMetadata(METADATA.AFTER, targetCb) || [];
    const message = Reflect.getMetadata(METADATA.MESSAGE, targetCb);
    const deprecated = Reflect.getMetadata(METADATA.DEPRECATED, targetCb);
    const jwt = Reflect.getMetadata(METADATA.JWT, targetCb);
    const body = Reflect.getMetadata(METADATA.BODY, targetCb) || null;
    const query = Reflect.getMetadata(METADATA.QUERY, targetCb) || [];
    const response = Reflect.getMetadata(METADATA.RESPONSE, targetCb) || null;
    const tags = Reflect.getMetadata(METADATA.TAGS, targetCb);
    const summary = Reflect.getMetadata(METADATA.SUMMARY, targetCb);
    const description = Reflect.getMetadata(METADATA.DESCRIPTION, targetCb);
    const produces = Reflect.getMetadata(METADATA.PRODUCES, targetCb) || [ 'application/json' ];
    const consumes = Reflect.getMetadata(METADATA.CONSUMES, targetCb) || [ 'application/json' ];
    const tokenType = Reflect.getMetadata(METADATA.TOKEN_TYPE, targetCb);
    const render = Reflect.getMetadata(METADATA.RENDER, targetCb);

    const For = Reflect.getMetadata(METADATA.FOR, targetCb);

    return {
      reqMethod,
      path,
      befores,
      after,
      message,
      deprecated,
      body,
      query,
      response,
      tags,
      summary,
      description,
      produces,
      consumes,
      tokenType,
      render,
      jwt,
      For
    };
  }

  get () {
    return this[createMappingDecorator]('get');
  }

  post () {
    return this[createMappingDecorator]('post');
  }

  put () {
    return this[createMappingDecorator]('put');
  }

  delete () {
    return this[createMappingDecorator]('delete');
  }

  patch () {
    return this[createMappingDecorator]('patch');
  }

  options () {
    return this[createMappingDecorator]('options');
  }

  head () {
    return this[createMappingDecorator]('head');
  }

  befores () {
    return this[createArrayDecorator](METADATA.BEFORES);
  }

  after () {
    return this[createArrayDecorator](METADATA.AFTER);
  }

  message () {
    return this[createSingleDecorator](METADATA.MESSAGE);
  }

  deprecated() {
    return this[createSingleDecorator](METADATA.DEPRECATED);
  }

  jwt() {
    return this[createSingleDecorator](METADATA.JWT);
  }

  tags () {
    return this[createArrayDecorator](METADATA.TAGS);
  }

  summary () {
    return this[createSingleDecorator](METADATA.SUMMARY);
  }

  description () {
    return this[createSingleDecorator](METADATA.DESCRIPTION);
  }

  body () {
    return this[createSingleDecorator](METADATA.BODY);
  }

  query () {
    return this[createArrayDecorator](METADATA.QUERY);
  }

  response () {
    return this[createSingleDecorator](METADATA.RESPONSE);
  }

  produces () {
    return this[createArrayDecorator](METADATA.PRODUCES);
  }

  consumes () {
    return this[createArrayDecorator](METADATA.CONSUMES);
  }

  tokenType () {
    return this[createSingleDecorator](METADATA.TOKEN_TYPE);
  }

  render () {
    return this[createSingleDecorator](METADATA.RENDER)(true);
  }

  For() {
    return this[createSingleDecorator](METADATA.FOR);
  }

  [createMappingDecorator] (method) {
    return path => {
      return this[mappingRequest]({
        [METADATA.PATH]: path,
        [METADATA.METHOD]: method,
      });
    };
  }

  [mappingRequest] (metadata) {
    const path = metadata[METADATA.PATH];
    const reqMethod = metadata[METADATA.METHOD];

    return (target, key, descriptor) => {
      this.cMap.set(target, target);
      Reflect.defineMetadata(METADATA.PATH, path, descriptor.value);
      Reflect.defineMetadata(METADATA.METHOD, reqMethod, descriptor.value);
      return descriptor;
    };
  }

  [createSingleDecorator] (metadata) {
    return value => {
      return (target, key, descriptor) => {
        this.cMap.set(target, target);
        Reflect.defineMetadata(metadata, value, descriptor.value);
        return descriptor;
      };
    };
  }

  [createArrayDecorator] (metadata) {
    return values => {
      return (target, key, descriptor) => {
        const _values = Reflect.getMetadata(metadata, descriptor.value) || [];
        values = (values instanceof Array) ? values : [ values ];
        values = values.concat(_values);
        Reflect.defineMetadata(metadata, values, descriptor.value);
        return descriptor;
      };
    };
  }
}

module.exports = MethodHandler;
