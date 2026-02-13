import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from './auth';

const provider = new GoogleAuthProvider();

export default function Login() {
  const [error, setError] = useState(null);

  const signInWithGooglePopup = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential?.accessToken; // if you need Google API access
      // const user = result.user;
      // Redirect or update UI here
    } catch (e) {
      // Handle specific errors
      if (e.code === 'auth/popup-blocked') {
        setError('Popup blocked by the browser. Try the “Sign in with Google (redirect)” button.');
      } else if (e.code === 'auth/popup-closed-by-user') {
        setError('Popup was closed before completing sign in.');
      } else {
        setError(e.message || 'Google sign-in failed.');
      }
    }
  };

  // Optional: redirect flow for environments that block popups (e.g. mobile Safari)
  const signInWithGoogleRedirect = async () => {
    setError(null);
    await signInWithRedirect(auth, provider);
  };

  // If you use redirect, handle the result after the redirect returns:
  // useEffect(() => {
  //   getRedirectResult(auth).then((result) => {
  //     if (!result) return;
  //     // handle success
  //   }).catch((e) => setError(e.message));
  // }, []);

  return (
    <div>
      {/* Your existing email/password form here */}
      <div style={{ marginTop: 16 }}>
        <button onClick={signInWithGooglePopup}>Sign in with Google</button>
        {/* Optional backup for popup‑blocked cases */}
        {/* <button onClick={signInWithGoogleRedirect}>Sign in with Google (redirect)</button> */}
      </div>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  );
}