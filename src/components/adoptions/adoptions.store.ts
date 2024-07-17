import { create } from 'zustand';
import { arrayToObject } from '../utils/utils';
import config from '../../config';

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
    this.url = `${config.hosts.db}/api/adoptions`;
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

  changeStatus = async ({
    status,
    id,
    location,
  }: {
    status: string;
    id: string;
    location: string;
  }) => {
    return fetch(`${this.url}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, location }),
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
  changeStatus({
    status,
    id,
    location,
  }: {
    id: string;
    status: string;
    location: string;
  }): void;
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
  changeStatus: async ({ id, status, location }) => {
    const adoption = await api.changeStatus({ status, id, location });
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
