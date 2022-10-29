const express = require("express");
const auth = require("../middleware/auth");
const sauceCtrl = require("../controllers/sauce");
const multer = require("../middleware/multer-config");

const router = express.Router();

//Créer  une Route Get pour récupérer les sauces
router.get(`/api/sauces`, auth, sauceCtrl.findAllSauces);

//Créer une Route Get pour ajouter une sauce
router.post(`/api/sauces`, auth, multer, sauceCtrl.createSauce);

//Créer la Route Get pour l'Id d'une sauce
router.get(`/:id`, auth, sauceCtrl.findOneSauce);

// Mettre en place une route Put pour modifier l'Id de la sauce
router.put(`/:id`, auth, multer, sauceCtrl.modifySauce);

//Supprimer une sauce
router.delete(`/:id`, auth, sauceCtrl.deleteSauce);

module.exports = router;
