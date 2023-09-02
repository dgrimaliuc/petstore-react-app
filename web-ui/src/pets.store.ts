import create from "zustand";
import { arrayToObject } from "./utils";

export interface Pet {
  id: string;
  name: string;
  location?: string;
  status: "pending" | "available" | "onhold" | "adopted";
}

export class PetsAPI {
  public url: string;

  constructor() {
    this.url = "http://localhost:9092/api/pets";
  }

  getPets = async ({
    location,
    status,
  }: {
    location?: string;
    status?: string;
  }) => {
    let queries = new URLSearchParams();
    if (location) queries.set("location", location);
    if (status) queries.set("status", status);

    return fetch(`${this.url}?${queries}`)
      .then((res) => res.json())
      .then((data) => {
        return data as Pet[];
      });
  };

  addPet = async ({ name, location }: { name: string; location: string }) => {
    return fetch(`${this.url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ name, location, status: "available" }),
    })
      .then((res) => res.json())
      .then((data) => {
        return data as Pet;
      });
  };
}

const api = new PetsAPI();

const useStore = create<{
  petError?: string;
  pets: {
    [key: string]: Pet;
  };
  addPet(newPet: { name: string; location: string }): void;
  fetchPets({ location, status }: { location: string; status: string }): void;
}>((set) => ({
  pets: {},
  addPet: async ({ name, location }) => {
    try {
      const pet = await api.addPet({ name, location });
      set(() => ({
        petError: "",
        pets: { ...useStore.getState().pets, [pet.id]: pet },
      }));
    } catch (e) {
      set(() => ({ petError: e + "" }));
    }
  },
  fetchPets: async ({ location, status }) => {
    try {
      const pets = await api.getPets({ location, status });
      set(() => ({ petError: "", pets: arrayToObject(pets, "id") }));
    } catch (e) {
      set(() => ({ petError: e + "" }));
    }
  },
}));

// // WebSocket connection
// onMessage("pets.store", (json: any) => {
//   if (
//     json.type === "kafka" &&
//     json.topic.startsWith("pets.") &&
//     !api.url.includes("localhost")
//   ) {
//     const pet: Pet = json.log;
//     const id = pet.id;
//     useStore.setState((state) => {
//       const oldPet = state.pets[id];
//       return {
//         pets: {
//           ...state.pets,
//           [id]: { ...oldPet, ...pet },
//         },
//       };
//     });
//   }
// });

export default useStore;
