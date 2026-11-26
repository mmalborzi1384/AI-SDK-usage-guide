import { AUDIT_CHANGES, CHAPTERS_PART_1, GUIDE_PARTS, QUICK_REF_ROWS } from './guidePart1';
import { CHAPTERS_PART_2, GOLDEN_TIPS } from './guidePart2';
import { Chapter } from '../types/guide';

export const ALL_CHAPTERS: Chapter[] = [...CHAPTERS_PART_1, ...CHAPTERS_PART_2];

export const TOTAL_CHAPTER_COUNT = ALL_CHAPTERS.length + 1; // +1 for Chapter 22 (Golden Engineering Tips)

export { AUDIT_CHANGES, GOLDEN_TIPS, GUIDE_PARTS, QUICK_REF_ROWS };

export function toPersianDigits(input: number | string): string {
  const digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/\d/g, (d) => digits[Number(d)]);
}
