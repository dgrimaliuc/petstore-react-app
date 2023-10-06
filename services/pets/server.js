// var http = require("http"); // Import Node.js core module
const {
  FlatDB: { queryObjToMatchQuery },
  FlatDB,
} = require("../lib");
const path = require("path");
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const uuid = require("uuid");
const morgan = require("morgan");
// Configs
const CLIENT_ID = "pets";

const petsCache = new FlatDB(path.resolve(__dirname, `../pets/pets-cache.db`));
module.exports.petsCache = petsCache;
app.use(morgan("short")); // Log
app.use(cors());
app.use(bodyParser.json());

const port = 9092;
// Define a route
app.get(`/api/${CLIENT_ID}`, (req, res) => {
  const { location, status } = req.query;

  if (!location && !status) {
    return res.json(petsCache.dbGetAll());
  }

  let query = queryObjToMatchQuery({ status, location });
  return res.json(petsCache.dbQuery(query));
});

app.post(`/api/${CLIENT_ID}`, (req, res) => {
  const pet = req.body;
  pet.id = pet.id || uuid.v4();
  // TODO: Some validation of the body

  petsCache.dbPut(pet.id, { ...pet, status: "available" });
  res.status(201).send(pet);
});

app.patch(`/api/${CLIENT_ID}/:id`, (req, res) => {
  const pet = petsCache.dbGet(req.params.id);
  const { status } = req.body;
  if (!pet) {
    console.error(`Cannot find pet ${req.params.id} to delete`);
    res.status(400).json({
      message: "Pet not found, cannot patch.",
    });
  }
  // TODO: Some validation of the body
  const updatedPet = { ...pet, status };
  petsCache.dbMerge(updatedPet.id, { ...updatedPet });
  res.status(201).send(updatedPet);
});

app.delete(`/api/${CLIENT_ID}/:id`, (req, res) => {
  const pet = petsCache.dbGet(req.params.id);
  if (!pet) {
    console.error(`Cannot find pet ${req.params.id} to delete`);
    res.status(400).json({
      message: "Pet not found, cannot delete.",
    });
  }
  petsCache.dbRemove(pet.id);
  res.status(200).send(pet);
});

app.delete(`/api/${CLIENT_ID}`, (req, res) => {
  petsCache.dbClear();
  res.status(200).json({
    message: "Database was cleared.",
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
