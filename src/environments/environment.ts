export const environment = {
  authUrl: (window as any).__env?.AUTH_URL || 'http://localhost:8080',
  devUrl: (window as any).__env?.DEV_URL || 'http://localhost:8085',
  appName: 'Inventory',
  appKey: 'EZH_INV_001',
};
