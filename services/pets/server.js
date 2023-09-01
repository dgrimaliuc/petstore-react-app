// var http = require("http"); // Import Node.js core module
const {
  KafkaSink,
  FlatDB: { queryObjToMatchQuery },
} = require("../lib");

const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const uuid = require("uuid");
const morgan = require("morgan");
// Configs
const DATA_BASEPATH = process.env.DATA_BASEPATH || __dirname;
const CLIENT_ID = "pets";

const petsCache = new KafkaSink({
  undefined,
  basePath: DATA_BASEPATH,
  name: "pets-cache",
  topics: ["pets.added", "pets.statusChanged"],
  onLog: ({ log, topic, sink }) => {
    if (topic === "pets.added") {
      console.log(`Adding pet to disk: ${log.id} - ${log.name}`);
      sink.db.dbPut(log.id, { ...log, status: "pending" });
      return;
    }

    if (topic === "pets.statusChanged") {
      console.log(`Updating pet status to disk: ${log.id} - ${log.status}`);
      // Save to DB with new status
      sink.db.dbMerge(log.id, { status: log.status });
      return;
    }
  },
});

app.use(morgan("short"));
app.use(cors());
app.use(bodyParser.json());

const port = 9092;
// Define a route
app.get(`/api/${CLIENT_ID}`, (req, res) => {
  const { location, status } = req.query;

  if (!location && !status) {
    return res.json(petsCache.db.dbGetAll());
  }

  let query = queryObjToMatchQuery({ status, location });
  return res.json(petsCache.db.dbQuery(query));
});

app.post(`/api/${CLIENT_ID}`, (req, res) => {
  const pet = req.body;
  pet.id = pet.id || uuid.v4();
  // TODO: Some validation of the body

  petsCache.db.dbPut(pet.id, { ...pet, status: "available" });
  res.status(201).send(pet);
});

app.patch(`/api/${CLIENT_ID}/:id`, (req, res) => {
  const pet = petsCache.db.dbGet(req.params.id);
  const { status } = req.body;
  if (!pet)
    res.status(400).json({
      message: "Pet not found, cannot patch.",
    });
  // TODO: Some validation of the body
  const updatedPet = { ...pet, status };
  petsCache.db.dbMerge(updatedPet.id, { ...updatedPet });
  res.status(201).send(updatedPet);
});

app.delete(`/api/${CLIENT_ID}/:id`, (req, res) => {
  const pet = petsCache.db.dbGet(req.params.id);
  if (!pet) {
    res.status(400).json({
      message: "Pet not found, cannot delete.",
    });
  }
  petsCache.db.dbRemove(pet.id);
  res.status(200).send(pet);
});

app.delete(`/api/${CLIENT_ID}`, (req, res) => {
  petsCache.db.dbClear();
  res.status(200).json({
    message: "Database was cleared.",
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
