import { useEffect, useRef, useCallback } from 'react';
import { enableNetwork } from 'firebase/firestore';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { db, auth, listenToDevicePairing, inspectLocalStorage, inspectIndexedDB } from '../../lib/firebase';
import { decryptData } from '../../lib/crypto';
import { fetchPairingStatusRest, fetchPairingStatusSDK, deletePairingDoc } from '../services/pairingService';

interface UseAndroidPairingProps {
  pairingCode: string;
  step: 'welcome' | 'username' | 'pairing';
  onPairComplete: (uid: string, userState: any, localAuthSuccess: boolean) => void;
  onError: (err: any) => void;
}

export function useAndroidPairing({
  pairingCode,
  step,
  onPairComplete,
  onError,
}: UseAndroidPairingProps) {
  const onPairCompleteRef = useRef(onPairComplete);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onPairCompleteRef.current = onPairComplete;
    onErrorRef.current = onError;
  }, [onPairComplete, onError]);

  const handleResumeOrFocus = useCallback(async () => {
    if (step !== 'pairing' || !pairingCode) {
      console.log(`[TRACER] [Focus/Resume] handleResumeOrFocus skipped because step is "${step}" and pairingCode is "${pairingCode}"`);
      return;
    }

    console.log(`[TRACER] [Focus/Resume] App focus/resume/check triggered. Verifying device pairing status for code: "${pairingCode}"...`);
    try {
      // Enable Firestore network first to recover from background sleep
      try {
        await enableNetwork(db);
        console.log("[TRACER] [Focus/Resume] Firestore network enabled successfully.");
      } catch (e) {
        console.warn("[TRACER] [Focus/Resume] enableNetwork failed:", e);
      }

      let data = await fetchPairingStatusRest(pairingCode);

      // Fallback to standard Firestore SDK getDoc if REST fetch failed/returned empty
      if (!data) {
        console.log("[TRACER] [Focus/Resume] REST fetch empty. Falling back to standard Firestore SDK getDoc...");
        data = await fetchPairingStatusSDK(pairingCode);
      }

      if (data && data.status === "paired" && data.uid) {
        console.log("[TRACER] [Focus/Resume] Pairing document is PAIRED. Processing authentication...");

        const pairingKey = localStorage.getItem('pairing_key');
        let localAuthSuccess = false;

        if (data.encryptedIdToken && pairingKey) {
          try {
            console.log("[TRACER] [Focus/Resume] Decrypting tokens...");
            const idToken = decryptData(data.encryptedIdToken, pairingKey);
            const accessToken = data.encryptedAccessToken ? decryptData(data.encryptedAccessToken, pairingKey) : null;

            if (idToken) {
              console.log("[TRACER] [Focus/Resume] Calling signInWithCredential...");
              const credential = GoogleAuthProvider.credential(idToken, accessToken || undefined);
              const result = await signInWithCredential(auth, credential);
              console.log("[TRACER] [Focus/Resume] signInWithCredential resolved successfully! UID:", result.user.uid);
              localAuthSuccess = true;
            }
          } catch (authErr) {
            console.error("[TRACER] [Focus/Resume] Local Firebase auth failed:", authErr);
          }
        } else {
          console.warn("[TRACER] [Focus/Resume] Missing tokens or pairing key in localStorage. Key exists:", !!pairingKey);
        }

        // Clean up pairing key and states
        localStorage.removeItem('pairing_key');
        localStorage.removeItem('pairing_code');
        localStorage.removeItem('pairing_step_active');

        // Delete the pairing document immediately for security
        await deletePairingDoc(pairingCode);

        console.log("[TRACER] [Focus/Resume] Completing auth in parent component...");
        onPairCompleteRef.current(data.uid, data.userState || null, localAuthSuccess);
      } else {
        if (data) {
          console.log(`[TRACER] [Focus/Resume] Pairing document is still pending pairing (status: "${data?.status || 'unknown'}", uid: "${data?.uid || 'none'}").`);
        } else {
          console.log(`[TRACER] [Focus/Resume] Pairing document does not exist/could not be loaded for code: "${pairingCode}"`);
        }
      }
    } catch (err) {
      console.error("[TRACER] [Focus/Resume] Exception in focus/resume pairing check:", err);
    }
  }, [step, pairingCode]);

  // Set up Firestore onSnapshot subscription
  useEffect(() => {
    if (step !== 'pairing' || !pairingCode) return;

    console.log(`[TRACER] [useEffect] Setting up device pairing listener for code: "${pairingCode}"`);

    const unsubscribe = listenToDevicePairing(
      pairingCode,
      async (uid, userState, encryptedIdToken, encryptedAccessToken) => {
        console.log("[TRACER] [onPair Callback] Fired with arguments:", {
          uid,
          hasUserState: !!userState,
          hasEncryptedIdToken: !!encryptedIdToken,
          hasEncryptedAccessToken: !!encryptedAccessToken
        });
        
        const pairingKey = localStorage.getItem('pairing_key');
        console.log("[TRACER] [onPair Callback] Local storage check: pairing_key exists =", !!pairingKey);

        let localAuthSuccess = false;

        if (encryptedIdToken && pairingKey) {
          try {
            console.log("[TRACER] [Decrypt] Attempting to decrypt ID token and Access token using pairing key...");
            const idToken = decryptData(encryptedIdToken, pairingKey);
            const accessToken = encryptedAccessToken ? decryptData(encryptedAccessToken, pairingKey) : null;
            
            console.log("[TRACER] [Decrypt] Result:", {
              idTokenDecrypted: !!idToken,
              accessTokenDecrypted: !!accessToken
            });

            if (idToken) {
              console.log("[TRACER] [Credential] Calling GoogleAuthProvider.credential()...");
              const credential = GoogleAuthProvider.credential(idToken, accessToken || undefined);
              console.log("[TRACER] [Credential] GoogleAuthProvider.credential() returned successfully:", !!credential);
              
              console.log("[TRACER] [SignIn] Entering signInWithCredential()...");

              // Setup a timeout to detect if signInWithCredential is hanging
              let resolved = false;
              const hangTimer = setTimeout(() => {
                if (!resolved) {
                  console.warn("[TRACER] [SignIn] signInWithCredential is currently hanging! It has not resolved or rejected after 8 seconds.");
                }
              }, 8000);

              try {
                console.log("[TRACER] [SignIn] BEFORE await signInWithCredential call.");
                const result = await signInWithCredential(auth, credential);
                resolved = true;
                clearTimeout(hangTimer);
                
                console.log("[TRACER] [SignIn] signInWithCredential resolved successfully!", {
                  uid: result.user.uid,
                  email: result.user.email,
                  displayName: result.user.displayName
                });
                console.log("[TRACER] [SignIn] auth.currentUser.uid after success:", auth.currentUser?.uid);
                localAuthSuccess = true;

                // Wait 1 second and inspect firebaseLocalStorageDb to verify if firebase:authUser exists
                setTimeout(() => {
                  console.log("[TRACER] [Inspect 1s After Login] Running persistence diagnostics...");
                  inspectLocalStorage();
                  inspectIndexedDB();
                }, 1000);
              } catch (authErr: any) {
                resolved = true;
                clearTimeout(hangTimer);
                console.error("[TRACER] [SignIn] signInWithCredential failed with error! DETAILS:", {
                  code: authErr?.code,
                  message: authErr?.message,
                  stack: authErr?.stack,
                  rawError: authErr
                });
                throw authErr; // rethrow to hit the outer catch block
              }
            } else {
              console.error("[TRACER] [Decrypt] Decrypted ID token is empty or null!");
            }
          } catch (authErr: any) {
            console.error("[TRACER] [Exception] Local Firebase authentication flow failed inside WebView:", {
              code: authErr?.code,
              message: authErr?.message,
              stack: authErr?.stack,
              rawError: authErr
            });
          }
        } else {
          console.warn("[TRACER] [Warning] Missing encrypted tokens or pairing key in WebView. Local Firebase Auth cannot be established.", {
            hasToken: !!encryptedIdToken,
            hasKey: !!pairingKey
          });
        }

        // Clean up pairing key
        console.log("[TRACER] [Cleanup] Removing pairing keys and state from localStorage");
        localStorage.removeItem('pairing_key');
        localStorage.removeItem('pairing_code');
        localStorage.removeItem('pairing_step_active');

        // Delete the pairing document immediately for security
        await deletePairingDoc(pairingCode);

        console.log("[TRACER] [onAuthComplete] Invoking onPairComplete with:", {
          uid,
          email: userState?.email,
          displayName: userState?.displayName,
          username: userState?.username,
          localAuthSuccess
        });

        onPairCompleteRef.current(uid, userState || null, localAuthSuccess);
      },
      (err) => {
        console.error("[TRACER] [Error] Device pairing subscription failed/ended with error:", {
          code: err?.code,
          message: err?.message,
          stack: err?.stack
        });
        onErrorRef.current(err);
      }
    );

    return () => {
      console.log(`[TRACER] [useEffect] Cleaning up device pairing listener for code: "${pairingCode}"`);
      unsubscribe();
    };
  }, [step, pairingCode]);

  // Listen for App Resume, window focus, or visibility changes to trigger immediate checks (ONE-OFF checks, no setInterval!)
  useEffect(() => {
    if (step !== 'pairing' || !pairingCode) return;

    let appListener: any = null;

    const onAppActive = async () => {
      await handleResumeOrFocus();
    };

    // 1. Capacitor native App resume listener
    const setupNativeListener = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        appListener = await CapApp.addListener('appStateChange', async (state) => {
          console.log(`[TRACER] [Focus/Resume] Capacitor App state changed. isActive=${state.isActive}`);
          if (state.isActive) {
            await onAppActive();
          }
        });
      } catch (err) {
        console.log("[TRACER] [Focus/Resume] Capacitor App plugin not available natively. Standard browser focus/visibility listeners will be used instead.");
      }
    };
    setupNativeListener();

    // 2. Browser standard focus & visibilitychange listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        onAppActive();
      }
    };

    const handleWindowFocus = () => {
      onAppActive();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    // Run an initial check immediately on mount/activation
    onAppActive();

    return () => {
      if (appListener) {
        appListener.remove();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [step, pairingCode, handleResumeOrFocus]);

  return { handleResumeOrFocus };
}
