export const REGION_ORDER = [
  'Western Europe',
  'Eastern Europe',
  'Middle East & Turkey',
  'Africa',
  'Central & South Asia',
  'East & Southeast Asia',
  'North America',
  'Central America & Caribbean',
  'South America',
  'Oceania',
  'Other',
]

export const REGION_COLORS = {
  'Western Europe': '#0A6CDB',
  'Eastern Europe': '#7A5BC7',
  'Middle East & Turkey': '#F09A2E',
  Africa: '#B5652A',
  'Central & South Asia': '#1F8A4C',
  'East & Southeast Asia': '#D63B5C',
  'North America': '#2A9BB0',
  'Central America & Caribbean': '#C9A000',
  'South America': '#5E8C2F',
  Oceania: '#C2459A',
  Other: '#8E8E93',
}

export const STATUS = {
  legal: { label: 'Wettig betaalmiddel', bg: '#E3F4E8', fg: '#1B6E36' },
  exch: { label: 'Inwisselbaar', bg: '#E5F0FD', fg: '#0055B3' },
  demo: { label: 'Buiten omloop', bg: '#EEEEF0', fg: '#55555C' },
  check: { label: 'Te identificeren', bg: '#FDF0E1', fg: '#8F4D00' },
}

// Region names shown in the app (the keys above stay English; they are stored on items).
export const REGION_LABELS = {
  'Western Europe': 'West-Europa',
  'Eastern Europe': 'Oost-Europa',
  'Middle East & Turkey': 'Midden-Oosten & Turkije',
  Africa: 'Afrika',
  'Central & South Asia': 'Centraal- & Zuid-Azië',
  'East & Southeast Asia': 'Oost- & Zuidoost-Azië',
  'North America': 'Noord-Amerika',
  'Central America & Caribbean': 'Midden-Amerika & Caraïben',
  'South America': 'Zuid-Amerika',
  Oceania: 'Oceanië',
  Other: 'Overig',
}
export const regionLabel = (r) => REGION_LABELS[r] || r
