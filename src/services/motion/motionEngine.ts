import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';

export type FaceOrientation = 'faceDown' | 'faceUp' | 'other';

export interface MotionSample {
  gravity: { x: number; y: number; z: number };
  rotationRateMagnitude: number;
  orientation: FaceOrientation;
  isStable: boolean;
  timestamp: number;
}

/**
 * Tuned from typical iOS CMDeviceMotion gravity conventions: lying flat with
 * the screen facing the table reads a normalized gravity.z close to +1;
 * screen facing up reads close to -1. VERIFY AND RECALIBRATE ON A REAL
 * DEVICE via Settings > About > Motion Diagnostics (dev builds only) before
 * shipping — do not trust this sign blindly.
 */
export const FLIP_THRESHOLDS = {
  faceDownZ: 0.82,
  faceUpZ: -0.82,
  lateralMax: 0.45,
  /** combined deg/s magnitude of rotationRate below which the device counts as "still" */
  stableRotationRateDegMax: 12,
};

const EARTH_GRAVITY_MPS2 = 9.80665;
const UPDATE_INTERVAL_MS = 60;

function classifyOrientation(g: { x: number; y: number; z: number }): FaceOrientation {
  const lateralOk = Math.abs(g.x) < FLIP_THRESHOLDS.lateralMax && Math.abs(g.y) < FLIP_THRESHOLDS.lateralMax;
  if (lateralOk && g.z >= FLIP_THRESHOLDS.faceDownZ) return 'faceDown';
  if (lateralOk && g.z <= FLIP_THRESHOLDS.faceUpZ) return 'faceUp';
  return 'other';
}

function rotationMagnitudeDeg(m: DeviceMotionMeasurement): number {
  const r = m.rotationRate;
  if (!r) return 0;
  return Math.sqrt(r.alpha ** 2 + r.beta ** 2 + r.gamma ** 2);
}

type Listener = (sample: MotionSample) => void;

class MotionEngine {
  private listeners = new Set<Listener>();
  private subscription: ReturnType<typeof DeviceMotion.addListener> | null = null;

  private ensureRunning() {
    if (this.subscription) return;
    DeviceMotion.setUpdateInterval(UPDATE_INTERVAL_MS);
    this.subscription = DeviceMotion.addListener((measurement) => {
      const raw = measurement.accelerationIncludingGravity;
      const gravity = raw
        ? { x: raw.x / EARTH_GRAVITY_MPS2, y: raw.y / EARTH_GRAVITY_MPS2, z: raw.z / EARTH_GRAVITY_MPS2 }
        : { x: 0, y: 0, z: -1 };
      const rotationRateMagnitude = rotationMagnitudeDeg(measurement);
      const sample: MotionSample = {
        gravity,
        rotationRateMagnitude,
        orientation: classifyOrientation(gravity),
        isStable: rotationRateMagnitude < FLIP_THRESHOLDS.stableRotationRateDegMax,
        timestamp: Date.now(),
      };
      this.listeners.forEach((l) => l(sample));
    });
  }

  private stopIfIdle() {
    if (this.listeners.size === 0 && this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    this.ensureRunning();
    return () => {
      this.listeners.delete(listener);
      this.stopIfIdle();
    };
  }
}

export const motionEngine = new MotionEngine();

export async function isDeviceMotionAvailable(): Promise<boolean> {
  try {
    return await DeviceMotion.isAvailableAsync();
  } catch {
    return false;
  }
}
