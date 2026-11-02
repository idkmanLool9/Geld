// Country list for the "Add item" form: ISO-2 code → region.
// Names come from the browser (Intl.DisplayNames); historical states get a fixed name.

export const REGIONS = {
  'Western Europe': 'AD AT BE CH CY DE DK ES EU FI FO FR GB GI GR IE IM IS IT JE GG LI LU MC MT NL NO PT SE SM VA',
  'Eastern Europe': 'AL AM AZ BA BG BY CS CZ DD EE GE HR HU LT LV MD ME MK PL RO RS RU SI SK SU UA XK YU',
  'Middle East & Turkey': 'AE BH IL IQ IR JO KW LB OM PS QA SA SY TR YE',
  Africa:
    'AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RW SC SD SL SN SO SS ST SZ TD TG TN TZ UG ZA ZM ZW',
  'Central & South Asia': 'AF BD BT IN KG KZ LK MV NP PK TJ TM UZ',
  'East & Southeast Asia': 'BN CN HK ID JP KH KP KR LA MM MN MO MY PH SG TH TL TW VN',
  'North America': 'CA MX US',
  'Central America & Caribbean': 'AG AW BB BS BZ CR CU CW DM DO GD GT HN HT JM KN KY LC NI PA SV TT VC',
  'South America': 'AR BO BR CL CO EC GY PE PY SR UY VE',
  Oceania: 'AU FJ NZ PG SB TO VU WS',
}

const FIXED_NAMES = {
  SU: 'Soviet Union',
  YU: 'Yugoslavia',
  DD: 'East Germany',
  CS: 'Czechoslovakia',
  EU: 'Eurozone',
  XK: 'Kosovo',
}

let names = null
try {
  names = new Intl.DisplayNames(['en'], { type: 'region' })
} catch {
  /* very old browser: codes are shown instead */
}
const nameOf = (cc) => {
  if (FIXED_NAMES[cc]) return FIXED_NAMES[cc]
  try {
    return names?.of(cc) || cc
  } catch {
    return cc
  }
}

export const COUNTRIES = Object.entries(REGIONS)
  .flatMap(([region, codes]) => codes.split(' ').map((cc) => ({ cc, region, name: nameOf(cc) })))
  .sort((a, b) => a.name.localeCompare(b.name))

const byName = new Map(COUNTRIES.map((c) => [c.name.toLowerCase(), c]))

/** Look up a typed country name. Unknown names keep their text, with no flag and region "Other". */
export function countryInfo(name) {
  const c = byName.get(String(name || '').trim().toLowerCase())
  return c ? { cc: c.cc, region: c.region } : { cc: '?', region: 'Other' }
}
