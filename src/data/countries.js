// Every country and territory (ISO 3166-1), plus historical and shared issuers of banknotes.
// Names come from the browser (Intl.DisplayNames); the extra issuers have a fixed name.
// `flag`: the flag-icons code to draw, or null (then the short code is shown).

export const REGIONS = {
  'Western Europe':
    'AD AT AX BE CH CY DE DK ES FI FO FR GB GG GI GR IE IM IS IT JE LI LU MC MT NL NO PT SE SJ SM VA',
  'Eastern Europe': 'AL AM AZ BA BG BY CZ EE GE HR HU LT LV MD ME MK PL RO RS RU SI SK UA',
  'Middle East & Turkey': 'AE BH IL IQ IR JO KW LB OM PS QA SA SY TR YE',
  Africa:
    'AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SH SL SN SO SS ST SZ TD TF TG TN TZ UG YT ZA ZM ZW',
  'Central & South Asia': 'AF BD BT IN IO KG KZ LK MV NP PK TJ TM UZ',
  'East & Southeast Asia': 'BN CC CN CX HK ID JP KH KP KR LA MM MN MO MY PH SG TH TL TW VN',
  'North America': 'BM CA GL MX PM UM US',
  'Central America & Caribbean':
    'AG AI AW BB BL BQ BS BZ CR CU CW DM DO GD GP GT HN HT JM KN KY LC MF MQ MS NI PA PR SV SX TC TT VC VG VI',
  'South America': 'AR BO BR CL CO EC FK GF GS GY PE PY SR UY VE',
  Oceania: 'AS AU CK FJ FM GU KI MH MP NC NF NR NU NZ PF PG PN PW SB TK TO TV VU WF WS',
  Other: 'AQ BV HM',
}

// Issuers that are not (or no longer) an ISO country.
const EXTRA = [
  { cc: 'EU', name: 'Eurozone', region: 'Western Europe', flag: 'eu' },
  { cc: 'GB-SCT', name: 'Scotland', region: 'Western Europe', flag: 'gb-sct' },
  { cc: 'GB-NIR', name: 'Northern Ireland', region: 'Western Europe', flag: 'gb-nir' },
  { cc: 'XK', name: 'Kosovo', region: 'Eastern Europe', flag: 'xk' },
  { cc: 'DE', name: 'West Germany', region: 'Western Europe', flag: 'de' },
  { cc: 'DR', name: 'German Empire', region: 'Western Europe', flag: null },
  { cc: 'DD', name: 'East Germany', region: 'Eastern Europe', flag: null },
  { cc: 'SU', name: 'Soviet Union', region: 'Eastern Europe', flag: null },
  { cc: 'YU', name: 'Yugoslavia', region: 'Eastern Europe', flag: null },
  { cc: 'CS', name: 'Czechoslovakia', region: 'Eastern Europe', flag: null },
  { cc: 'SCG', name: 'Serbia and Montenegro', region: 'Eastern Europe', flag: null },
  { cc: 'OT', name: 'Ottoman Empire', region: 'Middle East & Turkey', flag: null },
  { cc: 'ZR', name: 'Zaire', region: 'Africa', flag: null },
  { cc: 'RH', name: 'Rhodesia', region: 'Africa', flag: null },
  { cc: 'BWA', name: 'West African States', region: 'Africa', flag: null },
  { cc: 'BEAC', name: 'Central African States', region: 'Africa', flag: null },
  { cc: 'CEY', name: 'Ceylon', region: 'Central & South Asia', flag: null },
  { cc: 'BU', name: 'Burma', region: 'East & Southeast Asia', flag: null },
  { cc: 'AN', name: 'Netherlands Antilles', region: 'Central America & Caribbean', flag: null },
  { cc: 'ECS', name: 'East Caribbean States', region: 'Central America & Caribbean', flag: null },
]

// Other names people type for the same country.
const ALIASES = {
  turkey: 'TR', 'türkiye': 'TR', holland: 'NL', 'the netherlands': 'NL', usa: 'US', 'united states of america': 'US', america: 'US',
  uk: 'GB', 'great britain': 'GB', england: 'GB', britain: 'GB', 'czech republic': 'CZ', 'ivory coast': 'CI', swaziland: 'SZ',
  'east timor': 'TL', 'cape verde': 'CV', macedonia: 'MK', 'north korea': 'KP', 'south korea': 'KR', korea: 'KR', russia: 'RU',
  vatican: 'VA', 'vatican city': 'VA', palestine: 'PS', 'hong kong': 'HK', macau: 'MO', 'myanmar (burma)': 'MM', 'congo': 'CG',
  'dr congo': 'CD', 'democratic republic of the congo': 'CD', 'faroe islands': 'FO', curacao: 'CW', 'curaçao': 'CW',
}

let names = null
try {
  names = new Intl.DisplayNames(['en'], { type: 'region' })
} catch {
  /* very old browser: codes are shown instead */
}
const nameOf = (cc) => {
  try {
    return names?.of(cc) || cc
  } catch {
    return cc
  }
}

const ISO = Object.entries(REGIONS).flatMap(([region, codes]) =>
  codes.split(' ').map((cc) => ({ cc, region, name: nameOf(cc), flag: cc.toLowerCase() })),
)

export const COUNTRIES = [...ISO, ...EXTRA].sort((a, b) => a.name.localeCompare(b.name))

const byName = new Map(COUNTRIES.map((c) => [c.name.toLowerCase(), c]))
const byCode = new Map(ISO.map((c) => [c.cc, c]))
for (const [alias, cc] of Object.entries(ALIASES)) if (!byName.has(alias)) byName.set(alias, byCode.get(cc))

/** Flag-icons code for a stored item code, or null. */
const FLAGS = new Map(COUNTRIES.filter((c) => c.flag).map((c) => [c.cc, c.flag]))
export const flagFor = (cc) => FLAGS.get(cc) || null

/** Look up a typed country name. Unknown names keep their text, with no flag and region "Other". */
export function countryInfo(name) {
  const c = byName.get(String(name || '').trim().toLowerCase())
  return c ? { cc: c.cc, region: c.region } : { cc: '?', region: 'Other' }
}
