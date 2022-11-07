const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");

//Créer une requête POST pour User

router.post(`/signup`, userCtrl.signup);
router.post(`/login`, userCtrl.login);

module.exports = router;
