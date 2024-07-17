const config = {
  prod: {
    hosts: {
      db: 'https://pet-store.nodeapp.workers.dev',
    },
  },
  dev: {
    hosts: {
      db: 'http://localhost:4444',
    },
  },
};

export default config[
  window.location.href.includes('localhost') ? 'dev' : 'prod'
];
