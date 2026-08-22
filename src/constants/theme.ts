import { Mood } from '../types';

export const colors = {
  background: '#FFF9F5',
  card: '#FFFFFF',
  primary: '#A85E72',
  primarySoft: '#F5E8EC',
  text: '#443B47',
  muted: '#877B82',
  border: '#EADDE0',
};

export const moods: Mood[] = [
  { label: 'ดีขึ้น', emoji: '☀️', color: '#F6C86D' },
  { label: 'สงบ', emoji: '🍃', color: '#9CCBB2' },
  { label: 'คิดถึง', emoji: '🌧️', color: '#AFC3E8' },
  { label: 'เหนื่อย', emoji: '🌙', color: '#B8A8CE' },
  { label: 'หนักใจ', emoji: '🫧', color: '#E9A9B6' },
];

export const healingGoals = ['กลับมารักตัวเอง', 'หยุดวนคิดถึงเขา', 'รอเขากลับมา', 'นอนให้ดีขึ้น', 'เริ่มต้นใหม่'];
