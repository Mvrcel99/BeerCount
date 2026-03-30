export function formatUmlauts(text?: string | null): string {
  if (!text) return ''
  return text
    .replace(/AE/g, 'Ä')
    .replace(/OE/g, 'Ö')
    .replace(/UE/g, 'Ü')
    .replace(/Ae/g, 'Ä')
    .replace(/Oe/g, 'Ö')
    .replace(/Ue/g, 'Ü')
    .replace(/ae/g, 'ä')
    .replace(/oe/g, 'ö')
    .replace(/ue/g, 'ü')
    .replace(/ss/g, 'ß')
}
