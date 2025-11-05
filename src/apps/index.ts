// EVO Microservice Apps Index
export const appConfig = {
  name: 'EVO Microservice API',
  version: '1.0.0',
  apiPrefix: 'api/v1',
};

export const getServerUrl = (port: number): string => {
  return `http://localhost:${String(port)}/${appConfig.apiPrefix}`;
};

// eslint-disable-next-line no-console
console.log('Apps module loaded successfully!');
