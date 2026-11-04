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

// Issuers that are not (or no longer) an ISO country (Dutch name + English name).
const EXTRA = [
  { cc: 'EU', name: 'Eurozone', en: 'Eurozone', region: 'Western Europe', flag: 'eu' },
  { cc: 'GB-SCT', name: 'Schotland', en: 'Scotland', region: 'Western Europe', flag: 'gb-sct' },
  { cc: 'GB-NIR', name: 'Noord-Ierland', en: 'Northern Ireland', region: 'Western Europe', flag: 'gb-nir' },
  { cc: 'XK', name: 'Kosovo', en: 'Kosovo', region: 'Eastern Europe', flag: 'xk' },
  { cc: 'DE', name: 'West-Duitsland', en: 'West Germany', region: 'Western Europe', flag: 'de' },
  { cc: 'DR', name: 'Duitse Rijk', en: 'German Empire', region: 'Western Europe', flag: null },
  { cc: 'DD', name: 'Oost-Duitsland', en: 'East Germany', region: 'Eastern Europe', flag: null },
  { cc: 'SU', name: 'Sovjet-Unie', en: 'Soviet Union', region: 'Eastern Europe', flag: null },
  { cc: 'YU', name: 'Joegoslavië', en: 'Yugoslavia', region: 'Eastern Europe', flag: 'yu' },
  { cc: 'CS', name: 'Tsjecho-Slowakije', en: 'Czechoslovakia', region: 'Eastern Europe', flag: null },
  { cc: 'SCG', name: 'Servië en Montenegro', en: 'Serbia and Montenegro', region: 'Eastern Europe', flag: null },
  { cc: 'OT', name: 'Ottomaanse Rijk', en: 'Ottoman Empire', region: 'Middle East & Turkey', flag: null },
  { cc: 'ZR', name: 'Zaïre', en: 'Zaire', region: 'Africa', flag: null },
  { cc: 'RH', name: 'Rhodesië', en: 'Rhodesia', region: 'Africa', flag: null },
  { cc: 'BWA', name: 'West-Afrikaanse Staten', en: 'West African States', region: 'Africa', flag: null },
  { cc: 'BEAC', name: 'Centraal-Afrikaanse Staten', en: 'Central African States', region: 'Africa', flag: null },
  { cc: 'CEY', name: 'Ceylon', en: 'Ceylon', region: 'Central & South Asia', flag: null },
  { cc: 'BU', name: 'Birma', en: 'Burma', region: 'East & Southeast Asia', flag: null },
  { cc: 'AN', name: 'Nederlandse Antillen', en: 'Netherlands Antilles', region: 'Central America & Caribbean', flag: null },
  { cc: 'ECS', name: 'Oost-Caribische Staten', en: 'East Caribbean States', region: 'Central America & Caribbean', flag: null },
]

// Other names people type for the same country (Dutch and English).
const ALIASES = {
  turkey: 'TR', 'türkiye': 'TR', holland: 'NL', 'the netherlands': 'NL', usa: 'US', 'united states of america': 'US', america: 'US',
  uk: 'GB', 'great britain': 'GB', england: 'GB', britain: 'GB', 'czech republic': 'CZ', 'ivory coast': 'CI', swaziland: 'SZ',
  'east timor': 'TL', 'cape verde': 'CV', macedonia: 'MK', 'north korea': 'KP', 'south korea': 'KR', korea: 'KR', russia: 'RU',
  vatican: 'VA', 'vatican city': 'VA', palestine: 'PS', 'hong kong': 'HK', macau: 'MO', 'myanmar (burma)': 'MM', congo: 'CG',
  'dr congo': 'CD', 'democratic republic of the congo': 'CD', 'faroe islands': 'FO', curacao: 'CW', 'curaçao': 'CW',
  engeland: 'GB', 'groot-brittannië': 'GB', 'groot-brittannie': 'GB', vk: 'GB', amerika: 'US', vs: 'US',
  'verenigde staten van amerika': 'US', tsjechie: 'CZ', 'tsjechië': 'CZ', 'zuid-korea': 'KR', 'noord-korea': 'KP',
  vaticaanstad: 'VA', 'ivoorkust': 'CI', 'kaapverdië': 'CV', macedonie: 'MK', 'macedonië': 'MK', belgie: 'BE',
}

const displayNames = (lang) => {
  try {
    return new Intl.DisplayNames([lang], { type: 'region' })
  } catch {
    return null /* very old browser: codes are shown instead */
  }
}
const NL = displayNames('nl')
const EN = displayNames('en')
const nameIn = (dn, cc) => {
  try {
    return dn?.of(cc) || cc
  } catch {
    return cc
  }
}

const ISO = Object.entries(REGIONS).flatMap(([region, codes]) =>
  codes.split(' ').map((cc) => ({ cc, region, name: nameIn(NL, cc), en: nameIn(EN, cc), flag: cc.toLowerCase() })),
)

export const COUNTRIES = [...ISO, ...EXTRA].sort((a, b) => a.name.localeCompare(b.name, 'nl'))

const byName = new Map()
for (const c of COUNTRIES) byName.set(c.name.toLowerCase(), c)
for (const c of COUNTRIES) if (!byName.has(c.en.toLowerCase())) byName.set(c.en.toLowerCase(), c)
const byCode = new Map(ISO.map((c) => [c.cc, c]))
for (const [alias, cc] of Object.entries(ALIASES)) if (!byName.has(alias)) byName.set(alias, byCode.get(cc))

/** Every name a country is known by (Dutch, English, aliases) with its code — for reading photos. */
export const ALL_NAMES = [...byName.entries()].map(([name, c]) => [name, c.cc])

/** Flag-icons code for a stored item code, or null. */
const FLAGS = new Map(COUNTRIES.filter((c) => c.flag).map((c) => [c.cc, c.flag]))
export const flagFor = (cc) => FLAGS.get(cc) || null

const lookup = (name) => byName.get(String(name || '').trim().toLowerCase())

/** Look up a typed country name. Unknown names keep their text, with no flag and region "Other". */
export function countryInfo(name) {
  const c = lookup(name)
  return c ? { cc: c.cc, region: c.region } : { cc: '?', region: 'Other' }
}

/** The Dutch name for a country typed in any known form ("France" → "Frankrijk"); unknown text stays as is. */
export function canonicalCountry(name) {
  const c = lookup(name)
  return c ? c.name : name
}

/** English name of a country typed in any known form (for searching), or ''. */
export function englishCountry(name) {
  return lookup(name)?.en || ''
}
