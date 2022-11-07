//Connexion avec l'application Express
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const sauceRoutes = require(`./routes/sauce`);
const userRoutes = require("./routes/user");

//Connexion avec la Database MOngoDB
mongoose
  .connect(
    `mongodb+srv://fatou_diallo:vQaEzc0D0PRMBPbR@piiquante.amehr64.mongodb.net/?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();
app.use(cors());

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

app.use(bodyParser.json());

//Configurez le routage
app.use(`/api/sauces`, sauceRoutes);
app.use(`/api/auth`, userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
