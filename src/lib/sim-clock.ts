// Shared simulation clock for the tracker views. At 1x it is real UTC time;
// at 10x or 60x simulated time runs faster from the moment the rate changed,
// so the 3D globe, the 2D ground track and the telemetry readouts all agree.
import { useSyncExternalStore } from "react";

export const TIME_RATES = [
  { rate: 1, label: "1x", hint: "Real time" },
  { rate: 10, label: "10x", hint: "Demonstration" },
  { rate: 60, label: "60x", hint: "Orbit preview" },
] as const;

let rate = 1;
let anchorReal = Date.now();
let anchorSim = anchorReal;
const listeners = new Set<() => void>();

export function simNowMs(): number {
  if (rate === 1) return Date.now();
  return anchorSim + (Date.now() - anchorReal) * rate;
}
export function simNow(): Date {
  return new Date(simNowMs());
}
export function getSimRate(): number {
  return rate;
}
export function setSimRate(next: number) {
  const nowSim = simNowMs();
  anchorReal = Date.now();
  // Returning to 1x snaps back to the true current time.
  anchorSim = next === 1 ? anchorReal : nowSim;
  rate = next;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function useSimRate(): number {
  return useSyncExternalStore(subscribe, getSimRate, () => 1);
}
