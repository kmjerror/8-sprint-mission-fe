const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 1, maxlength: 100 },
  description: { type: String, required: true, minlength: 1, maxlength: 2000 },
  price: { type: Number, required: true, min: 0},
  tags: { type: [String], default: [] },
  images: { type: [String], default: [] }
}, { timestamps: true });

ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Product', ProductSchema);