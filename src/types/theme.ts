export type ThemeId = 'editorial-light' | 'sepia-reading' | 'obsidian-dark' | 'nordic-dark';

export interface ThemeDefinition {
  id: ThemeId;
  nameFa: string;
  subtitleFa: string;
  mode: 'light' | 'dark';
  swatches: [string, string, string];
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'editorial-light',
    nameFa: 'جوهر و کاغذ',
    subtitleFa: 'روشن · تحریری کلاسیک',
    mode: 'light',
    swatches: ['#FBF9F5', '#1C1917', '#1D3557'],
  },
  {
    id: 'sepia-reading',
    nameFa: 'سپیا کتابخانه',
    subtitleFa: 'روشن · مطالعه طولانی',
    mode: 'light',
    swatches: ['#F4ECD8', '#2B2118', '#8C3B19'],
  },
  {
    id: 'obsidian-dark',
    nameFa: 'کربن شب',
    subtitleFa: 'تیره · استودیو کدنویسی',
    mode: 'dark',
    swatches: ['#0B0E14', '#161B26', '#7AA2F7'],
  },
  {
    id: 'nordic-dark',
    nameFa: 'نوردیک قطبی',
    subtitleFa: 'تیره · آرام و کم‌کنتراست',
    mode: 'dark',
    swatches: ['#181D26', '#232A36', '#88C0D0'],
  },
];
