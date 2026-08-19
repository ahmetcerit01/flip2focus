import { useEffect, useRef } from 'react';

import { motionEngine } from './motionEngine';

const PICKUP_DEBOUNCE_MS = 300;
const RESUME_STABLE_MS = 400;

/**
 * Foreground-only pickup detection for the Active Focus grace flow. Fires
 * `onPickup` once the phone leaves the stable face-down orientation for a
 * short debounce window (avoids false positives from a light desk bump),
 * and fires `onResume` once it settles back face-down. Session correctness
 * never depends on this firing — it is UX-only.
 */
export function usePickupDetector(onPickup: () => void, onResume: () => void, enabled: boolean) {
  const notFaceDownSinceRef = useRef<number | null>(null);
  const faceDownSinceRef = useRef<number | null>(null);
  const pickupFiredRef = useRef(false);
  const resumeFiredRef = useRef(true);
  const onPickupRef = useRef(onPickup);
  const onResumeRef = useRef(onResume);
  useEffect(() => {
    onPickupRef.current = onPickup;
    onResumeRef.current = onResume;
  });

  useEffect(() => {
    if (!enabled) {
      notFaceDownSinceRef.current = null;
      faceDownSinceRef.current = null;
      pickupFiredRef.current = false;
      resumeFiredRef.current = true;
      return;
    }

    const unsubscribe = motionEngine.subscribe((sample) => {
      if (sample.orientation === 'faceDown' && sample.isStable) {
        notFaceDownSinceRef.current = null;
        pickupFiredRef.current = false;
        if (faceDownSinceRef.current == null) faceDownSinceRef.current = sample.timestamp;
        if (!resumeFiredRef.current && sample.timestamp - faceDownSinceRef.current >= RESUME_STABLE_MS) {
          resumeFiredRef.current = true;
          onResumeRef.current();
        }
        return;
      }

      faceDownSinceRef.current = null;
      resumeFiredRef.current = false;
      if (notFaceDownSinceRef.current == null) {
        notFaceDownSinceRef.current = sample.timestamp;
        return;
      }
      if (!pickupFiredRef.current && sample.timestamp - notFaceDownSinceRef.current >= PICKUP_DEBOUNCE_MS) {
        pickupFiredRef.current = true;
        onPickupRef.current();
      }
    });

    return unsubscribe;
  }, [enabled]);
}
