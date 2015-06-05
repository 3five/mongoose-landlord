# Mongoose Landlord
Multi-tenancy for your Mongoose collections.

This plugin and Express middleware help you by maintaining relations for your
models, and automatically associating a request with a particular tenant.

## Disclaimer
**This is a very simple and very much "alpha" quality release, so
don't be rushing this to production.**

## Usage
This lib comes with two pieces.

`Landlord`, which is a schema plugin that wires up model references back to your 
`Tenant` model.

```
import { Schema, default as mongoose } from 'mongoose'
import { Landlord } from 'mongoose-landlord'

const TenantSchema = new Schema({
  address: String
})

const Tenant = mongoose.model('Tenant', TenantSchema)

// ... later ...

let landlord = new Landlord({
  tenant: 'Tenant',
  mongooseInstance: mongoose
  // index: true (you probably don't want to turn the index off for this)
})

const PersonSchema = new Schema({
  name: String,
  age: Number,
  alive: Boolean
}).plugin(landlord)

const Person = mongoose.model('Person', PersonSchema)
```

`LandlordMiddleware` which is and Express middleware that associates each incoming
request to a particular `Tenant`.

```
import mongoose from '../services/mongoose'
import { LandlordMiddleware } from 'mongoose-landlord'

router.use(
  LandlordMiddleware({
    tenant: 'Tenant',
    mongooseInstance: mongoose
  })
)

router.get('/api/people', function(req, res) {
  // res.locals.db.context === Tenant({ address: 'tenant-a.shopdev' })
  var People = res.locals.db.getModel('Person');
  People.find().then(function(result) {
    res.json(result)
  })
})

router.post('/api/people', function(req, res) {
  var person = res.locals.db.createModel('Person', req.body)
  person.save().then(function(result) {
    res.json(result)
  })
})
```

## Docs

More docs coming, read the source (lib/index.js) for more options. You can specify the Tenant name, properties and how the middleware segments different tenants.