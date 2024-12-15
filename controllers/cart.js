//[Dependencies and Modules]
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../auth");



module.exports.getCart = (req, res) =>{

    const userId = req.user.id;

    Cart.findOne({ userId })
    .then(cart => {
      if (!cart) {
        return res.status(200).send({ message: 'No Cart found' });
      }
      res.send({ cart });
    })
    .catch(error => {
      res.status(500).send({ message: "encountered error while finding the cart" });
    });

}


module.exports.addToCart = (req, res) =>{

      // Extract the user ID from the decoded token stored in req.user by the verify middleware
  const userId = req.user.id;
  const productId = req.body.productId;
  const quantity = req.body.quantity;

   // Check if the product exists
   Product.findById(productId)
   .then(product => {
     if (!product) {
       return res.status(404).send({ error: 'Product not found' });
     }

     // Find the cart associated with the user ID
     Cart.findOne({ userId })
       .then(cart => {
         if (!cart) {
           // If no cart found, create a new cart and add the product
           const newCart = new Cart({
             userId,
             cartItems: [{ productId, quantity, subtotal: product.price * quantity }],
             totalPrice: product.price * quantity
           });

           newCart.save()
             .then(savedCart => {
               res.status(201).send(savedCart);
             })
             .catch(error => {
               res.status(500).send({ error: error.message });
             });
         } else {
           // If cart exists, check if the product is already in the cart
           const existingCartItem = cart.cartItems.find(item => item.productId.toString() === productId);

           if (existingCartItem) {
             // If product exists in cart, update the quantity and subtotal
             existingCartItem.quantity += quantity;
             existingCartItem.subtotal = existingCartItem.quantity * product.price;
           } else {
             // If product does not exist in cart, add it
             cart.cartItems.push({ productId, quantity, subtotal: product.price * quantity });
           }

           // Recalculate total price
           cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

           cart.save()
             .then(updatedCart => {
               res.send({ updatedCart });
             })
             .catch(error => {
               res.status(500).send({ error: error.message });
             });
         }
       })
       .catch(error => {
         res.status(500).send({ error: error.message });
       });
   })
   .catch(error => {
     res.status(500).send({ error: error.message });
   });

}

module.exports.updateCart = (req, res) =>{

    const userId = req.user.id;
    const productId = req.body.productId;
    const quantity = req.body.quantity;
  
    // Check if the product exists
    Product.findById(productId)
      .then(product => {
        if (!product) {
          return res.status(404).send({ error: 'Product not found' });
        }
  
        // Find the cart associated with the user ID
        Cart.findOne({ userId })
          .then(cart => {
            if (!cart) {
              return res.status(404).send({ error: 'Cart not found' });
            }
  
            // Find the cart item with the given product ID
            const cartItem = cart.cartItems.find(item => item.productId.toString() === productId);
  
            if (!cartItem) {
              return res.status(404).send({ error: 'Product not found in the cart' });
            }
  
            // Update the quantity of the cart item
            cartItem.quantity = quantity;
            cartItem.subtotal = quantity * product.price;
  
            // Recalculate total price
            cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);
  
            cart.save()
              .then(updatedCart => {
                res.send({
                  message: 'Cart updated successfully',
                  updatedCart: updatedCart
                })
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
        res.status(500).send({ error: error.message });
      });

}


module.exports.removeFromCart = (req, res) => {

  // Controller function to remove an item from the cart

  const userId = req.user.id;
  const productId = req.params.productId; // Assuming productId is passed in the request body

  // Find the cart associated with the user ID
  Cart.findOne({ userId })
    .then(cart => {
      if (!cart) {
        return res.status(404).send({ error: 'Cart not found' });
      }

      // Find the index of the cart item with the given product ID
      const index = cart.cartItems.findIndex(item => item.productId.toString() === productId);

      if (index === -1) {
        return res.status(404).send({ error: 'Product not found in the cart' });
      }

      // Remove the item from the cartItems array
      cart.cartItems.splice(index, 1);

      // Recalculate total price
      cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

      cart.save()
        .then(updatedCart => {
          res.send({
            message: 'Item removed from cart successfully',
            updatedCart: updatedCart
          })
        })
        .catch(error => {
          res.status(500).send({ error: error.message });
        });
    })
    .catch(error => {
      res.status(500).send({ error: error.message });
    });

}

module.exports.clearCart = (req , res ) => {

  const userId = req.user.id;

  // Find the cart associated with the user ID
  Cart.findOne({ userId })
    .then(cart => {
      if (!cart) {
        return res.status(404).send({ error: 'Cart not found' });
      }

      // Check if there are items in the cart
      if (cart.cartItems.length === 0) {
        return res.status(400).send({ error: 'Cart is already empty' });
      }

      // Remove all items from the cartItems array
      cart.cartItems = [];

      // Set total price to 0
      cart.totalPrice = 0;

      cart.save()
        .then(updatedCart => {
          res.send({
            message: 'Cart cleared successfully',
            updatedCart: updatedCart
          })
        })
        .catch(error => {
          res.status(500).send({ error: error.message });
        });
    })
    .catch(error => {
      res.status(500).send({ error: error.message });
    })

}