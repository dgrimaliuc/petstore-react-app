import { createContext, useState } from 'react';

import usePetStore, { Pet } from '../pets.store';
import useAdoptionsStore from '../../adoptions/adoptions.store';
import { getQuery } from '../../utils/query';

const PetsContext = createContext({
  usePetStore: () => {},
  fetchPets: ({ location, status }: any) => {},
  addPet: (newPet: { name: string; location: string }) => {},
  selectedRows: new Set<string>(),
  toggleRow: (str: string) => {},
  deselectAll: () => {},
  pets: { ['' as string]: {} as Pet },
  requestAdoption: () => {},
});

export default PetsContext;

function useSelected(): [Set<string>, (str: string) => void, () => void] {
  const [state, setState] = useState<Set<string>>(new Set());

  const _toggle = (str: string) =>
    setState((s) => {
      let newSet = new Set(s);
      if (newSet.has(str)) {
        newSet.delete(str);
      } else {
        newSet.add(str);
      }
      return newSet;
    });

  const _clear = () => setState(new Set());
  return [state, _toggle, _clear];
}

const PetsContextProvider = ({ children }: any) => {
  const [selectedRows, toggleRow, deselectAll] = useSelected();

  const _requestAdoption = useAdoptionsStore((s) => s.requestAdoptions);
  const pets = usePetStore.getState().pets;

  return (
    <PetsContext.Provider
      value={{
        usePetStore: usePetStore,
        fetchPets: usePetStore((s) => s.fetchPets),
        addPet: usePetStore((s) => s.addPet),
        selectedRows,
        toggleRow,
        deselectAll,
        pets: pets,
        requestAdoption: () => {
          Array.from(selectedRows).forEach((element) => {
            pets[element].status = 'onhold';
          });
          deselectAll();
          _requestAdoption({
            pets: Array.from(selectedRows),
            location: getQuery('location'),
          });
        },
      }}
    >
      {children}
    </PetsContext.Provider>
  );
};
export { PetsContextProvider };
