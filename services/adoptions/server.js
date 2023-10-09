// var http = require("http"); // Import Node.js core module
import { FlatDB, queryObjToMatchQuery } from '../lib/index.js';
import express from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuid } from 'uuid';
import morgan from 'morgan';
import { petsCache } from '../pets/server.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configs
const app = express();
const CLIENT_ID = 'adoptions';

// Add some pets before we start
// Uncomment for bug and modify lione above
// const petsCache = new FlatDB(path.resolve(__dirname, `../pets/pets-cache.db`));
const adoptionsCache = new FlatDB(
  path.resolve(__dirname, `../adoptions/adoptions-adoptions-requested.db`)
);

// Trigger other events based on status change. And update the status
// requested -> rejected | available
// available -> denied | adopted
// adopted -> END
// rejected -> END
// denied -> END
async function processStatusChange(adoption, status) {
  // requested -> rejected | available
  if (status === 'requested') {
    // available
    // for each pets, hold them
    // update adoption status
    const reasons = adoption.pets
      .map((petId) => ({ id: petId, status: petsCache.dbGet(petId)?.status }))
      .filter(({ status }) => status !== 'available')
      .map(({ id, status }) => ({ petId: id, message: status }));
    // Rejected
    if (reasons.length) {
      adoption.status = 'rejected';
      adoption.reasons = reasons;
      adoptionsCache.dbMerge(adoption.id, {
        ...adoption,
        status: 'rejected',
        reasons: reasons,
      });
      // End - Rejected
      return;
    }

    // Available
    adoption.pets.map((adoptedPet) => {
      const pet = petsCache.dbGet(adoptedPet);
      petsCache.dbMerge(pet.id, { ...pet, status: 'onhold' }); // Remove for bug
    });

    adoption.status = 'available';
    adoptionsCache.dbMerge(adoption.id, {
      ...adoption,
    });
    // End - Available
    return;
  }

  // Adopted -> Claim all the Pets
  if (status === 'approved') {
    adoption.status = 'adopted';
    adoptionsCache.dbMerge(adoption.id, {
      ...adoption,
    });
    adoption.pets.map((adoptedPet) => {
      const pet = petsCache.dbGet(adoptedPet);
      petsCache.dbMerge(pet.id, { ...pet, status: 'adopted' }); // Remove for bug
    });

    return;
  }
  // Denied
  if (status === 'denied') {
    adoption.status = 'denied';
    adoptionsCache.dbMerge(adoption.id, {
      ...adoption,
      status: 'denied',
    });
    adoption.pets.map((adoptedPet) => {
      const pet = petsCache.dbGet(adoptedPet);
      petsCache.dbMerge(pet.id, { ...pet, status: 'available' });
    });
  }
}

// ---------------------------------------------------------------
// Rest
app.use(morgan('short'));
app.use(cors());
app.use(bodyParser.json());

const port = 9093;

app.get(`/api/${CLIENT_ID}`, (req, res) => {
  const { location, status } = req.query;

  if (!location && !status) {
    return res.json(adoptionsCache.dbGetAll());
  }

  let query = queryObjToMatchQuery({ status, location });
  return res.json(adoptionsCache.dbQuery(query));
});

app.post(`/api/${CLIENT_ID}`, (req, res) => {
  const adoption = req.body;
  adoption.id = adoption.id || uuid();

  // TODO: Some validation of the body
  processStatusChange(adoption, 'requested');
  adoptionsCache.dbPut(adoption.id, { ...adoption });
  res.status(201).send(adoption);
});

app.patch("/api/adoptions/:id", (req, res) => {
  const adoption = adoptionsCache.dbGet(req.params.id);
  const { status } = req.body;
  if (!adoption) {
    console.error(`Cannot find adoption ${req.params.id} to patch`);
    return res.status(400).json({
      message: "Adoption not found, cannot patch.",
    });
  }
  processStatusChange(adoption, status);
  const updatedAdoption = { ...adoption, status };
  adoptionsCache.dbMerge(updatedAdoption.id, { ...updatedAdoption });
  return res.status(200).send(updatedAdoption);
});

app.delete(`/api/${CLIENT_ID}`, (req, res) => {
  adoptionsCache.dbClear();
  res.status(200).json({
    message: "Database was cleared.",
  });
});

// // SPA
// app.use(express.static(path.resolve(__dirname, process.env.SPA_PATH || '../web-ui/build')))

// ---------------------------------------------------------------------------------------
// Boring stuff follows...
// ---------------------------------------------------------------------------------------

// Start server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
