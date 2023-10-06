import { useEffect, useCallback } from 'react';
import useAdoptionsStore from '../adoptions.store';

import usePetsStore from '../pets.store';
import { Button } from '../UI';
import { Pill } from '../UI';
import { getQuery } from '../query';

export default function Adoptions() {
  const location = getQuery('location');
  const fetchAdoptions = useAdoptionsStore((s) => s.fetchAdoptions);
  const changeStatus = useAdoptionsStore((s) => s.changeStatus);
  const pets = usePetsStore((s) => s.pets);
  const adoptions = useAdoptionsStore((s) => s.adoptions);

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

  const changeStatusCallback = (a: {
    status: any;
    id: string;
    affectedPets: string[];
  }) => {
    changePetStatus(a);
    changeStatus({ id: a.id, status: a.status });
  };
  useEffect(() => {
    fetchAdoptions({ location, status: '!approved&!denied&!rejected' });
  }, [fetchAdoptions, location]);

  const rows = useCallback(() => {
    return Object.values(adoptions).reverse() || [];
  }, [adoptions]);

  function Adoption({ a }: any) {
    return (
      <div key={a.id} className='mt-2 border-gray-400 border p-4 rounded-md'>
        <h2>
          Adoption:{' '}
          <span className='font-monospace text-gray-600'> #{a.id} </span>
        </h2>
        Status: <Pill color='orange'>{a.status}</Pill>
        <div className='py-3 space-y-1'>
          {a.pets.map((id: string) => {
            const reason = a.reasons?.find((r: any) => r.petId === id);
            return (
              <div
                key={id}
                className='border-gray-400 text-gray-600 border rounded-md ml-1 p-1.5 font-bold'
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
            {a.reasons.length ? (
              <div> Some of the pets could not be adopted </div>
            ) : null}
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
          >
            {' '}
            Deny{' '}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='max-h-[600px] overflow-y-scroll'>
      {rows().map((a) => (
        <Adoption a={a} key={a.id} />
      ))}
    </div>
  );
}
