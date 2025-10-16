// forms.js - utilidades de validación (simple)
export function isValidCardNumber(num) {
  const cleaned = (num || '').replace(/\s+/g, '');
  return /^\d{13,19}$/.test(cleaned);
}

export function isValidExpiry(exp) {
  if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
  const [mm, yy] = exp.split('/').map(n => Number(n));
  if (mm < 1 || mm > 12) return false;
  const current = new Date();
  const fullYear = 2000 + yy;
  const expDate = new Date(fullYear, mm);
  return expDate > current;
}

export function isValidCVV(cvv) {
  return /^\d{3,4}$/.test(cvv);
}
