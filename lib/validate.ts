export function isEmail(v: unknown) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isNonEmptyString(v: unknown) {
  return typeof v === 'string' && v.trim().length > 0;
}
