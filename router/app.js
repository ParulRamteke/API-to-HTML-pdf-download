const router = require("express").Router();
const controller = require("../controller/app");

router.get("/getdata", controller.bestAgro);

module.exports = router;
