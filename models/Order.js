const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
	userId: {
	    type: Schema.Types.ObjectId,
	    ref: 'User',
	    required: true
	  },
	productsOrdered: [{
	    productId: {
	      type: Schema.Types.ObjectId,
	      ref: 'Product',
	      required: true
	    },
	quantity: {
	      type: Number,
	      required: true
	    },
	subtotal: {
	      type: Number,
	      required: true
	    }
	  }],
	totalPrice: {
	    type: Number,
	    required: true
	  },
	orderedOn: {
	    type: Date,
	    default: Date.now
	  },
	status: {
	    type: String,
	    default: 'pending'
	  }
	});

module.exports = mongoose.model('Order', orderSchema);