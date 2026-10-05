/*
 * Typical floor (Kling / Gemini 3 Pro drawing in the site palette): four flats on the north
 * facade facing Hualing, three on the south facing the Tbilisi Sea, a corridor and core
 * between. Outlines per slot measured on public/images/floor-plan.jpg, in percent.
 */
export const PLAN = "/images/floor-plan.jpg";
export const PLAN_RATIO = 2400 / 1200;
export const UNIT_SHAPES: number[][][] = [
  [[2.3, 5], [13.9, 5], [13.9, 44.5], [2.3, 44.5]],
  [[14.4, 5], [31.8, 5], [31.8, 44.5], [14.4, 44.5]],
  [[32.4, 5], [60.7, 5], [60.7, 44.5], [32.4, 44.5]],
  [[61.2, 5], [95.7, 5], [95.7, 49.6], [61.2, 49.6]],
  [[2.3, 55.5], [27.6, 55.5], [27.6, 92], [2.3, 92]],
  [[28, 55.5], [44.5, 55.5], [44.5, 92], [28, 92]],
  [[61.2, 50.4], [95.7, 50.4], [95.7, 92], [61.2, 92]],
];
export const centre = (pts: number[][]) => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];

