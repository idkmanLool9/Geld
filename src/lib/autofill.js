// Free, on-device auto-fill: reads the text on a photo (Tesseract OCR, runs in the browser,
// files served from this site) and the photo's main colour. No account, no API, no cost.
import { ALL_NAMES } from '../data/countries.js'
import { unitsFor } from '../data/currencies.js'

// ----- OCR -----
let workerPromise = null
async function getWorker(onProgress) {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import('tesseract.js')
      const base = new URL('ocr/', document.baseURI).href
      return createWorker('eng', 1, {
        workerPath: base + 'worker.min.js',
        corePath: base,
        langPath: base,
        gzip: true,
        logger: (m) => onProgress?.(m),
      })
    })().catch((err) => {
      workerPromise = null
      throw err
    })
  }
  return workerPromise
}

/** Text printed on the photo, uppercased and without accents. */
export async function readText(dataUrl, onProgress) {
  const worker = await getWorker(onProgress)
  const { data } = await worker.recognize(dataUrl)
  return data.text || ''
}

const norm = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()

// Issuing banks and local country names → country code.
const ISSUERS = [
  ['NATIONALE BANK VAN BELGIE|BANQUE NATIONALE DE BELGIQUE|BELGIQUE|BELGIE', 'BE'],
  ['NEDERLANDSCHE BANK|NEDERLAND', 'NL'],
  ['DEUTSCHE BUNDESBANK|BANK DEUTSCHER LANDER|BUNDESREPUBLIK', 'DE'],
  ['REICHSBANK|REICHSBANKNOTE|DARLEHNSKASSE|RENTENBANK', 'DR'],
  ['DEUTSCHE NOTENBANK|STAATSBANK DER DDR', 'DD'],
  ['OESTERREICHISCHE NATIONALBANK|OSTERREICHISCHE NATIONALBANK|OSTERREICH', 'AT'],
  ['BANQUE DE FRANCE', 'FR'],
  ["BANCA D'ITALIA|BANCA DITALIA|BANCA D ITALIA|REPUBBLICA ITALIANA", 'IT'],
  ['BANCO DE ESPANA', 'ES'],
  ['BANCO DE PORTUGAL', 'PT'],
  ['CENTRAL BANK OF IRELAND|BANC CEANNAIS|EIRE', 'IE'],
  ['BANQUE CENTRALE DU LUXEMBOURG|GRAND-DUCHE DE LUXEMBOURG|LUXEMBOURG', 'LU'],
  ['SUOMEN PANKKI|FINLANDS BANK', 'FI'],
  ['BANK OF GREECE|TRAPEZA TIS ELLADOS', 'GR'],
  ['EUROPEAN CENTRAL BANK|BCE ECB|ECB EZB', 'EU'],
  ['BANK OF ENGLAND', 'GB'],
  ['BANK OF SCOTLAND|ROYAL BANK OF SCOTLAND|CLYDESDALE BANK', 'GB-SCT'],
  ['ULSTER BANK|DANSKE BANK|NORTHERN BANK', 'GB-NIR'],
  ['SCHWEIZERISCHE NATIONALBANK|BANQUE NATIONALE SUISSE|BANCA NAZIONALE SVIZZERA', 'CH'],
  ['NORGES BANK', 'NO'],
  ['SVERIGES RIKSBANK|SVERIGE', 'SE'],
  ['DANMARKS NATIONALBANK', 'DK'],
  ['SEDLABANKI ISLANDS', 'IS'],
  ['NARODOWY BANK POLSKI|POLSKA', 'PL'],
  ['MAGYAR NEMZETI BANK', 'HU'],
  ['CESKA NARODNI BANKA', 'CZ'],
  ['NARODNA BANKA SLOVENSKA', 'SK'],
  ['STATNI BANKA CESKOSLOVENSKA|CESKOSLOVENSKA', 'CS'],
  ['BANCA NATIONALA A ROMANIEI|ROMANIA', 'RO'],
  ['BULGARSKA NARODNA BANKA', 'BG'],
  ['NARODNA BANKA JUGOSLAVIJE|JUGOSLAVIJA', 'YU'],
  ['NARODNA BANKA SRBIJE', 'RS'],
  ['HRVATSKA NARODNA BANKA', 'HR'],
  ['BANKA SLOVENIJE', 'SI'],
  ['NATIONAL BANK OF UKRAINE', 'UA'],
  ['TURKIYE CUMHURIYET MERKEZ BANKASI|MERKEZ BANKASI|TURKIYE', 'TR'],
  ['BANK OF ISRAEL', 'IL'],
  ['CENTRAL BANK OF JORDAN', 'JO'],
  ['CENTRAL BANK OF IRAQ', 'IQ'],
  ['BANQUE DU LIBAN', 'LB'],
  ['CENTRAL BANK OF SYRIA', 'SY'],
  ['CENTRAL BANK OF EGYPT', 'EG'],
  ['SAUDI ARABIAN MONETARY|SAUDI CENTRAL BANK', 'SA'],
  ['CENTRAL BANK OF THE UNITED ARAB EMIRATES|UNITED ARAB EMIRATES', 'AE'],
  ['CENTRAL BANK OF KUWAIT', 'KW'],
  ['QATAR CENTRAL BANK', 'QA'],
  ['CENTRAL BANK OF OMAN', 'OM'],
  ['CENTRAL BANK OF BAHRAIN|BAHRAIN MONETARY', 'BH'],
  ['BANK MARKAZI', 'IR'],
  ['RESERVE BANK OF INDIA', 'IN'],
  ['STATE BANK OF PAKISTAN', 'PK'],
  ['BANGLADESH BANK', 'BD'],
  ['CENTRAL BANK OF SRI LANKA', 'LK'],
  ['CENTRAL BANK OF CEYLON', 'CEY'],
  ['NEPAL RASTRA BANK', 'NP'],
  ['BANK OF THAILAND', 'TH'],
  ['BANK INDONESIA', 'ID'],
  ['BANK NEGARA MALAYSIA', 'MY'],
  ['BANGKO SENTRAL NG PILIPINAS|CENTRAL BANK OF THE PHILIPPINES', 'PH'],
  ['MONETARY AUTHORITY OF SINGAPORE|BOARD OF COMMISSIONERS OF CURRENCY', 'SG'],
  ["PEOPLE'S BANK OF CHINA|PEOPLES BANK OF CHINA|ZHONGGUO RENMIN YINHANG", 'CN'],
  ['NIPPON GINKO|BANK OF JAPAN', 'JP'],
  ['BANK OF KOREA', 'KR'],
  ['HONG KONG', 'HK'],
  ['CENTRAL BANK OF THE REPUBLIC OF CHINA|TAIWAN', 'TW'],
  ['STATE BANK OF VIETNAM|NGAN HANG NHA NUOC VIET NAM', 'VN'],
  ['RESERVE BANK OF AUSTRALIA|COMMONWEALTH OF AUSTRALIA', 'AU'],
  ['RESERVE BANK OF NEW ZEALAND', 'NZ'],
  ['FEDERAL RESERVE|UNITED STATES OF AMERICA', 'US'],
  ['BANK OF CANADA|BANQUE DU CANADA', 'CA'],
  ['BANCO DE MEXICO', 'MX'],
  ['BANCO CENTRAL DO BRASIL', 'BR'],
  ['BANCO CENTRAL DE LA REPUBLICA ARGENTINA', 'AR'],
  ['BANCO CENTRAL DE CHILE', 'CL'],
  ['BANCO DE LA REPUBLICA', 'CO'],
  ['BANCO CENTRAL DE RESERVA DEL PERU', 'PE'],
  ['BANCO CENTRAL DE VENEZUELA', 'VE'],
  ['BANCO CENTRAL DEL URUGUAY', 'UY'],
  ['BANCO CENTRAL DE CUBA', 'CU'],
  ['EASTERN CARIBBEAN CENTRAL BANK|EAST CARIBBEAN CENTRAL BANK', 'ECS'],
  ['SOUTH AFRICAN RESERVE BANK|SUID-AFRIKAANSE RESERWEBANK', 'ZA'],
  ['CENTRAL BANK OF NIGERIA', 'NG'],
  ['BANK OF GHANA', 'GH'],
  ['CENTRAL BANK OF KENYA', 'KE'],
  ['BANK OF TANZANIA', 'TZ'],
  ['BANK OF UGANDA', 'UG'],
  ['BANK AL-MAGHRIB|BANK AL MAGHRIB', 'MA'],
  ["BANQUE CENTRALE DE TUNISIE", 'TN'],
  ["BANQUE D'ALGERIE|BANQUE CENTRALE D'ALGERIE", 'DZ'],
  ["BANQUE CENTRALE DES ETATS DE L'AFRIQUE DE L'OUEST|AFRIQUE DE L'OUEST", 'BWA'],
  ["BANQUE DES ETATS DE L'AFRIQUE CENTRALE|AFRIQUE CENTRALE", 'BEAC'],
  ['BANQUE DU ZAIRE', 'ZR'],
  ['BANQUE CENTRALE DU CONGO', 'CD'],
  ['RESERVE BANK OF ZIMBABWE', 'ZW'],
  ['RESERVE BANK OF RHODESIA', 'RH'],
  ['BANK OF ZAMBIA', 'ZM'],
  ['NATIONAL BANK OF ETHIOPIA', 'ET'],
  ['BANK VAN DE NEDERLANDSE ANTILLEN|NEDERLANDSE ANTILLEN', 'AN'],
  ['CENTRALE BANK VAN CURACAO EN SINT MAARTEN', 'CW'],
  ['CENTRALE BANK VAN SURINAME', 'SR'],
  ['CENTRALE BANK VAN ARUBA', 'AW'],
].map(([re, cc]) => [new RegExp('\\b(' + re.replace(/'/g, "'?") + ')\\b'), cc])

const NAME_TO_CC = ALL_NAMES.filter(([name]) => name.length >= 4).map(([name, cc]) => [new RegExp('\\b' + norm(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'), cc])

const YEAR_NOW = new Date().getFullYear()
const isDenom = (n) => /^(1|2|25|3|5)0*$/.test(String(n)) && n > 0 && n <= 1e9
const stem = (u) => {
  const s = norm(u).replace(/[^A-Z ]/g, '')
  return s.length <= 3 ? s : s.slice(0, s.length <= 4 ? 3 : 4)
}

/** Turn OCR text into suggestions: country code, denomination, year, unit. */
export function parseText(raw, knownCc) {
  const t = norm(raw).replace(/[|]/g, 'I')
  const out = {}

  // Country: issuing bank first, then a country name in the text.
  let cc = knownCc
  if (!cc) {
    for (const [re, code] of ISSUERS) if (re.test(t)) { cc = code; break }
  }
  if (!cc) for (const [re, code] of NAME_TO_CC) if (re.test(t)) { cc = code; break }
  if (cc && !knownCc) out.cc = cc

  // Numbers: join thousands separators ("1.000", "1'000"), then count.
  const nums = (t.match(/\d{1,3}(?:[.,']\d{3})+|\d+/g) || []).map((s) => s.replace(/[.,']/g, ''))
  // "1 000" style: only counted when the joined number is a denomination.
  const spaced = (t.match(/\b\d{1,3}(?: \d{3})+\b/g) || []).map((s) => s.replace(/ /g, '')).filter((s) => isDenom(+s))
  const denoms = new Map()
  const years = new Map()
  for (const s of nums) {
    if (s.length > 10) continue
    const n = +s
    if (s.length === 4 && n >= 1800 && n <= YEAR_NOW) years.set(n, (years.get(n) || 0) + 1)
    if (isDenom(n) && !(s.length === 4 && n >= 1800 && n <= YEAR_NOW && n !== 2000)) denoms.set(n, (denoms.get(n) || 0) + 1)
  }
  for (const s of spaced) denoms.set(+s, (denoms.get(+s) || 0) + 1)
  const best = (m, prefer) => [...m.entries()].sort((a, b) => b[1] - a[1] || prefer(a[0], b[0]))[0]?.[0]
  const denom = best(denoms, (a, b) => b - a)
  if (denom) out.denom = String(denom)
  const year = best(years, (a, b) => a - b)
  if (year) out.year = String(year)

  // Unit: a currency word of this country that appears in the text.
  if (cc) {
    // A unit counts when every word of it appears; the longest such name wins ("Yeni Türk Lirası" over "Lira").
    const words = (u) => u.replace(/\(.*?\)/g, '').trim().split(/\s+/)
    const hit = unitsFor(cc).filter((u) => words(u).every((w) => stem(w).length >= 3 && new RegExp('\\b' + stem(w)).test(t)))
    const most = Math.max(0, ...hit.map((u) => words(u).length))
    const top = hit.filter((u) => words(u).length === most)
    if (top.length) out.unit = year && year < 2002 && top.length > 1 ? top[0] : top[top.length - 1]
  }
  return out
}

// ----- Colour -----
/** Main colour of the middle of the photo, slightly darkened so white text on it stays readable. */
export function photoColor(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = 48
      c.height = 24
      const ctx = c.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, img.naturalWidth * 0.15, img.naturalHeight * 0.15, img.naturalWidth * 0.7, img.naturalHeight * 0.7, 0, 0, 48, 24)
      const d = ctx.getImageData(0, 0, 48, 24).data
      let r = 0, g = 0, b = 0, n = 0
      for (let i = 0; i < d.length; i += 4) {
        const max = Math.max(d[i], d[i + 1], d[i + 2])
        const min = Math.min(d[i], d[i + 1], d[i + 2])
        if (max > 235 && min > 225) continue // skip paper-white and glare
        r += d[i]; g += d[i + 1]; b += d[i + 2]; n++
      }
      if (!n) return resolve(null)
      const k = Math.min(1, 150 / Math.max(r / n, g / n, b / n)) // keep it dark enough
      const hex = (v) => Math.round((v / n) * k).toString(16).padStart(2, '0')
      resolve('#' + hex(r) + hex(g) + hex(b))
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}
