import mongoose from 'mongoose'
import { merge, map } from 'lodash'

const landlordDefaults = {
  tenant: 'Tenant',
  tenantKey: '_tenant'
}

const landlordMiddlewareDefaults = {
  tenant: landlordDefaults,
  tenantKey: landlordDefaults.tenantKey,
  segmentPath: 'address',
  segmenter: function(req) {
    return req.hostname;
  }
}

export function Landlord(opts) {
  checkForErrors('Landlord Plugin', opts);
  let o = merge({}, landlordDefaults, opts);

  return function(schema, options = {}) {
    let schemaAddition = {};
    schemaAddition[o.tenantKey] = { 
      type: o.mongooseInstance.Schema.Types.ObjectId, 
      ref: o.tenant,
      required: true,
      index: options.index === false ? false : true
    }
    schema.add(schemaAddition);
  }
}

export function LandlordMiddleware(opts) {
  checkForErrors('Landlord Middleware', opts);

  let o = merge({}, landlordMiddlewareDefaults, opts);

  return function(req, res, next) {
    let segment = o.segmenter(req);
    res.locals.db = new DBContext({ 
      segment: segment,
      segmentPath: o.segmentPath,
      mongoose: o.mongooseInstance,
      tenant: o.mongooseInstance.model(o.tenant),
      tenantKey: o.tenantKey
    })
    res.locals.db.getContext(next)
  }
}

class DBContext {
  constructor(opts) {
    this.segment = opts.segment;
    this.segmentPath = opts.segmentPath;
    this.Tenant = opts.tenant;
    this.tenantKey = opts.tenantKey;
    this.mongoose = opts.mongoose;
    this.context = null;
  }

  getContext(done) {
    let query = {}
    query[this.segmentPath] = this.segment;
    this.Tenant.findOne(query).then((result)=> {
      if (result) {
        this.context = result;
      }
      done();
    }, (err)=> {
      console.log(err);
      done();
    });
  }

  getModel(model) {
    let Model = this.mongoose.model(model);
    let query = {}
    query[this.tenantKey] = this.context._id;
    return Model.where(query)
  }

  createModel(model, data, options) {
    let Model = this.mongoose.model(model);
    let tenantRef = {}
    tenantRef[this.tenantKey] = this.context._id;
    let modelInfo = merge({}, tenantRef, data);
    return new Model(modelInfo, options);
  }

  createModels(model, datas, options) {
    let Model = this.mongoose.model(model);
    datas = Array.isArray(datas) ? datas : [datas];
    let models = map(datas, (d)=> {
      d[this.tenantKey] = this.context._id;
      return d
    })
    models.save = function(opts) {
      return Model.create(this, merge({}, options, opts))
    };
    return models;
  }
}

function checkForErrors(name, opts) {
  if (!opts) {
    throw new Error(`${name}: Must pass a configuration object`);
  }

  if (!opts.tenant) {
    throw new Error(`${name}: Must specify a Tenant model`);
  }

  if (!opts.mongooseInstance) {
    throw new Error(`${name}: Must pass in mongoose instance specific to your application`);
  }
}