//[Dependencies and Modules]
const express = require("express");

//[Routing Component]
const router = express.Router();
const userController = require("../controllers/user.js");




//[Routes]
router.post("/registerUser", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/details", verify, userController.getProfile);


//[Export Route System]

module.exports = router;