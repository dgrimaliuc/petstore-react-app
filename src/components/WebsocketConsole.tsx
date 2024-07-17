import { useState, useEffect } from 'react';

export default function WebsocketConsole({ location }: { location: string }) {
  const [readyState, setReadyState] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    setReadyState('Connecting removed');
  }, [location, setLogs, setReadyState]);

  return (
    <div className='mt-4 p-2'>
      <h2 className='text-2xl'>Console</h2>
      <span>{readyState}</span>
      <pre className='font-mono overflow-y-scroll h-[400px]'>
        {logs.map((log, i) => (
          <span key={i} className='mt-1 block'>
            {log}
          </span>
        ))}
      </pre>
    </div>
  );
}
