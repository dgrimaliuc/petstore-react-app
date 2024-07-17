import { useState } from 'react';
import { Button } from './UI';
import { setQuery } from './utils/query';

const newTab = () => {
  window.open(window.location.href, '_blank');
};

export default function Location({ locationParam }: { locationParam: string }) {
  const [locationInput, setLocationInput] = useState(locationParam);

  return (
    <div className='p-8 flex items-center' data-t='location-section'>
      <h2>Location</h2>
      <div className='flex'>
        <input
          id='location-input'
          className='ml-2 px-2.5 py-1 border rounded-md'
          value={locationInput}
          onChange={(e) => {
            setLocationInput(e.target.value);
          }}
          type='text'
        />
        <Button
          className='ml-2'
          color='blue'
          onClick={() => setQuery('location', locationInput)}
        >
          {' '}
          Change location
        </Button>
        <Button className='ml-2' color='blue' onClick={newTab}>
          {' '}
          Open in new Tab
        </Button>
      </div>
    </div>
  );
}
