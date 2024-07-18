import { Button } from '../UI';
import { Pill } from '../UI';
import usePetStore from '../pets/pets.store';
import { getQuery } from '../utils/query';
import useAdoptionsStore from './adoptions.store';

export default function Adoption({ a }: any) {
  const pets = usePetStore.getState().pets;
  const location = getQuery('location');
  const changeStatus = useAdoptionsStore((s) => s.changeStatus);
  const changeStatusCallback = (a: {
    status: any;
    id: string;
    affectedPets: string[];
  }) => {
    changePetStatus(a);
    changeStatus({ id: a.id, status: a.status, location });
  };

  const changePetStatus = (a: {
    status: any;
    id: string;
    affectedPets: string[];
  }) => {
    let petsStatus: any = a.status === 'approved' ? 'adopted' : 'available';

    a.affectedPets.forEach((element) => {
      pets[element].status = petsStatus;
    });
  };

  return (
    <div
      key={a.id}
      className='mt-2 border-gray-400 border p-4 rounded-md'
      data-t='single-adoption'
    >
      <h2>
        Adoption:{' '}
        <span className='font-monospace text-gray-600'> #{a.id} </span>
      </h2>
      Status: <Pill color='orange'>{a.status}</Pill>
      <div className='py-3 space-y-1' data-t='pets-list'>
        {a.pets.map((id: string) => {
          const reason = a.reasons?.find((r: any) => r.petId === id);
          return (
            <div
              key={id}
              className='border-gray-400 text-gray-600 border rounded-md ml-1 p-1.5 font-bold'
              data-t='pet-name'
            >
              {(pets[id] || {}).name}
              {reason ? (
                <span className='text-xs ml-2 px-1 uppercase text-red-800'>
                  {' '}
                  {reason.message}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {a.reasons?.length ? (
        <div className='bg-red-50 border-red-600 border text-red-600 p-3 mt-4'>
          <div> Some of the pets could not be adopted </div>
        </div>
      ) : null}
      <div className='flex justify-end mt-2'>
        <Button
          onClick={() =>
            changeStatusCallback({
              id: a.id,
              status: 'approved',
              affectedPets: a.pets,
            })
          }
          disabled={a.status !== 'available'}
          color='green'
          testAttribute='approve-button'
        >
          {' '}
          Approve{' '}
        </Button>
        <Button
          onClick={() =>
            changeStatusCallback({
              id: a.id,
              status: 'denied',
              affectedPets: a.pets,
            })
          }
          disabled={a.status !== 'available'}
          className='ml-2'
          color='red'
          testAttribute='deny-button'
        >
          {' '}
          Deny{' '}
        </Button>
      </div>
    </div>
  );
}
