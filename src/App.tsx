import { useEffect } from 'react';
import { PetsContextProvider } from './components/pets/store/PetsContext';
import Pets from './components/pets/Pets';
import Adoptions from './components/adoptions/Adoptions';
import useAdoptionsStore from './components/adoptions/adoptions.store';
import Location from '../src/components/Location';
import { setQuery, getQuery } from './components/utils/query';
import usePetsStore from './components/pets/pets.store';
import InfoBoard from './components/InfoBoard';
import SectionWrapper from './components/SectionWrapper';

function App() {
  const location = getQuery('location');
  const adoptions = Object.values(useAdoptionsStore((s) => s.adoptions));

  useEffect(() => {
    if (!location) {
      // Reloads the page
      setQuery('location', 'Plett');
      return;
    }
  }, [location]);

  const pets = Object.values(usePetsStore((s) => s.pets));

  return (
    <div className='container mx-auto'>
      <Location locationParam={location} />
      <InfoBoard
        location={location}
        petsLength={pets.length}
        adoptionLength={adoptions.length}
      />

      <div className='flex'>
        <SectionWrapper
          testAttribute='pets-section'
          title={`Pets in ${location}`}
        >
          <PetsContextProvider>
            <Pets />
          </PetsContextProvider>
        </SectionWrapper>

        <SectionWrapper
          testAttribute='adoptions-section'
          title={`Adoptions in ${location}`}
        >
          <Adoptions />
        </SectionWrapper>
      </div>
    </div>
  );
}

export default App;
