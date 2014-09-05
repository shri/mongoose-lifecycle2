/**
 * Mongoose plugin adding lifecyle events on the model class.
 *
 * Initialization is straightforward:
 *
 *     var lifecycleEventsPlugin = require('path/to/mongoose-lifecycle');
 *     var Book = new Schema({ ... });
 *     Book.plugin(lifecycleEventsPlugin);
 *
 * Now the model emits lifecycle events before and after persistence operations:
 *
 *  - beforeInsert
 *  - afterInsert
 *  - beforeUpdate
 *  - afterUpdate
 *  - beforeSave (called for both inserts and updates)
 *  - afterSave (called for both inserts and updates)
 *  - beforeRemove
 *  - afterRemove
 *
 * You can listen to these events directly on the model.
 *
 * var Book = require('path/to/models/book');
 * Book.on('beforeInsert', function(book) {
 *   // do stuff...
 * });
 */
module.exports = exports = function lifecycleEventsPlugin(schema) {
  schema.pre('save', function (next) {
    var model = this.model(this.constructor.modelName);
    var doc = this;
    model.emit('beforeSave', this);
    schema.emit('beforeSave', doc);
    if (this.isNew) {
      model.emit('beforeInsert', this);
      schema.emit('beforeInsert', doc);
    }
    else {
      model.emit('beforeUpdate', this);
      schema.emit('beforeUpdate', doc);
    }
    this._isNew_internal = this.isNew;
    next();
  });
  schema.post('save', function() {
    var model = this.model(this.constructor.modelName);
    var doc = this;
    model.emit('afterSave', this);
    schema.emit('afterSave', doc);
    if (this._isNew_internal) {
      model.emit('afterInsert', this);
      schema.emit('afterInsert', doc);
    }
    else {
      model.emit('afterUpdate', this);
      schema.emit('afterUpdate', doc);
    }
    this._isNew_internal = undefined;
  });
  schema.pre('remove', function (next) {
    var model = this.model(this.constructor.modelName);
    var doc = this;
    model.emit('beforeRemove', this);
    schema.emit('beforeRemove', doc);
    next();
  });
  schema.post('remove', function() {
    var model = this.model(this.constructor.modelName);
    var doc = this;
    model.emit('afterRemove', this);
    schema.emit('afterRemove', doc);
  });
};