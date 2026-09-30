// Datums in het Nederlands, bijv. '28 september 2026', en als ISO voor <time>.
export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);
