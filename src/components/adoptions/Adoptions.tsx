import { useEffect } from 'react';
import useAdoptionsStore from './adoptions.store';

import { getQuery } from '../utils/query';
import Adoption from './Adoption';

export default function Adoptions() {
  const location = getQuery('location');
  const fetchAdoptions = useAdoptionsStore((s) => s.fetchAdoptions);
  const adoptions = useAdoptionsStore((s) => s.adoptions);

  useEffect(() => {
    fetchAdoptions({ location, status: '!approved&!denied&!rejected' });
  }, [fetchAdoptions, location]);

  const rows = Object.values(adoptions).reverse() || [];

  return (
    <div className='max-h-[600px] overflow-y-scroll'>
      {rows.map((a) => (
        <Adoption a={a} key={a.id} />
      ))}
    </div>
  );
}
