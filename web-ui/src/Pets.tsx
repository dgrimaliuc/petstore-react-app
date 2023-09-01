import { useState, useCallback, useEffect } from "react";
import usePetStore, { Pet } from "./pets.store";
import useAdoptionsStore from "./adoptions.store";
import randomName from "./pets.name";
import { Button } from "./UI";
import { PlusIcon, UploadIcon, CheckIcon } from "@heroicons/react/solid";
import { getQuery } from "./query";

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

export default function Pets() {
  const fetchPets = usePetStore((s) => s.fetchPets);
  const addPet = usePetStore((s) => s.addPet);
  const pets = usePetStore((s) => s.pets);
  const location = getQuery("location");
  const [selectedRows, toggleRow, deselectAll] = useSelected();

  useEffect(() => {
    fetchPets({ location, status: "!adopted" });
  }, [fetchPets, location]);

  const rows = useCallback(() => {
    return Object.values(pets).reverse() || [];
  }, [pets]);

  const _requestAdoption = useAdoptionsStore((s) => s.requestAdoptions);
  const requestAdoption = () => {
    deselectAll();
    _requestAdoption({ pets: Array.from(selectedRows), location });
  };

  const [name, setName] = useState(randomName());

  const onAdd = useCallback(() => {
    addPet({ name, location });
    setName(randomName());
  }, [addPet, name, location]);

  function PetRow({ pet }: any) {
    return (
      <tr
        key={pet.id}
        onClick={() => toggleRow(pet.id)}
        className={`odd:bg-gray-50 cursor-pointer`}
      >
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {pet.name}
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
            {pet.status}
          </span>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="flex items-center justify-end">
            <div className="flex-shrink-0 h-4 w-4 text-gray-600 relative">
              {selectedRows.has(pet.id) && (
                <CheckIcon className="absolute h-5 text-white left-[-1px] top-[3px]" />
              )}
              <input
                className="appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-500 checked:border-blue-800 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2"
                type="checkbox"
                onClick={(e) => e.stopPropagation()}
                readOnly
                checked={selectedRows.has(pet.id)}
              />
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden border-b sm:rounded-lg">
            <div className="flex justify-between mt-1">
              <div className="flex justify-end ml-4 items-center">
                <input
                  className="px-5 py-1 border rounded-md"
                  value={name}
                  onChange={(e: any) => {
                    setName(e.target.value);
                  }}
                  type="text"
                />
                <Button onClick={onAdd} className="ml-2 flex items-center">
                  {" "}
                  <PlusIcon className="h-6 mr-2" /> Add Rescue
                </Button>
              </div>
              <div className="">
                <Button
                  onClick={requestAdoption}
                  disabled={!selectedRows.size}
                  color="orange"
                  size="xs"
                  className="ml-2 flex items-center"
                >
                  {" "}
                  <UploadIcon className="h-6 mr-2" /> Adopt selected pets
                </Button>
              </div>
            </div>
            <div className="h-[400px] overflow-y-auto">
              <table
                id="pets-table"
                className="mt-4 min-w-full divide-y divide-gray-200"
              >
                <thead className="sticky">
                  <tr className="bg-white sticky top-0">
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right"
                    >
                      <Button
                        onClick={deselectAll}
                        color="blue"
                        className="ml-2 text-xs"
                        disabled={!selectedRows.size}
                      >
                        Deselect
                      </Button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 max-h-[400px]">
                  {rows().map((row) => (
                    <PetRow pet={row} key={row.id} />
                  ))}
                  {rows().length ? null : (
                    <tr>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          No rows. Try reset filters{" "}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
