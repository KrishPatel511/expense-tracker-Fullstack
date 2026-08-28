// Har category ka fixed color - mockup ke design se match karta hai
export const categoryColors = {
  Food: { text: 'var(--coral)', bg: 'var(--coral-bg)' },
  Travel: { text: 'var(--gold)', bg: 'var(--gold-bg)' },
  Bills: { text: 'var(--purple)', bg: 'var(--purple-bg)' },
  Shopping: { text: 'var(--teal)', bg: 'var(--teal-bg)' },
};

export const categoryList = ['Food', 'Travel', 'Bills', 'Shopping'];

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatAmount(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}
