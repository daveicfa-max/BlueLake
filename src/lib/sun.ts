const ZENITH_OFFICIAL = 90.833;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

function normalize360(value: number) {
  return ((value % 360) + 360) % 360;
}

function dayOfYear(date: Date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  return Math.floor((date.valueOf() - start) / 86400000) + 1;
}

function solarTime(
  date: Date,
  lat: number,
  lng: number,
  rising: boolean,
): Date | null {
  const N = dayOfYear(date);
  const lngHour = lng / 15;
  const t = N + ((rising ? 6 : 18) - lngHour) / 24;

  const M = 0.9856 * t - 3.289;
  let L =
    M +
    1.916 * Math.sin(toRad(M)) +
    0.02 * Math.sin(toRad(2 * M)) +
    282.634;
  L = normalize360(L);

  let RA = toDeg(Math.atan(0.91764 * Math.tan(toRad(L))));
  RA = normalize360(RA);

  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;
  RA = (RA + (Lquadrant - RAquadrant)) / 15;

  const sinDec = 0.39782 * Math.sin(toRad(L));
  const cosDec = Math.cos(Math.asin(sinDec));

  const cosH =
    (Math.cos(toRad(ZENITH_OFFICIAL)) - sinDec * Math.sin(toRad(lat))) /
    (cosDec * Math.cos(toRad(lat)));

  if (cosH > 1 || cosH < -1) return null;

  let H = rising ? 360 - toDeg(Math.acos(cosH)) : toDeg(Math.acos(cosH));
  H = H / 15;

  const T = H + RA - 0.06571 * t - 6.622;
  const UT = ((T - lngHour) % 24 + 24) % 24;

  const result = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  result.setUTCHours(0, 0, 0, 0);
  result.setUTCMilliseconds(Math.round(UT * 3600 * 1000));
  return result;
}

export function sunsetUtc(date: Date, lat: number, lng: number) {
  return solarTime(date, lat, lng, false);
}

export function sunriseUtc(date: Date, lat: number, lng: number) {
  return solarTime(date, lat, lng, true);
}

export function formatLocalTime(utc: Date | null, timeZone: string) {
  if (!utc) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(utc);
}
