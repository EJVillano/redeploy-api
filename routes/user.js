//[Dependencies and Modules]
const express = require("express");

//[Routing Component]
const router = express.Router();
const userController = require("../controllers/user.js");
const { verify, verifyAdmin } = require("../auth.js");



//[Routes]
router.post("/", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/details", verify, userController.getProfile);

router.patch("/:userId/set-as-admin", verify, verifyAdmin, userController.setAsAdmin);

router.patch("/update-password", verify, userController.updatePassword);



//[Export Route System]

module.exports = router;