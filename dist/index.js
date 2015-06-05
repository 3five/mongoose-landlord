module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	exports.Landlord = Landlord;
	exports.LandlordMiddleware = LandlordMiddleware;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _mongoose = __webpack_require__(1);

	var _mongoose2 = _interopRequireDefault(_mongoose);

	var _lodash = __webpack_require__(2);

	var landlordMiddlewareDefaults = {
	  segmentPath: 'address',
	  segmenter: function segmenter(req) {
	    return req.hostname;
	  }
	};

	function Landlord(opts) {
	  checkForErrors('Landlord Plugin', opts);

	  return function (schema) {
	    var options = arguments[1] === undefined ? {} : arguments[1];

	    schema.add({ '_tenant': {
	        type: opts.mongooseInstance.Schema.Types.ObjectId,
	        ref: opts.tenant,
	        required: true,
	        index: options.index === false ? false : true
	      } });
	  };
	}

	function LandlordMiddleware(opts) {
	  checkForErrors('Landlord Middleware', opts);

	  var o = (0, _lodash.merge)({}, landlordMiddlewareDefaults, opts);
	  var Tenant = o.mongooseInstance.model(o.tenant);

	  return function (req, res, next) {
	    var segment = o.segmenter(req);
	    res.locals.db = new DBContext({
	      segment: segment,
	      segmentPath: o.segmentPath,
	      mongoose: o.mongooseInstance,
	      tenant: Tenant
	    });
	    res.locals.db.getContext(function () {
	      next();
	    });
	  };
	}

	var DBContext = (function () {
	  function DBContext(opts) {
	    _classCallCheck(this, DBContext);

	    this.segment = opts.segment;
	    this.segmentPath = opts.segmentPath;
	    this.Tenant = opts.tenant;
	    this.mongoose = opts.mongoose;
	    this.context = null;
	  }

	  _createClass(DBContext, [{
	    key: 'getContext',
	    value: function getContext(done) {
	      var _this = this;

	      var query = {};
	      query[this.segmentPath] = this.segment;
	      this.Tenant.findOne(query).then(function (result) {
	        _this.context = result;
	        done();
	      }, done);
	    }
	  }, {
	    key: 'getModel',
	    value: function getModel(model) {
	      console.log(this);
	      var Model = this.mongoose.model(model);
	      return Model.where({ _tenant: this.context._id });
	    }
	  }, {
	    key: 'createModel',
	    value: function createModel(model, data, options) {
	      var Model = this.mongoose.model(model);
	      var tenantRef = this.context._id;
	      var modelInfo = (0, _lodash.merge)({}, { _tenant: tenantRef }, data);
	      return new Model(modelInfo, options);
	    }
	  }]);

	  return DBContext;
	})();

	function checkForErrors(name, opts) {
	  if (!opts) {
	    throw new Error('' + name + ': Must pass a configuration object');
	  }

	  if (!opts.tenant) {
	    throw new Error('' + name + ': Must specify a Tenant model');
	  }

	  if (!opts.mongooseInstance) {
	    throw new Error('' + name + ': Must pass in mongoose instance specific to your application');
	  }
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("mongoose");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("lodash");

/***/ }
/******/ ]);