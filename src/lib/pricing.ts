import { pricing } from '../config/pricing';
// All arithmetic runs in whole kopecks, so totals never pick up floating-point drift.
const toKopecks = (byn: number) => Math.round(byn * 100);
const studentKopecks = (base: number) => Math.round(toKopecks(base) * (100 - pricing.studentDiscountPercent) / 100);
export const studentPrice = (base: number) => studentKopecks(base) / 100;
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const withKopecks = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// 125 → "125", 87.2 → "87.20", 9765 → "9,765"
export const money = (value: number) => (toKopecks(value) % 100 === 0 ? whole : withKopecks).format(value);
// Regular travelers pay the starting price, students pay it minus the student discount.
export function calculatePrice(base: number, total: number, students: number) {
  const count = Math.min(pricing.maxTravelers, Math.max(1, Math.trunc(Number(total) || 1)));
  const studentCount = Math.min(count, Math.max(0, Math.trunc(Number(students) || 0)));
  const regularCount = count - studentCount;
  const baseKop = toKopecks(base), studentKop = studentKopecks(base);
  const regularCost = regularCount * baseKop, studentCost = studentCount * studentKop;
  return { count, students: studentCount, regular: regularCount, basePrice: baseKop / 100, studentPrice: studentKop / 100, regularCost: regularCost / 100, studentCost: studentCost / 100, total: (regularCost + studentCost) / 100, saving: studentCount * (baseKop - studentKop) / 100 };
}
