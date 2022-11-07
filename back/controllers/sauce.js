const Sauce = require("../models/sauce");
const fs = require("fs");

//Créer  une Route Get pour récupérer les sauces
exports.findAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

//Créer une Route Get pour ajouter une sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  //   delete sauceObject._id;
  delete sauceObject.userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  console.log();

  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(400).json({ error }));
};

//Créer la Route Get pour trouver une sauce
exports.findOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

// Mettre en place une route Put pour modifier une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete sauceObject.userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

//Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        FileSystem.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

//Liker/Disliker une sauce
exports.appreciateSauce = (req, res, next) => {
  console.log("hello");
  const appreciation = req.body.like;
  const user = req.body.userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const isUserLikeExist = sauce.usersLiked.includes(user);
      const isUserDislikeExist = sauce.usersDisliked.includes(user);
      if (appreciation == 1 && !isUserLikeExist) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            ...sauce,
            likes: sauce.likes++,
            usersLiked: sauce.usersLiked.push(user),
            usersDisliked: isUserDislikeExist
              ? sauce.usersDisliked.filter((u) => u !== user)
              : sauce.usersDisliked,
            dislikes: isUserDislikeExist ? sauce.dislikes-- : sauce.dislikes,
          }
        )
          .then(() => res.status(200).json({ message: "Sauce appréciée" }))
          .catch((error) => {
            console.log(error);
            res.status(401).json({ error });
          });
      }
      if (appreciation == -1 && !isUserDislikeExist) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            ...sauce,
            dislikes: sauce.dislikes++,
            usersDisliked: sauce.usersDisliked.push(user),
            usersLiked: isUserLikeExist
              ? sauce.usersLiked.filter((u) => u !== user)
              : sauce.usersLiked,
            likes: isUserLikeExist ? sauce.likes-- : sauce.likes,
          }
        )
          .then(() => res.status(200).json({ message: "Sauce non appréciée" }))
          .catch((error) => res.status(401).json({ error }));
      }
      if (appreciation == 0) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            ...sauce,
            dislikes: isUserDislikeExist ? sauce.dislikes-- : sauce.dislikes,
            usersDisliked: isUserDislikeExist
              ? sauce.usersDisliked.filter((u) => u !== user)
              : sauce.usersDisliked,
            usersLiked: isUserLikeExist
              ? sauce.usersLiked.filter((u) => u !== user)
              : sauce.usersLiked,
            likes: isUserLikeExist ? sauce.likes-- : sauce.likes,
          }
        )
          .then(() => res.status(200).json({ message: "Appréciation annulée" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};
