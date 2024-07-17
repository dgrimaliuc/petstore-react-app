import { CheckIcon } from '@heroicons/react/solid';
import { useContext } from 'react';
import PetsContext from './store/PetsContext';

export default function SinglePet({ pet }: any) {
  const { selectedRows, toggleRow } = useContext(PetsContext);
  return (
    <tr
      key={pet.id}
      onClick={() => toggleRow(pet.id)}
      className={`odd:bg-gray-50 cursor-pointer`}
    >
      <td className='px-4 py-4 whitespace-nowrap'>
        <div className='flex items-center'>
          <div className='ml-4'>
            <div className='text-sm font-medium text-gray-900'>{pet.name}</div>
          </div>
        </div>
      </td>
      <td className='px-4 py-4 whitespace-nowrap'>
        <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase'>
          {pet.status}
        </span>
      </td>
      <td className='px-4 py-4 whitespace-nowrap'>
        <div className='flex items-center justify-end'>
          <div className='flex-shrink-0 h-4 w-4 text-gray-600 relative'>
            {selectedRows.has(pet.id) && (
              <CheckIcon className='absolute h-5 text-white left-[-1px] top-[3px]' />
            )}
            <input
              className='appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-500 checked:border-blue-800 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2'
              type='checkbox'
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
