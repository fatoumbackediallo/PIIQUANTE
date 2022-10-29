const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");

//Créer une requête POST pour User

router.post(`/api/auth/signup`, userCtrl.signup);
router.post(`/api/auth/login`, userCtrl.login);

module.exports = router;
