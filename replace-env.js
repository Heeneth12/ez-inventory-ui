const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, 'src/environments/environment.ts');

const content = `export const environment = {
  production: true,
  authUrl: '${process.env.AUTH_URL || ''}',
  devUrl: '${process.env.DEV_URL || ''}',
  appName: 'Inventory',
  appKey: 'EZH_INV_001',
  googleClientId: '${process.env.GOOGLE_CLIENT_ID || ''}',
};
`;

fs.writeFileSync(envFile, content);
console.log('Environment variables injected successfully!');