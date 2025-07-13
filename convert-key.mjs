
// This is a helper script to correctly convert your Firebase service account key to Base64.
// How to use:
// 1. Make sure your service account key file is in the same directory and named 'serviceAccountKey.json'.
// 2. Run the script from your terminal: node convert-key.mjs
// 3. Copy the entire output string and paste it as the value for FIREBASE_SERVICE_ACCOUNT_BASE64 in your .env file.
// 4. You can safely delete this script after you're done.

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const keyFilePath = resolve(__dirname, 'serviceAccountKey.json');
  const keyFileContent = readFileSync(keyFilePath);
  const base64String = Buffer.from(keyFileContent).toString('base64');
  
  console.log('\n✅ Successfully generated your Base64 key. Copy the line below:\n');
  console.log(base64String);
  console.log('\nPaste this into your .env file as the value for FIREBASE_SERVICE_ACCOUNT_BASE64.\n');

} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('\n❌ Error: `serviceAccountKey.json` not found!');
    console.error("Please make sure your Firebase service account key file is in the project's root directory and is named exactly `serviceAccountKey.json`.\n");
  } else {
    console.error('\n❌ An unexpected error occurred:', error);
  }
}
