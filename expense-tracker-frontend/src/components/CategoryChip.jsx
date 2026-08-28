import { categoryColors } from '../utils/categoryColors';

export default function CategoryChip({ category }) {
  const color = categoryColors[category] || { text: 'var(--muted)', bg: '#eee' };
  return (
    <span className="cat-chip" style={{ background: color.bg, color: color.text }}>
      <span className="cat-dot" style={{ background: color.text }}></span>
      {category}
    </span>
  );
}
