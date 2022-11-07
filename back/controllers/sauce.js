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

        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

//Liker/Disliker une sauce
exports.appreciateSauce = (req, res, next) => {
  const appreciation = req.body.like;
  const user = req.body.userId;
  // On vérifie que l'utilisateur connecté est bien celui qui est renseigné dans la requête
  if (req.auth.userId !== req.body.userId) {
    return res
      .status(401)
      .json({
        message: "Vous ne pouvez pas liker/disliker pour un autre compte.",
      });
  }

  // On cherche la sauce
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const isUserLikeExist = sauce.usersLiked.includes(user); // si le user a déjà liké
      const isUserDislikeExist = sauce.usersDisliked.includes(user); // si le user a déjà disliké

      // si la sauce est déjà liké par l'utilisateur
      if (appreciation == 1 && isUserLikeExist) {
        return res.status(400).json({ message: "Sauce déjà liké" });
      }
      if (appreciation == 1 && !isUserLikeExist) {
        if (isUserDislikeExist) {
          // si le user like et qu'il avait déjà dislike auparavant, on ajoute un like et on diminue un dislike
          // on ajoute le user dans le tableau de usersLiked et on l'enlève dans le tableau de usersDisliked
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1, likes: +1 },
              $pull: { usersDisliked: user },
              $push: { usersLiked: user },
            }
          )
            .then(() => res.status(200).json({ message: "Sauce appréciée" }))
            .catch((error) => {
              console.log(error);
              return res
                .status(404)
                .json({ message: "Erreur lors de la mise à jour de la sauce" });
            });
        } else {
          // si le user like et qu'il n'avait pas déjà dislike auparavant, on ajoute un like
          // et  on ajoute le user dans le tableau de usersLiked
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: +1 },
              $push: { usersLiked: user },
            }
          )
            .then(() => res.status(200).json({ message: "Sauce appréciée" }))
            .catch((error) => {
              console.log(error);
              res.status(401).json({ error });
            });
        }
      }

      // si la sauce est déjà disliké par l'utilisateur
      if (appreciation == -1 && isUserDislikeExist) {
        res.status(400).json({ message: "Sauce déjà dislikée" });
      }
      if (appreciation == -1 && !isUserDislikeExist) {
        // si le user dislike alors qu'il avait déjà like auparavant, on ajoute un dislike et on diminue un like
        // on ajoute le user dans le tableau de usersDisliked et on l'enlève dans le tableau de usersLiked
        if (isUserLikeExist) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersLiked: user },
              $inc: { likes: -1, dislikes: 1 },
              $push: { usersDisliked: user },
            }
          )
            .then(() =>
              res.status(200).json({ message: "Sauce non appréciée" })
            )
            .catch((error) =>
              res
                .status(404)
                .json({ message: "Erreur lors de la mise à jour de la sauce" })
            );
        } else {
          // si le user dislike et qu'il n'avait pas déjà like auparavant, on ajoute un dislike
          // et  on ajoute le user dans le tableau de usersDisliked
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: +1 },
              $push: { usersDisliked: user },
            }
          )
            .then(() =>
              res.status(200).json({ message: "Sauce non appréciée" })
            )
            .catch((error) =>
              res
                .status(404)
                .json({ message: "Erreur lors de la mise à jour de la sauce" })
            );
        }
      }

      if (appreciation == 0) {
        // si le user annule et qu'il avait déjà liké, on diminue un like
        // et on enlève le user dans le tableau de usersLiked
        if (isUserLikeExist) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: user },
            }
          )
            .then(() =>
              res.status(200).json({ message: "Appréciation like annulée" })
            )
            .catch((error) =>
              res
                .status(404)
                .json({ message: "Erreur lors de la mise à jour de la sauce" })
            );
        } else if (isUserDislikeExist) {
          // si le user annule et qu'il avait déjà disliké, on diminue un like
          // et on enlève le user dans le tableau de usersDilLiked
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: user },
            }
          )
            .then(() =>
              res.status(200).json({ message: "Appréciation dislike annulée" })
            )
            .catch((error) => res.status(401).json({ error }));
        } else {
          return res
            .status(400)
            .json({ message: "Sauce non encore appreciée" });
        }
      }
    })
    .catch((error) => {
      return res.status(404).json({ message: "Sauce non trouvée" });
    });
};
