import { pricing } from '../config/pricing';
export const money = (value: number) => new Intl.NumberFormat('ru-BY', { maximumFractionDigits: 2 }).format(value);
export function calculatePrice(base: number, total: number, students: number, apply: boolean) {
  const count = Math.min(50, Math.max(1, Math.trunc(Number(total) || 1)));
  const studentCount = Math.min(count, Math.max(0, Math.trunc(Number(students) || 0)));
  const full = Math.round(base * count * 100);
  const saving = apply ? Math.round(base * studentCount * pricing.studentDiscount * 100) : 0;
  return { count, students: studentCount, base: full / 100, saving: saving / 100, total: (full - saving) / 100 };
}
