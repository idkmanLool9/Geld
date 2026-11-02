// Simplified flags, drawn with stripes + absolutely positioned marks.
// dir: 'row' = vertical stripes, 'column' = horizontal stripes.
// stripes: [color, weight]. marks: CSS style objects (percent-based so they scale).

const STAR = { clipPath: 'polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }
const star = (left, top, h, background = '#FFFFFF') => ({ left, top, height: h, aspectRatio: '1', background, ...STAR })
const center = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', aspectRatio: '1' }
const UP = 'polygon(50% 0, 100% 75%, 0 75%)'
const DOWN = 'polygon(50% 100%, 0 25%, 100% 25%)'

export const FLAGS = {
  AU: {
    dir: 'column', stripes: [['#012169', 1]],
    marks: [
      { left: 0, top: '20%', width: '50%', height: '10%', background: '#FFFFFF' },
      { left: '20%', top: 0, width: '10%', height: '50%', background: '#FFFFFF' },
      { left: 0, top: '22.5%', width: '50%', height: '5%', background: '#C8102E' },
      { left: '22.5%', top: 0, width: '5%', height: '50%', background: '#C8102E' },
      star('19%', '62%', '26%'), star('72%', '10%', '16%'), star('84%', '38%', '16%'), star('62%', '44%', '16%'), star('72%', '74%', '16%'),
    ],
  },
  BE: { dir: 'row', stripes: [['#000000', 1], ['#FDDA24', 1], ['#EF3340', 1]] },
  FR: { dir: 'row', stripes: [['#002654', 1], ['#FFFFFF', 1], ['#CE1126', 1]] },
  DE: { dir: 'column', stripes: [['#000000', 1], ['#DD0000', 1], ['#FFCE00', 1]] },
  NL: { dir: 'column', stripes: [['#AE1C28', 1], ['#FFFFFF', 1], ['#21468B', 1]] },
  AT: { dir: 'column', stripes: [['#C8102E', 1], ['#FFFFFF', 1], ['#C8102E', 1]] },
  IT: { dir: 'row', stripes: [['#009246', 1], ['#FFFFFF', 1], ['#CE2B37', 1]] },
  TR: {
    dir: 'column', stripes: [['#E30A17', 1]],
    marks: [
      { left: '20%', top: '22%', height: '56%', aspectRatio: '1', borderRadius: '50%', background: '#FFFFFF' },
      { left: '27%', top: '28%', height: '44%', aspectRatio: '1', borderRadius: '50%', background: '#E30A17' },
      star('50%', '38%', '24%'),
    ],
  },
  JO: {
    dir: 'column', stripes: [['#000000', 1], ['#FFFFFF', 1], ['#007A3D', 1]],
    marks: [
      { left: 0, top: 0, height: '100%', width: '45%', background: '#CE1126', clipPath: 'polygon(0 0, 100% 50%, 0 100%)' },
      star('9%', '41%', '18%'),
    ],
  },
  IQ: {
    dir: 'column', stripes: [['#CE1126', 1], ['#FFFFFF', 1], ['#000000', 1]],
    marks: [{ left: '36%', top: '44%', width: '28%', height: '12%', borderRadius: 2, background: '#007A3D' }],
  },
  LB: {
    dir: 'column', stripes: [['#ED1C24', 1], ['#FFFFFF', 2], ['#ED1C24', 1]],
    marks: [{ left: '41%', top: '27%', width: '18%', height: '46%', background: '#00A651', clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }],
  },
  IN: {
    dir: 'column', stripes: [['#FF9933', 1], ['#FFFFFF', 1], ['#138808', 1]],
    marks: [{ ...center, height: '28%', boxSizing: 'border-box', borderRadius: '50%', border: '1.5px solid #000080' }],
  },
  RU: { dir: 'column', stripes: [['#FFFFFF', 1], ['#0039A6', 1], ['#D52B1E', 1]] },
  IL: {
    dir: 'column', stripes: [['#FFFFFF', 1.6], ['#0038B8', 1.6], ['#FFFFFF', 5.6], ['#0038B8', 1.6], ['#FFFFFF', 1.6]],
    marks: [
      { ...center, height: '40%', background: '#0038B8', clipPath: UP },
      { ...center, height: '40%', background: '#0038B8', clipPath: DOWN },
      { ...center, height: '27%', background: '#FFFFFF', clipPath: UP },
      { ...center, height: '27%', background: '#FFFFFF', clipPath: DOWN },
    ],
  },
  '?': {
    dir: 'column', stripes: [['#D1D1D6', 1]],
    marks: [{ ...center, height: '40%', borderRadius: '50%', background: '#AEAEB2' }],
  },
}
