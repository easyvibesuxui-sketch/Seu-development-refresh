/*
 * Tiny handshake between the preloader and the hero map:
 * the preloader waits for the map's first render, then starts the cloud fly-in.
 */
export const MAP_READY_EVENT = "seu:map-ready";
export const INTRO_EVENT = "seu:intro";

type IntroWindow = Window & { __seuMapReady?: boolean; __seuIntro?: boolean };

export function markMapReady() {
  (window as IntroWindow).__seuMapReady = true;
  window.dispatchEvent(new Event(MAP_READY_EVENT));
}

export function mapIsReady() {
  return Boolean((window as IntroWindow).__seuMapReady);
}

export function startIntro() {
  (window as IntroWindow).__seuIntro = true;
  window.dispatchEvent(new Event(INTRO_EVENT));
}

export function introStarted() {
  return Boolean((window as IntroWindow).__seuIntro);
}
