export const REGION_ORDER = ['Western Europe', 'Turkey & Middle East', 'South Asia', 'Eastern Europe', 'Oceania']

export const REGION_COLORS = {
  'Western Europe': '#0A6CDB',
  'Turkey & Middle East': '#F09A2E',
  'South Asia': '#1F8A4C',
  'Eastern Europe': '#9B59D0',
  Oceania: '#D63B5C',
}

export const CURRENCY = {
  AU: 'Australian dollar',
  BE: 'Belgian franc — replaced by the euro in 2002',
  FR: 'French franc — replaced by the euro in 2002',
  DE: 'Mark of the German Empire',
  NL: 'Dutch guilder — replaced by the euro in 2002',
  AT: 'Austrian schilling — replaced by the euro in 2002',
  IT: 'Italian lira — replaced by the euro in 2002',
  TR: 'Turkish lira',
  JO: 'Jordanian dinar',
  IQ: 'Iraqi dinar',
  LB: 'Lebanese pound (livre)',
  IN: 'Indian rupee',
  RU: 'Russian ruble',
  IL: 'Israeli lira / sheqel',
}

export const FOLDER_NAMES = {
  highlights: 'Highlights',
  exchangeable: 'Still exchangeable',
  identify: 'To identify',
  lots: 'Lot material',
}

export const STATUS = {
  legal: { label: 'Legal tender', bg: '#E3F4E8', fg: '#1B6E36' },
  exch: { label: 'Exchangeable', bg: '#E5F0FD', fg: '#0055B3' },
  demo: { label: 'Demonetised', bg: '#EEEEF0', fg: '#55555C' },
  check: { label: 'To identify', bg: '#FDF0E1', fg: '#8F4D00' },
}

// The Dutch guilder exchange window at DNB closes on this date.
export const GULDEN_DEADLINE = Date.UTC(2032, 0, 1)
