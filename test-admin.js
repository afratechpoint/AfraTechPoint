const fs = require('fs');

try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const envVars = {};
  envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      envVars[key.trim()] = values.join('=').trim().replace(/^"|"$/g, '');
    }
  });

  const admin = require('firebase-admin');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: envVars.FIREBASE_PROJECT_ID,
      clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
      privateKey: envVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });

  admin.auth().listUsers(10)
    .then(res => {
      console.log('Success! Users found:', res.users.length);
      console.log('Firebase Auth is perfectly connected');
    })
    .catch(e => {
      console.error('Firebase Auth Error:', e);
    });
} catch(e) {
  console.error('File parsing error:', e);
}
