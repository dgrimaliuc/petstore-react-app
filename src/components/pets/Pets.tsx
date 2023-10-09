import { useState, useCallback, useEffect, useContext } from 'react';
import randomName from './pets.name';
import { Button } from '../UI';
import PetsContext from './store/PetsContext';
import { PlusIcon, UploadIcon } from '@heroicons/react/solid';
import SinglePet from './SinglePet';
import { getQuery } from '../utils/query';

export default function Pets() {
  const {
    pets,
    addPet,
    fetchPets,
    selectedRows,
    requestAdoption,
    deselectAll,
  } = useContext(PetsContext);
  // Uncomment for bug
  // const adoptions = useAdoptionsStore((s) => s.adoptions);
  // const pets = usePetStore((s) => s.pets);
  const location = getQuery('location');
  const [name, setName] = useState(randomName());

  useEffect(() => {
    fetchPets({ location, status: '!adopted' });
  }, [fetchPets, location]);

  let rows = Object.values(pets).reverse() || [];

  const onAdd = useCallback(() => {
    addPet({ name, location });
    setName(randomName());
  }, [addPet, name, location]);

  return (
    <div className='flex flex-col'>
      <div className='-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
        <div className='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
          <div className='overflow-hidden border-b sm:rounded-lg'>
            <div className='flex justify-between mt-1'>
              <div className='flex justify-end ml-4 items-center'>
                <input
                  className='px-5 py-1 border rounded-md'
                  value={name}
                  onChange={(e: any) => {
                    setName(e.target.value);
                  }}
                  type='text'
                />
                <Button onClick={onAdd} className='ml-2 flex items-center'>
                  {' '}
                  <PlusIcon className='h-6 mr-2' /> Add Rescue
                </Button>
              </div>
              <div className=''>
                <Button
                  onClick={requestAdoption}
                  disabled={!selectedRows.size}
                  color='orange'
                  size='xs'
                  className='ml-2 flex items-center'
                >
                  {' '}
                  <UploadIcon className='h-6 mr-2' /> Adopt selected pets
                </Button>
              </div>
            </div>
            <div className='h-[400px] overflow-y-auto'>
              <table
                id='pets-table'
                className='mt-4 min-w-full divide-y divide-gray-200'
              >
                <thead className='sticky'>
                  <tr className='bg-white sticky top-0'>
                    <th
                      scope='col'
                      className='px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider'
                    >
                      Name
                    </th>
                    <th
                      scope='col'
                      className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Status
                    </th>
                    <th
                      scope='col'
                      className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right'
                    >
                      <Button
                        onClick={deselectAll}
                        color='blue'
                        className='ml-2 text-xs'
                        disabled={!selectedRows.size}
                      >
                        Deselect
                      </Button>
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200 max-h-[400px]'>
                  {rows.map((row) => (
                    <SinglePet pet={row} key={row.id} />
                  ))}
                  {rows.length ? null : (
                    <tr>
                      <td className='px-4 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          No rows. Try reset filters{' '}
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
