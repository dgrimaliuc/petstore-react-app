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
const CLIENT_ID = "adoptions";

// Consume kafka
const petCache = new KafkaSink({
  undefined,
  basePath: DATA_BASEPATH,
  name: "adoptions-pet-status-cache",
  topics: ["pets.statusChanged"],
  onLog: ({ log, sink }) => {
    if (!log.status) {
      return;
    }
    console.log(`Cacheing pet status to disk: ${log.id} - ${log.status}`);
    sink.db.dbPut(log.id, { status: log.status });
  },
});

const adoptionsCache = new KafkaSink({
  undefined,
  basePath: DATA_BASEPATH,
  name: "adoptions-adoptions-requested",
  topics: ["adoptions.requested", "adoptions.statusChanged"],
  onLog: async ({ log, sink, topic }) => {
    if (topic === "adoptions.requested") {
      // Save to DB
      console.log(
        `Adding adoption - ${log.id} - pets = ${JSON.stringify(log.pets)}`
      );
      sink.db.dbPut(log.id, { ...log, status: "pending" });
    }

    if (topic === "adoptions.statusChanged") {
      const adoption = sink.db.dbGet(log.id);
      if (!adoption) {
        console.error(`Did not find Adoption with id ${log.id}`);
        return;
      }

      console.log(`Saving status - ${log.id} - ${log.status}`);
      sink.db.dbMerge(log.id, { status: log.status });
      return;
    }
  },
});

// Trigger other events based on status change. And update the status
// requested -> rejected | available
// available -> denied | adopted
// adopted -> END
// rejected -> END
// denied -> END
async function processStatusChange(adoption, status) {
  // requested -> rejected | available
  if (status === "requested") {
    // available
    // for each pets, hold them
    // update adoption status

    // Hold all pets
    const reasons = adoption.pets
      .map((petId) => ({ id: petId, status: petCache.get(petId).status }))
      .filter(({ status }) => status !== "available")
      .map(({ id, status }) => ({ petId: id, message: `${status}` }));

    // Denied
    if (reasons.length) {
      adoptionsCache.db.dbMerge(adoption.id, { reasons });
      await producer.send({
        topic: "adoptions.statusChanged",
        messages: [
          {
            value: JSON.stringify({
              id: adoption.id,
              status: "rejected",
              reasons,
            }),
          },
        ],
      });
      // End - Rejected
      return;
    }

    // Available
    const petMessages = adoption.pets.map((petId) => ({
      value: JSON.stringify({ id: petId, status: "onhold" }),
    }));

    await producer.send({
      topic: "pets.statusChanged",
      messages: petMessages,
    });

    await producer.send({
      topic: "adoptions.statusChanged",
      messages: [
        { value: JSON.stringify({ id: adoption.id, status: "available" }) },
      ],
    });

    // End - Available
    return;
  }

  // Adopted -> Claim all the Pets
  if (status === "approved") {
    const claimPetMessages = adoption.pets.map((petId) => ({
      value: JSON.stringify({
        id: petId,
        status: "adopted",
      }),
    }));

    await producer.send({
      topic: "pets.statusChanged",
      messages: claimPetMessages,
    });

    return;
  }

  if (status === "denied") {
    const claimPetMessages = adoption.pets.map((petId) => ({
      value: JSON.stringify({
        id: petId,
        status: "available",
      }),
    }));

    await producer.send({
      topic: "pets.statusChanged",
      messages: claimPetMessages,
    });

    return;
  }
}

// ---------------------------------------------------------------
// Rest
app.use(morgan("short"));
app.use(cors());
app.use(bodyParser.json());

const port = 9093;

app.get(`/api/${CLIENT_ID}`, (req, res) => {
  const { location, status } = req.query;

  if (!location && !status) {
    return res.json(adoptionsCache.db.dbGetAll());
  }

  let query = queryObjToMatchQuery({ status, location });
  return res.json(adoptionsCache.db.dbQuery(query));
});

app.post(`/api/${CLIENT_ID}`, (req, res) => {
  const adoption = req.body;
  adoption.id = adoption.id || uuid.v4();

  // TODO: Some validation of the body

  adoptionsCache.db.dbPut(adoption.id, { ...adoption });
  res.status(201).send(adoption);
});

app.patch("/api/adoptions/:id", (req, res) => {
  const adoption = adoptionsCache.db.dbGet(req.params.id);
  const { status } = req.body;
  if (!adoption) {
    console.log("Cannot find adoption ${req.params.id} to patch");
    return res.status(400).json({
      message: "Adoption not found, cannot patch.",
    });
  }

  const updatedAdoption = { ...adoption, status };
  console.log(`Patching ${JSON.stringify(updatedAdoption)}`);

  adoptionsCache.db.dbMerge(updatedAdoption.id, { ...updatedAdoption });
  return res.status(200).send(updatedAdoption);
});

// // SPA
// app.use(express.static(path.resolve(__dirname, process.env.SPA_PATH || '../web-ui/build')))

// ---------------------------------------------------------------------------------------
// Boring stuff follows...
// ---------------------------------------------------------------------------------------

// Start server
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
