import mongoose from 'mongoose'
import { merge } from 'lodash'

const landlordMiddlewareDefaults = {
  segmentPath: 'address',
  segmenter: function(req) {
    return req.hostname;
  }
}

export function Landlord(opts) {
  checkForErrors('Landlord Plugin', opts);
  
  return function(schema, options = {}) {
    schema.add({'_tenant': { 
      type: opts.mongooseInstance.Schema.Types.ObjectId, 
      ref: opts.tenant,
      required: true,
      index: options.index === false ? false : true
    }})
  }
}

export function LandlordMiddleware(opts) {
  checkForErrors('Landlord Middleware', opts);

  let o = merge({}, landlordMiddlewareDefaults, opts);
  let Tenant = o.mongooseInstance.model(o.tenant)
  
  return function(req, res, next) {
    let segment = o.segmenter(req);
    res.locals.db = new DBContext({ 
      segment: segment,
      segmentPath: o.segmentPath,
      mongoose: o.mongooseInstance,
      tenant: Tenant
    })
    res.locals.db.getContext(()=> {
      next()
    })
  }
}

class DBContext {
  constructor(opts) {
    this.segment = opts.segment;
    this.segmentPath = opts.segmentPath;
    this.Tenant = opts.tenant;
    this.mongoose = opts.mongoose;
    this.context = null;
  }

  getContext(done) {
    let query = {}
    query[this.segmentPath] = this.segment;
    this.Tenant.findOne(query).then((result) => {
      this.context = result;
      done();
    }, done);
  }

  getModel(model) {
    console.log(this)
    let Model = this.mongoose.model(model);
    return Model.where({ _tenant: this.context._id })
  }

  createModel(model, data, options) {
    let Model = this.mongoose.model(model);
    let tenantRef = this.context._id;
    let modelInfo = merge({}, { _tenant: tenantRef }, data);
    return new Model(modelInfo, options);
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