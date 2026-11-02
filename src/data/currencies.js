// Currency units per country (current first in CURRENT, older ones in OLDER) and the
// exchange rules for the old euro-area currencies. Used to suggest and auto-fill the form.

const CURRENT = `AD:Euro AE:Dirham AF:Afghani AG:East Caribbean Dollar AI:East Caribbean Dollar AL:Lek AM:Dram AO:Kwanza AR:Peso
AS:US Dollar AT:Euro AU:Dollar AW:Florin AX:Euro AZ:Manat BA:Convertible Mark BB:Dollar BD:Taka BE:Euro BF:CFA Franc BG:Euro
BH:Dinar BI:Franc BJ:CFA Franc BL:Euro BM:Dollar BN:Dollar BO:Boliviano BQ:US Dollar BR:Real BS:Dollar BT:Ngultrum BV:Krone
BW:Pula BY:Ruble BZ:Dollar CA:Dollar CC:Australian Dollar CD:Franc CF:CFA Franc CG:CFA Franc CH:Franken CI:CFA Franc
CK:NZ Dollar CL:Peso CM:CFA Franc CN:Yuan CO:Peso CR:Colón CU:Peso CV:Escudo CW:Caribbean Guilder CX:Australian Dollar CY:Euro
CZ:Koruna DE:Euro DJ:Franc DK:Krone DM:East Caribbean Dollar DO:Peso DZ:Dinar EC:US Dollar EE:Euro EG:Pound EH:Dirham ER:Nakfa
ES:Euro ET:Birr FI:Euro FJ:Dollar FK:Pound FM:US Dollar FO:Króna FR:Euro GA:CFA Franc GB:Pound GD:East Caribbean Dollar GE:Lari
GF:Euro GG:Pound GH:Cedi GI:Pound GL:Krone GM:Dalasi GN:Franc GP:Euro GQ:CFA Franc GR:Euro GS:Pound GT:Quetzal GU:US Dollar
GW:CFA Franc GY:Dollar HK:Dollar HM:Australian Dollar HN:Lempira HR:Euro HT:Gourde HU:Forint ID:Rupiah IE:Euro IL:New Shekel
IM:Pound IN:Rupee IO:US Dollar IQ:Dinar IR:Rial IS:Króna IT:Euro JE:Pound JM:Dollar JO:Dinar JP:Yen KE:Shilling KG:Som KH:Riel
KI:Australian Dollar KM:Franc KN:East Caribbean Dollar KP:Won KR:Won KW:Dinar KY:Dollar KZ:Tenge LA:Kip LB:Pound
LC:East Caribbean Dollar LI:Franken LK:Rupee LR:Dollar LS:Loti LT:Euro LU:Euro LV:Euro LY:Dinar MA:Dirham MC:Euro MD:Leu ME:Euro
MF:Euro MG:Ariary MH:US Dollar MK:Denar ML:CFA Franc MM:Kyat MN:Tögrög MO:Pataca MP:US Dollar MQ:Euro MR:Ouguiya
MS:East Caribbean Dollar MT:Euro MU:Rupee MV:Rufiyaa MW:Kwacha MX:Peso MY:Ringgit MZ:Metical NA:Dollar NC:CFP Franc NE:CFA Franc
NF:Australian Dollar NG:Naira NI:Córdoba NL:Euro NO:Krone NP:Rupee NR:Australian Dollar NU:NZ Dollar NZ:Dollar OM:Rial PA:Balboa
PE:Sol PF:CFP Franc PG:Kina PH:Peso PK:Rupee PL:Złoty PM:Euro PN:NZ Dollar PR:US Dollar PS:New Shekel PT:Euro PW:US Dollar
PY:Guaraní QA:Riyal RE:Euro RO:Leu RS:Dinar RU:Ruble RW:Franc SA:Riyal SB:Dollar SC:Rupee SD:Pound SE:Krona SG:Dollar SH:Pound
SI:Euro SJ:Krone SK:Euro SL:Leone SM:Euro SN:CFA Franc SO:Shilling SR:Dollar SS:Pound ST:Dobra SV:US Dollar SX:Caribbean Guilder
SY:Pound SZ:Lilangeni TC:US Dollar TD:CFA Franc TF:Euro TG:CFA Franc TH:Baht TJ:Somoni TK:NZ Dollar TL:US Dollar TM:Manat
TN:Dinar TO:Paʻanga TR:Lira TT:Dollar TV:Australian Dollar TW:Dollar TZ:Shilling UA:Hryvnia UG:Shilling UM:US Dollar US:Dollar
UY:Peso UZ:Soʻm VA:Euro VC:East Caribbean Dollar VE:Bolívar VG:US Dollar VI:US Dollar VN:Đồng VU:Vatu WF:CFP Franc WS:Tālā
XK:Euro YE:Rial YT:Euro ZA:Rand ZM:Kwacha ZW:ZiG
EU:Euro GB-SCT:Pound GB-NIR:Pound DR:Mark DD:Mark SU:Ruble YU:Dinar CS:Koruna SCG:Dinar OT:Lira ZR:Zaire RH:Dollar
BWA:CFA Franc BEAC:CFA Franc CEY:Rupee BU:Kyat AN:Gulden ECS:Dollar`

// Earlier currencies people still collect (newest first).
const OLDER = {
  BE: ['Frank'], NL: ['Gulden'], DE: ['Mark', 'Reichsmark'], AT: ['Schilling'], LU: ['Franc'], FR: ['Franc'], IT: ['Lira'],
  ES: ['Peseta'], PT: ['Escudo'], IE: ['Pound'], FI: ['Markka'], GR: ['Drachma'], SI: ['Tolar'], CY: ['Pound'], MT: ['Lira'],
  SK: ['Koruna'], BG: ['Lev'], EE: ['Kroon'], LV: ['Lats'], LT: ['Litas'], HR: ['Kuna', 'Dinar'], MC: ['Franc'], SM: ['Lira'], VA: ['Lira'],
  ME: ['Mark', 'Dinar'], XK: ['Mark', 'Dinar'], AD: ['Peseta', 'Franc'],
  TR: ['Yeni Türk Lirası', 'Türk Lirası'], IL: ['Sheqel', 'Lira'], RU: ['Ruble (Soviet)'], UA: ['Karbovanets'], BY: ['Ruble (old)'],
  PL: ['Złoty (old)'], HU: ['Pengő'], RO: ['Leu (old)'], YU: ['Dinar'], RS: ['Dinar (Yugoslav)'],
  MX: ['Peso (old)'], BR: ['Cruzeiro Real', 'Cruzado', 'Cruzeiro'], AR: ['Austral', 'Peso Argentino'], PE: ['Inti', 'Sol de Oro'],
  CL: ['Escudo'], VE: ['Bolívar Fuerte'], ZW: ['Dollar'], GH: ['Cedi (old)'], CD: ['Zaire'], AF: ['Afghani (old)'],
  AZ: ['Manat (old)'], TM: ['Manat (old)'], ZM: ['Kwacha (old)'], MR: ['Ouguiya (old)'], MG: ['Malagasy Franc'],
  CW: ['Gulden'], SX: ['Gulden'], DR: ['Rentenmark', 'Papiermark'], EU: [],
}

const parse = () => {
  const m = {}
  for (const pair of CURRENT.split(/\s+(?=[A-Z-]{2,6}:)/)) {
    const i = pair.indexOf(':')
    m[pair.slice(0, i).trim()] = pair.slice(i + 1).trim()
  }
  return m
}
const CURRENT_BY_CC = parse()

/** Units for a country code, oldest-collected first, current currency last. */
export function unitsFor(cc) {
  const now = CURRENT_BY_CC[cc]
  return [...new Set([...(OLDER[cc] || []), ...(now ? [now] : [])])]
}
export const currentUnit = (cc) => CURRENT_BY_CC[cc] || null

// Official euro conversion rates and where the national central bank still exchanges banknotes.
// `until`: last day (ISO) — null means no end date. Older series can have expired earlier.
const EURO_LEGACY = {
  BE: { unit: 'Frank', rate: 40.3399, bank: 'Nationale Bank van België, Brussels (also by registered post)', until: null },
  DE: { unit: 'Mark', rate: 1.95583, bank: 'Deutsche Bundesbank, any branch (also by post)', until: null },
  AT: { unit: 'Schilling', rate: 13.7603, bank: 'Oesterreichische Nationalbank, Vienna (also by post)', until: null },
  IE: { unit: 'Pound', rate: 0.787564, bank: 'Central Bank of Ireland, Dublin (also by post)', until: null },
  LU: { unit: 'Franc', rate: 40.3399, bank: 'Banque centrale du Luxembourg', until: null },
  NL: { unit: 'Gulden', rate: 2.20371, bank: 'De Nederlandsche Bank, Amsterdam (by appointment or by post)', until: '2031-12-31' },
  SI: { unit: 'Tolar', rate: 239.64, bank: 'Banka Slovenije, Ljubljana', until: null },
  SK: { unit: 'Koruna', rate: 30.126, bank: 'Národná banka Slovenska', until: null },
  EE: { unit: 'Kroon', rate: 15.6466, bank: 'Eesti Pank, Tallinn', until: null },
  LV: { unit: 'Lats', rate: 0.702804, bank: 'Latvijas Banka, Riga', until: null },
  LT: { unit: 'Litas', rate: 3.4528, bank: 'Lietuvos bankas, Vilnius', until: null },
  HR: { unit: 'Kuna', rate: 7.5345, bank: 'Hrvatska narodna banka, Zagreb', until: null },
  BG: { unit: 'Lev', rate: 1.95583, bank: 'Bulgarian National Bank, Sofia', until: null },
  FR: { unit: 'Franc', rate: 6.55957, until: '2012-02-17' },
  IT: { unit: 'Lira', rate: 1936.27, until: '2011-12-06' },
  ES: { unit: 'Peseta', rate: 166.386, until: '2021-06-30' },
  PT: { unit: 'Escudo', rate: 200.482, until: '2022-02-28' },
  FI: { unit: 'Markka', rate: 5.94573, until: '2012-02-29' },
  GR: { unit: 'Drachma', rate: 340.75, until: '2012-03-01' },
  CY: { unit: 'Pound', rate: 0.585274, until: '2017-12-31' },
  MT: { unit: 'Lira', rate: 0.4293, until: '2018-01-31' },
}

// ISO 4217 code of each country's current currency (for today's value in euro).
const CODES = `AD:EUR AE:AED AF:AFN AG:XCD AI:XCD AL:ALL AM:AMD AO:AOA AR:ARS AS:USD AT:EUR AU:AUD AW:AWG AX:EUR AZ:AZN BA:BAM
BB:BBD BD:BDT BE:EUR BF:XOF BG:EUR BH:BHD BI:BIF BJ:XOF BL:EUR BM:BMD BN:BND BO:BOB BQ:USD BR:BRL BS:BSD BT:BTN BV:NOK BW:BWP
BY:BYN BZ:BZD CA:CAD CC:AUD CD:CDF CF:XAF CG:XAF CH:CHF CI:XOF CK:NZD CL:CLP CM:XAF CN:CNY CO:COP CR:CRC CU:CUP CV:CVE CW:XCG
CX:AUD CY:EUR CZ:CZK DE:EUR DJ:DJF DK:DKK DM:XCD DO:DOP DZ:DZD EC:USD EE:EUR EG:EGP EH:MAD ER:ERN ES:EUR ET:ETB FI:EUR FJ:FJD
FK:FKP FM:USD FO:DKK FR:EUR GA:XAF GB:GBP GD:XCD GE:GEL GF:EUR GG:GBP GH:GHS GI:GIP GL:DKK GM:GMD GN:GNF GP:EUR GQ:XAF GR:EUR
GS:GBP GT:GTQ GU:USD GW:XOF GY:GYD HK:HKD HM:AUD HN:HNL HR:EUR HT:HTG HU:HUF ID:IDR IE:EUR IL:ILS IM:GBP IN:INR IO:USD IQ:IQD
IR:IRR IS:ISK IT:EUR JE:GBP JM:JMD JO:JOD JP:JPY KE:KES KG:KGS KH:KHR KI:AUD KM:KMF KN:XCD KP:KPW KR:KRW KW:KWD KY:KYD KZ:KZT
LA:LAK LB:LBP LC:XCD LI:CHF LK:LKR LR:LRD LS:LSL LT:EUR LU:EUR LV:EUR LY:LYD MA:MAD MC:EUR MD:MDL ME:EUR MF:EUR MG:MGA MH:USD
MK:MKD ML:XOF MM:MMK MN:MNT MO:MOP MP:USD MQ:EUR MR:MRU MS:XCD MT:EUR MU:MUR MV:MVR MW:MWK MX:MXN MY:MYR MZ:MZN NA:NAD NC:XPF
NE:XOF NF:AUD NG:NGN NI:NIO NL:EUR NO:NOK NP:NPR NR:AUD NU:NZD NZ:NZD OM:OMR PA:PAB PE:PEN PF:XPF PG:PGK PH:PHP PK:PKR PL:PLN
PM:EUR PN:NZD PR:USD PS:ILS PT:EUR PW:USD PY:PYG QA:QAR RE:EUR RO:RON RS:RSD RU:RUB RW:RWF SA:SAR SB:SBD SC:SCR SD:SDG SE:SEK
SG:SGD SH:SHP SI:EUR SJ:NOK SK:EUR SL:SLE SM:EUR SN:XOF SO:SOS SR:SRD SS:SSP ST:STN SV:USD SX:XCG SY:SYP SZ:SZL TC:USD TD:XAF
TF:EUR TG:XOF TH:THB TJ:TJS TK:NZD TL:USD TM:TMT TN:TND TO:TOP TR:TRY TT:TTD TV:AUD TW:TWD TZ:TZS UA:UAH UG:UGX UM:USD US:USD
UY:UYU UZ:UZS VA:EUR VC:XCD VE:VES VG:USD VI:USD VN:VND VU:VUV WF:XPF WS:WST XK:EUR YE:YER YT:EUR ZA:ZAR ZM:ZMW ZW:ZWG EU:EUR
GB-SCT:GBP GB-NIR:GBP BWA:XOF BEAC:XAF ECS:XCD`
const CODE_BY_CC = Object.fromEntries(CODES.split(/\s+/).map((p) => p.split(':')))

/** ISO code when `unit` is the country's current currency, else null. */
export function currencyCode(cc, unit) {
  const now = CURRENT_BY_CC[cc]
  if (!now || String(unit || '').trim().toLowerCase() !== now.toLowerCase()) return null
  return CODE_BY_CC[cc] || null
}

/** Advice for money that is still legal tender: how to turn it into euro. */
export function legalTenderAdvice(code, country, type = 'note') {
  if (code === 'EUR') return 'Euro: spend it, or pay it into any bank account in the euro area.'
  const where = country ? ` in ${country}` : ''
  if (type === 'coin') return `Still valid money${where}. Exchange offices rarely take coins: spend them${where}.`
  return (
    `Still valid money${where}. Change it at a currency exchange office (for example GWK Travelex in the Netherlands; ` +
    `many banks in Belgium and the Netherlands no longer change cash), or spend it${where}. An exchange office pays a little ` +
    `less than the market rate. Central banks do not buy valid foreign money by post.`
  )
}

// Year each country switched to the euro (default 2002).
const EURO_SINCE = { SI: 2007, CY: 2008, MT: 2008, SK: 2009, EE: 2011, LV: 2014, LT: 2015, HR: 2023, BG: 2026 }

/**
 * The unit to fill in without asking: the only one there is, or — for a euro country with a
 * known year — the old currency before the switch and the euro after it. Otherwise null.
 */
export function guessUnit(cc, year) {
  const units = unitsFor(cc)
  if (units.length === 1) return units[0]
  const y = parseInt(String(year || '').match(/\d{4}/)?.[0], 10)
  const e = EURO_LEGACY[cc]
  if (e && y) return y < (EURO_SINCE[cc] || 2002) ? e.unit : 'Euro'
  return null
}

export const parseDenom = (d) => {
  const s = String(d || '').trim().toUpperCase().replace(/[\s.,']/g, '')
  const m = s.match(/^(\d+)(K|M)?$/)
  if (!m) return null
  return +m[1] * (m[2] === 'K' ? 1e3 : m[2] === 'M' ? 1e6 : 1)
}
const fmtDate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

/**
 * Exchange facts for an old euro-area banknote: status, exchange value in EUR and where.
 * Returns null when the unit is not one of these currencies.
 */
export function exchangeInfo(cc, unit, denom, type = 'note') {
  const e = EURO_LEGACY[cc]
  if (!e || type !== 'note' || String(unit || '').trim().toLowerCase() !== e.unit.toLowerCase()) return null
  const open = !e.until || new Date(e.until + 'T23:59:59Z') > new Date()
  const n = parseDenom(denom)
  if (!open) return { status: 'demo', face: 0, where: '', note: `Exchange at the central bank ended on ${fmtDate(e.until)}.` }
  return {
    status: 'exch',
    face: n ? Math.round((n / e.rate) * 100) / 100 : 0,
    where: `${e.bank}${e.until ? ` — until ${fmtDate(e.until)}` : ' — no end date'}. Check that this series is still accepted.`,
  }
}
