/*
 * Sun position for a place and moment, after the formulas in SunCalc (Vladimir Agafonkin,
 * BSD), which follow the NOAA / astronomy-answers approximations. Accurate to a fraction of a
 * degree, plenty for a shadow study.
 */

const rad = Math.PI / 180;
const dayMs = 86_400_000;
const J1970 = 2440588;
const J2000 = 2451545;
const obliquity = rad * 23.4397;

const toDays = (date: Date) => date.valueOf() / dayMs - 0.5 + J1970 - J2000;

function sunCoords(d: number) {
  const M = rad * (357.5291 + 0.98560028 * d);
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const L = M + C + rad * 102.9372 + Math.PI;
  return {
    dec: Math.asin(Math.sin(obliquity) * Math.sin(L)),
    ra: Math.atan2(Math.sin(L) * Math.cos(obliquity), Math.cos(L)),
  };
}

/** Sun azimuth (degrees clockwise from north) and altitude (degrees above the horizon). */
export function sunPosition(date: Date, lat: number, lng: number) {
  const lw = rad * -lng;
  const phi = rad * lat;
  const d = toDays(date);
  const { dec, ra } = sunCoords(d);
  const H = rad * (280.16 + 360.9856235 * d) - lw - ra;
  const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
  const alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  return { azimuth: (az / rad + 180 + 360) % 360, altitude: alt / rad };
}

/** A local clock time (minutes after midnight, at a fixed UTC offset in hours) on a day. */
export function atMinutes(day: Date, minutes: number, utcOffset: number) {
  const base = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate());
  return new Date(base + (minutes - utcOffset * 60) * 60_000);
}

/** Sunrise and sunset as local minutes after midnight (refraction-corrected horizon). */
export function sunTimes(day: Date, lat: number, lng: number, utcOffset: number) {
  const up = (m: number) => sunPosition(atMinutes(day, m, utcOffset), lat, lng).altitude > -0.833;
  let rise = 0;
  let set = 1439;
  for (let m = 0; m < 1440; m++) if (up(m)) { rise = m; break; }
  for (let m = 1439; m >= 0; m--) if (up(m)) { set = m; break; }
  return { rise, set };
}

export const clock = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
