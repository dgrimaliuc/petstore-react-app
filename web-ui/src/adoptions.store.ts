import create from "zustand";
import { onMessage } from "./websocket";
import { arrayToObject } from "./utils";

interface AdoptionReason {
  petId: string;
  message: string;
}
interface Adoption {
  id: string;
  status: "requested" | "pending" | "available" | "denied" | "approved";
  pets: string[];
  reasons?: AdoptionReason[];
}

const baseAdoption: Adoption = {
  id: "",
  status: "requested",
  pets: [],
};

export class AdoptionsAPI {
  url: string = "";

  constructor() {
    this.url = "http://localhost:9093/api/adoptions"; // http://localhost:9092/api/pets https://petstore-kafka.swagger.io/api
  }

  getAdoptions = async ({
    location,
    status,
  }: {
    location: string;
    status: string;
  }) => {
    let queries = new URLSearchParams();
    if (location) queries.set("location", location);
    if (status) queries.set("status", status);

    return fetch(`${this.url}?${queries}`)
      .then((res) => res.json())
      .then((data) => {
        return data as Adoption[];
      });
  };

  changeStatus = async ({ status, id }: { status: string; id: string }) => {
    return fetch(`${this.url}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ status }),
    });
  };

  requestAdoption = ({
    pets,
    location,
  }: {
    pets: string[];
    location: string;
  }) => {
    return fetch(`${this.url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ pets, location }),
    });
  };
}

const api = new AdoptionsAPI();

const useStore = create<{
  adoptions: {
    [key: string]: Adoption;
  };
  requestAdoptions({
    pets,
    location,
  }: {
    pets: string[];
    location: string;
  }): void;
  fetchAdoptions({
    location,
    status,
  }: {
    location: string;
    status: string;
  }): void;
  changeStatus({ status, id }: { id: string; status: string }): void;
}>((set) => ({
  adoptions: {},
  fetchAdoptions: async ({ location, status }) => {
    try {
      const adoptions = await api.getAdoptions({ location, status });
      set(() => ({ adoptions: arrayToObject(adoptions, "id") }));
    } catch (e) {
      console.error(e);
      // TODO
    }
  },
  changeStatus: async ({ id, status }) => {
    try {
      const adoptions = await api.changeStatus({ status, id });
    } catch (e) {
      console.error(e);
      // TODO
    }
  },
  requestAdoptions: async ({ pets, location }) => {
    try {
      const response = await api.requestAdoption({ pets, location });
      const jsonData = await response.json();
      await api.changeStatus({ status: "available", id: jsonData.id });
    } catch (e) {
      console.error(e);
      // TODO
    }
  },
}));

// // WebSocket connection
// onMessage("adoptions.store", (json: any, websocket: WebSocket) => {
//   if (json.type === "kafka" && json.topic.startsWith("adoptions.")) {
//     useStore.setState((state) => {
//       const adoption: Adoption = json.log;
//       const oldAdoption = state.adoptions[adoption.id] || {};
//       const newAdoption = { ...baseAdoption, ...oldAdoption, ...adoption };

//       return {
//         adoptions: {
//           ...state.adoptions,
//           [adoption.id]: newAdoption,
//         },
//       };
//     });
//   }
// });

export default useStore;
