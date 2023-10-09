import { create } from 'zustand';

import { arrayToObject } from '../utils/utils';

export interface AdoptionReason {
  petId: string;
  message: string;
}
export interface Adoption {
  id: string;
  status: 'requested' | 'pending' | 'available' | 'denied' | 'approved';
  pets: string[];
  location?: string;
  reasons?: AdoptionReason[];
}

export class AdoptionsAPI {
  url: string = '';

  constructor() {
    this.url = 'http://localhost:9093/api/adoptions'; // http://localhost:9092/api/pets https://petstore-kafka.swagger.io/api
  }

  getAdoptions = async ({
    location,
    status,
  }: {
    location: string;
    status: string;
  }) => {
    let queries = new URLSearchParams();
    if (location) queries.set('location', location);
    if (status) queries.set('status', status);

    return fetch(`${this.url}?${queries}`)
      .then((res) => res.json())
      .then((data) => {
        return data as Adoption[];
      });
  };

  changeStatus = async ({ status, id }: { status: string; id: string }) => {
    return fetch(`${this.url}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then((data) => data as Adoption);
  };

  requestAdoption = ({
    pets,
    location,
  }: {
    pets: string[];
    location: string;
  }) => {
    return fetch(`${this.url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ pets, location, status: 'requested' }),
    })
      .then((res) => res.json())
      .then((data) => {
        return data as Adoption;
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
      set(() => ({ adoptions: arrayToObject(adoptions, 'id') }));
    } catch (e) {
      console.error(e);
      // TODO
    }
  },
  changeStatus: async ({ id, status }) => {
    const adoption = await api.changeStatus({ status, id });
    set(() => ({
      adoptions: {
        ...useStore.getState().adoptions,
        [adoption.id]: adoption,
      },
    }));
  },
  requestAdoptions: async ({ pets, location }) => {
    try {
      const adoption = await api.requestAdoption({ pets, location });
      set(() => ({
        adoptions: {
          ...useStore.getState().adoptions,
          [adoption.id]: adoption,
        },
      }));
    } catch (e) {
      console.error(e);
    }
  },
}));

export default useStore;
