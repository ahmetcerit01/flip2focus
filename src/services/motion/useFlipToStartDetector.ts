import { useEffect, useRef } from 'react';

import { motionEngine } from './motionEngine';

const REQUIRED_STABLE_MS = 1000;

type CandidateState = 'idle' | 'candidate' | 'fired';

/**
 * Flip-to-start state machine:
 *   IDLE -> FACE_DOWN_CANDIDATE -> (stable ~1s) -> START_SESSION -> FIRED
 * FIRED holds until the phone is lifted back face-up, so a single flip can
 * only ever fire once. Only active while `enabled` is true (Home screen
 * focused, no active session, app ready).
 */
export function useFlipToStartDetector(onFlip: () => void, enabled: boolean) {
  const stateRef = useRef<CandidateState>('idle');
  const candidateSinceRef = useRef<number | null>(null);
  const onFlipRef = useRef(onFlip);
  useEffect(() => {
    onFlipRef.current = onFlip;
  });

  useEffect(() => {
    if (!enabled) {
      stateRef.current = 'idle';
      candidateSinceRef.current = null;
      return;
    }

    const unsubscribe = motionEngine.subscribe((sample) => {
      const state = stateRef.current;

      if (state === 'fired') {
        if (sample.orientation === 'faceUp') {
          stateRef.current = 'idle';
          candidateSinceRef.current = null;
        }
        return;
      }

      if (sample.orientation !== 'faceDown' || !sample.isStable) {
        stateRef.current = 'idle';
        candidateSinceRef.current = null;
        return;
      }

      if (state === 'idle') {
        stateRef.current = 'candidate';
        candidateSinceRef.current = sample.timestamp;
        return;
      }

      if (state === 'candidate' && candidateSinceRef.current != null) {
        if (sample.timestamp - candidateSinceRef.current >= REQUIRED_STABLE_MS) {
          stateRef.current = 'fired';
          onFlipRef.current();
        }
      }
    });

    return unsubscribe;
  }, [enabled]);
}
