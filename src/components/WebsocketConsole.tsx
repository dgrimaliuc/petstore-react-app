import { useState, useEffect } from 'react';

export default function WebsocketConsole({ location }: { location: string }) {
  const [readyState, setReadyState] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    setReadyState('');
  }, [location, setLogs, setReadyState]);

  return (
    <div className='mt-4 p-2'>
      <h2 className='text-2xl' />
      <span>{readyState}</span>
      <pre className='font-mono overflow-y-scroll h-[400px]'></pre>
    </div>
  );
}
