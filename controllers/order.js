//[Dependencies and Modules]
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const auth = require("../auth");



module.exports.createOrder = (req, res) => {

    const userId = req.user.id;

  // Find the cart associated with the user ID
  Cart.findOne({ userId })
    .then(cart => {
      if (!cart || cart.cartItems.length === 0) {
        return res.status(400).send({ error: 'Cart is empty' });
      }

      // Calculate total price of the order based on cart items
      const totalPrice = cart.totalPrice;

      // Create productsOrdered array from cart items
      const productsOrdered = cart.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.subtotal
      }));

      // Create a new order object
      const newOrder = new Order({
        userId,
        productsOrdered,
        totalPrice
      });

      // Save the new order to the database
      newOrder.save()
        .then(savedOrder => {
          // Delete the user's cart after the order is successfully created
          Cart.deleteOne({ userId })
            .then(() => {
              res.status(201).send(savedOrder);
            })
            .catch(error => {
              res.status(500).send({ error: error.message });
            });
        })
        .catch(error => {
          res.status(500).send({ error: error.message });
        });
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
};

module.exports.myOrder = (req, res) => {

    const userId = req.user.id;

    // Find orders for the user
    Order.find({ userId })
      .then(orders => {
        res.json({orders});
      })
      .catch(error => {
        res.status(500).json({ error: error.message });
    });

}

module.exports.allOrder = (req, res) => {

    Order.find()
    .then(orders => {
      res.json({orders});
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });

}