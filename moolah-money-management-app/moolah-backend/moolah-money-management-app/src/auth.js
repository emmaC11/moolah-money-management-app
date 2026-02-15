import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { app } from './firebase';

export const auth = getAuth(app);

// Optional: keep users signed in across tabs/sessions
setPersistence(auth, browserLocalPersistence);
