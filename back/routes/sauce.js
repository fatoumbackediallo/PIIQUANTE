const express = require("express");
const auth = require("../middleware/auth");
const sauceCtrl = require("../controllers/sauce");
const multer = require("../middleware/multer-config");

const router = express.Router();

//Créer  une Route Get pour récupérer les sauces
router.get(`/`, auth, sauceCtrl.findAllSauces);

//Créer une Route Get pour ajouter une sauce
router.post(`/`, auth, multer, sauceCtrl.createSauce);

//Créer la Route Get pour l'Id d'une sauce
router.get(`/:id`, auth, sauceCtrl.findOneSauce);

// Mettre en place une route Put pour modifier l'Id de la sauce
router.put(`/:id`, auth, multer, sauceCtrl.modifySauce);

//Supprimer une sauce
router.delete(`/:id`, auth, sauceCtrl.deleteSauce);

//Ajouter un like
router.post(`/:id/like`, auth, sauceCtrl.appreciateSauce);

module.exports = router;
