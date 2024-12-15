//[Dependencies and Modules]
const express = require("express");

const router = express.Router();
const orderController = require("../controllers/order");
const {verify, verifyAdmin} = require("../auth");

router.post("/checkout", verify, orderController.createOrder);

router.get("/my-orders", verify, orderController.myOrder);

router.get("/all-orders", verify, verifyAdmin, orderController.allOrder);

module.exports = router;
