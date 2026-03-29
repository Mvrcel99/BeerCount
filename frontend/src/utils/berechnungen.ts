export function formatiereDatum(isoDatum: string) {
  const datum = new Date(isoDatum)
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(datum)
}
