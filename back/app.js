//Connexion avec l'application Express
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Thing = require(`./models/thing`);

const app = express();

//Connexion avec la Database MOngoDB
mongoose
  .connect(
    `mongodb+srv://fatou_diallo:vQaEzc0D0PRMBPbR@piiquante.amehr64.mongodb.net/?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

//Mise en place des Headers (Origin, Requêtes et méthodes)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Orgin", "*");
  res.setHeader(
    `Access-Control-Allow-Headers`,
    `Origin, X-Requested-With, Content, Accept, Content-Type, Authorization`
  );
  res.setHeader(
    `Access-Control-Allow-Methods`,
    `GET, POST, PUT, DELETE, PATCH, OPTIONS`
  );
  next();
});

//Mise en place Réponse à la requête
app.use((req, res, next) => {
  res.json({ message: "Requête reçue !" });
  next();
});

//Créer une requête POST pour User
app.use(express.json());

app.post(`/api/auth/signup`, (req, res, next) => {
  delete req.body._id;
  const thing = new Thing({
    ...req.body,
  });
  thing
    .save()
    .then(() =>
      res.status(201).json({
        message: "Compte crée !",
      })
    )
    .catch((error) => res.status(400).json({ error }));
  next();
});

// Mettre en place une route Put pour modifier l'Id de la sauce
app.put(`./api/sauces/:id`, (req, res, next) => {
  Thing.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
    .catch((error) => res.status(400).json({ error }));
});

//Supprimer une sauce
app.delete(`./app/sauces/:id`, (req, res, next) => {
  Thing.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
    .catch((error) => res.status(400).json({ error }));
});

//Créer la Route Get pour l'Id d'une sauce
app.get(`/api/sauces/:id`, (req, res, next) => {
  Thing.findOne({
    _id: req.params.id,
  })
    .then((thing) => res.status(200).json(thing))
    .catch((error) => res.status(404).json({ error }));
  next();
});

//Créer  une Route Get pour les sauces
app.get(`/api/sauces`, (req, res, next) => {
  Thing.find()
    .then((things) => res.status(200).json(things))
    .catch((error) => res.status(400).json({ error }));
  next();
});

app.use(bodyParser.json());

module.exports = app;
