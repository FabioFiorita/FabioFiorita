// Renders the README's pixel images into assets/. Run with: node scripts/render.mjs
// The SVGs animate with CSS alone, because GitHub shows them as images and runs no script.
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const font = (file) => readFileSync(new URL(`assets/fonts/${file}`, root)).toString('base64');

const colour = {
  night: '#0b0d14',
  panel: '#12162a',
  grid: '#252b45',
  text: '#e8ecf8',
  dim: '#8c95b3',
  porcelain: '#86a8ff',
  tastik: '#5fd38a',
  medtime: '#a790ff',
  alarm: '#ffc861',
  add: '#2f7a52',
  del: '#8a3b4f',
};

const fonts = `@font-face{font-family:Display;src:url(data:font/woff2;base64,${font('press-start-2p.woff2')}) format('woff2')}
@font-face{font-family:Pixel;src:url(data:font/woff2;base64,${font('jersey-10.woff2')}) format('woff2')}`;

const reviewer = ['..bbbb..', '.bbbbbb.', 'bbwbbwbb', 'bbkbbkbb', 'bbbbbbbb', '.bbbbbb.', '.b.bb.b.', 'b......b'];
const bell = ['....aa....', '...aaaa...', '..aaaaaa..', '..aaaaaa..', '.aaaaaaaa.', '.aaaaaaaa.', 'aaaaaaaaaa', '....aa....'];
const pill = ['..vvvvwwww..', '.vvvvvwwwww.', 'vvvvvvwwwwww', 'vvvvvvwwwwww', '.vvvvvwwwww.', '..vvvvwwww..'];
const check = ['......g', '.....gg', 'g...gg.', 'gg.gg..', '.ggg...', '..g....'];

/* Pixel art from rows of characters: each character names a colour, '.' is empty. */
const sprite = (rows, palette, x, y, size, attributes = '') => {
  const rects = rows.flatMap((row, dy) =>
    [...row].flatMap((key, dx) => (palette[key] ? [`<rect x="${dx}" y="${dy}" width="1" height="1" fill="${palette[key]}"/>`] : [])),
  );
  return `<g transform="translate(${x} ${y}) scale(${size})" shape-rendering="crispEdges" ${attributes}>${rects.join('')}</g>`;
};

const svg = (width, height, label, style, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
<title>${label}</title>
<style>${fonts}
.d{font-family:Display,monospace}.p{font-family:Pixel,monospace;text-transform:uppercase;letter-spacing:.04em}
${style}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<rect width="${width}" height="${height}" fill="${colour.night}"/>
${body}
</svg>
`;

/* Keyframes that hold a property at `on` between two moments of a loop and at `off` otherwise. */
const window_ = (name, property, off, on, from, to) => {
  const a = (from * 100).toFixed(2);
  const b = (to * 100).toFixed(2);
  return `@keyframes ${name}{0%,${a}%{${property}:${off}}${(from * 100 + 0.01).toFixed(2)}%,${b}%{${property}:${on}}${(to * 100 + 0.01).toFixed(2)}%,100%{${property}:${off}}}`;
};

const banner = () => {
  const width = 1200;
  const height = 320;
  const blocks = 24;
  const phase = 3.4;
  const cycle = phase * 3;
  const products = [
    ['Porcelain', colour.porcelain],
    ['Tastik', colour.tastik],
    ['ItsMedTime', colour.medtime],
  ];
  const trackX = 64;
  const trackWidth = width - 128;
  const step = trackWidth / blocks;
  const styles = [];
  const cells = [];
  for (let index = 0; index < blocks; index++) {
    const frames = products
      .map(([, fill], p) => {
        const on = (p * phase + index * 0.1) / cycle;
        const off = (p * phase + blocks * 0.1 + 0.9) / cycle;
        return `${(on * 100).toFixed(2)}%,${(off * 100).toFixed(2)}%{fill:${fill}}${(off * 100 + 0.01).toFixed(2)}%{fill:${colour.grid}}`;
      })
      .join('');
    styles.push(`@keyframes b${index}{0%{fill:${colour.grid}}${frames}100%{fill:${colour.grid}}}.b${index}{animation:b${index} ${cycle}s step-end infinite}`);
    cells.push(`<rect class="b${index}" x="${(trackX + index * step).toFixed(1)}" y="268" width="${(step - 6).toFixed(1)}" height="14" fill="${colour.grid}"/>`);
  }
  const runnerFrames = products
    .map((_, p) => {
      const start = (p * phase) / cycle;
      const end = (p * phase + blocks * 0.1) / cycle;
      return `${(start * 100).toFixed(2)}%{transform:translateX(0px)}${(end * 100).toFixed(2)}%{transform:translateX(${(trackWidth - step).toFixed(0)}px)}`;
    })
    .join('');
  styles.push(`@keyframes run{${runnerFrames}100%{transform:translateX(${(trackWidth - step).toFixed(0)}px)}}.runner{animation:run ${cycle}s steps(24) infinite}`);
  const labels = products.map(([name, fill], p) => {
    styles.push(window_(`l${p}`, 'opacity', 0, 1, (p * phase) / cycle, ((p + 1) * phase) / cycle - 0.001));
    styles.push(`.l${p}{opacity:${p === 0 ? 1 : 0};animation:l${p} ${cycle}s step-end infinite}`);
    return `<tspan class="l${p}" fill="${fill}" x="${trackX + 180}">${name}</tspan>`;
  });
  styles.push(`@keyframes drop{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}.name{animation:drop .6s steps(4) both}`);
  return svg(
    width,
    height,
    'Fábio Fiorita, full-stack engineer and builder of Porcelain, Tastik and ItsMedTime',
    styles.join('\n'),
    `<rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="${colour.grid}" stroke-width="2"/>
<text class="p" x="64" y="58" font-size="24" fill="${colour.dim}">Full-stack engineer</text>
<text class="p" x="${width - 64}" y="58" font-size="24" fill="${colour.alarm}" text-anchor="end">São José dos Campos · Brazil</text>
<text class="d name" x="62" y="140" font-size="56" fill="${colour.text}">FÁBIO FIORITA</text>
<text class="p" x="64" y="196" font-size="34" fill="${colour.text}">Builder of <tspan fill="${colour.porcelain}">Porcelain</tspan>, <tspan fill="${colour.tastik}">Tastik</tspan> and <tspan fill="${colour.medtime}">ItsMedTime</tspan></text>
<text class="p" x="${trackX}" y="248" font-size="22" fill="${colour.dim}">Now shipping ▸ ${labels.join('')}</text>
${cells.join('\n')}
<g class="runner">${sprite(reviewer, { b: colour.porcelain, w: colour.text, k: colour.night }, trackX + 2, 244, 2.5)}</g>`,
  );
};

/* A project card: a header, a looping scene, and a footer with the platforms. */
const card = ({ id, name, tone, kind, platforms, scene, styles }) =>
  svg(
    400,
    260,
    `${name}: ${kind}`,
    styles,
    `<rect x="1" y="1" width="398" height="258" fill="${colour.panel}" stroke="${colour.grid}" stroke-width="2"/>
<rect x="2" y="2" width="396" height="36" fill="${colour.night}"/>
<line x1="2" y1="38" x2="398" y2="38" stroke="${colour.grid}" stroke-width="2"/>
<text class="d" x="16" y="27" font-size="14" fill="${tone}">${name.toUpperCase()}</text>
<text class="p" x="384" y="26" font-size="18" fill="${colour.dim}" text-anchor="end">${kind}</text>
${scene}
<line x1="2" y1="222" x2="398" y2="222" stroke="${colour.grid}" stroke-width="2"/>
<text class="p" x="16" y="246" font-size="18" fill="${colour.dim}">${platforms}</text>
<text class="p" x="384" y="246" font-size="18" fill="${tone}" text-anchor="end">${id}.fabiofiorita.com ↗</text>`,
  );

const porcelain = () => {
  const lines = [0.62, -0.4, 0.5, 0.78, -0.28];
  const cycle = 7;
  const styles = [];
  const rows = lines.map((size, index) => {
    const y = 64 + index * 28;
    const tick = (0.9 * (index + 1)) / cycle;
    styles.push(window_(`t${index}`, 'opacity', 0, 1, tick, 6.2 / cycle));
    styles.push(`.t${index}{opacity:0;animation:t${index} ${cycle}s step-end infinite}`);
    return `<rect x="56" y="${y}" width="${Math.abs(size) * 290}" height="12" fill="${size > 0 ? colour.add : colour.del}"/>
<text class="p t${index}" x="372" y="${y + 12}" font-size="20" fill="${colour.porcelain}" text-anchor="end">✓</text>`;
  });
  const moves = lines.map((_, index) => `${((0.9 * index) / cycle * 100).toFixed(2)}%{transform:translateY(${index * 28}px)}`).join('');
  styles.push(`@keyframes walk{${moves}${((0.9 * 5) / cycle * 100).toFixed(2)}%,100%{transform:translateY(112px)}}.walker{animation:walk ${cycle}s steps(1) infinite}`);
  styles.push(window_('stamp', 'opacity', 0, 1, 4.9 / cycle, 6.2 / cycle), `.stamp{opacity:0;animation:stamp ${cycle}s step-end infinite}`);
  return card({
    id: 'porcelain',
    name: 'Porcelain',
    tone: colour.porcelain,
    kind: 'Code review · open source',
    platforms: 'Mac · Web · npm',
    styles: styles.join('\n'),
    scene: `${rows.join('\n')}
<g class="walker">${sprite(reviewer, { b: colour.porcelain, w: colour.text, k: colour.night }, 18, 60, 2.5)}</g>
<g class="stamp" transform="rotate(-6 200 130)"><rect x="118" y="110" width="164" height="40" fill="${colour.night}" stroke="${colour.porcelain}" stroke-width="3"/>
<text class="p" x="200" y="139" font-size="26" fill="${colour.porcelain}" text-anchor="middle">Approved ✓</text></g>`,
  });
};

const tastik = () => {
  const items = ['Lemons', 'Passport', 'Charger', 'Sunscreen'];
  const cycle = 7;
  const styles = [];
  const rows = items.map((item, index) => {
    const y = 60 + index * 38;
    const on = (2 + index * 0.8) / cycle;
    styles.push(window_(`c${index}`, 'opacity', 0, 1, on, 6.4 / cycle), `.c${index}{opacity:0;animation:c${index} ${cycle}s step-end infinite}`);
    styles.push(window_(`s${index}`, 'opacity', 0, 1, on, 6.4 / cycle), `.s${index}{opacity:0;animation:s${index} ${cycle}s step-end infinite}`);
    return `<rect x="18" y="${y}" width="20" height="20" fill="none" stroke="${colour.dim}" stroke-width="3"/>
<g class="c${index}">${sprite(check, { g: colour.tastik }, 20, y + 3, 2.4)}</g>
<text class="p" x="52" y="${y + 18}" font-size="24" fill="${colour.text}">${item}</text>
<rect class="s${index}" x="50" y="${y + 9}" width="${item.length * 11}" height="2" fill="${colour.dim}"/>`;
  });
  const counts = [1, 2, 3, 4, 5, 6].map((value, index) => {
    const from = (index * 0.3) / cycle;
    const to = index === 5 ? 6.6 / cycle : ((index + 1) * 0.3) / cycle - 0.001;
    styles.push(window_(`n${value}`, 'opacity', 0, 1, from, to), `.n${value}{opacity:${value === 1 ? 1 : 0};animation:n${value} ${cycle}s step-end infinite}`);
    return `<text class="p n${value}" x="352" y="78" font-size="24" fill="${colour.text}" text-anchor="middle">${value}</text>`;
  });
  return card({
    id: 'tastik',
    name: 'Tastik',
    tone: colour.tastik,
    kind: 'Lists · App Store',
    platforms: 'iPhone · iPad · ChatGPT',
    styles: styles.join('\n'),
    scene: `${rows.join('\n')}
<text class="p" x="326" y="78" font-size="24" fill="${colour.dim}" text-anchor="middle">−</text>${counts.join('')}<text class="p" x="378" y="78" font-size="24" fill="${colour.dim}" text-anchor="middle">+</text>`,
  });
};

const itsmedtime = () => {
  const cycle = 6;
  const times = ['07:58', '07:59', '08:00'];
  const styles = [];
  const clocks = times.map((time, index) => {
    const from = (index * 0.9) / cycle;
    const to = index === 2 ? 5.6 / cycle : ((index + 1) * 0.9) / cycle - 0.001;
    styles.push(window_(`k${index}`, 'opacity', 0, 1, from, to), `.k${index}{opacity:${index === 0 ? 1 : 0};animation:k${index} ${cycle}s step-end infinite}`);
    return `<text class="d k${index}" x="216" y="102" font-size="34" fill="${index === 2 ? colour.alarm : colour.text}" text-anchor="middle">${time}</text>`;
  });
  styles.push(`@keyframes ring{0%,45%,63%,100%{transform:rotate(0)}48%,54%,60%{transform:rotate(-16deg)}51%,57%{transform:rotate(16deg)}}.bell{transform-origin:86px 70px;animation:ring ${cycle}s steps(1) infinite}`);
  styles.push(window_('due', 'opacity', 1, 0, 2.9 / cycle, 5.6 / cycle), `.due{animation:due ${cycle}s step-end infinite}`);
  styles.push(window_('taken', 'opacity', 0, 1, 2.9 / cycle, 5.6 / cycle), `.taken{opacity:0;animation:taken ${cycle}s step-end infinite}`);
  styles.push(window_('day', 'fill', colour.grid, colour.medtime, 2.9 / cycle, 5.6 / cycle), `.day{animation:day ${cycle}s step-end infinite}`);
  const days = Array.from({ length: 7 }, (_, day) => `<rect ${day === 4 ? 'class="day"' : ''} x="${20 + day * 52.6}" y="192" width="46" height="10" fill="${day < 4 ? colour.medtime : colour.grid}"/>`);
  return card({
    id: 'itsmedtime',
    name: 'ItsMedTime',
    tone: colour.medtime,
    kind: 'Health · App Store',
    platforms: 'iPhone',
    styles: styles.join('\n'),
    scene: `<g class="bell">${sprite(bell, { a: colour.alarm }, 66, 66, 4)}</g>
${clocks.join('\n')}
<rect x="20" y="132" width="360" height="40" fill="none" stroke="${colour.grid}" stroke-width="3"/>
${sprite(pill, { v: colour.medtime, w: colour.text }, 32, 143, 3)}
<text class="p due" x="366" y="160" font-size="22" fill="${colour.dim}" text-anchor="end">Losartan · 8:00</text>
<text class="p taken" x="366" y="160" font-size="22" fill="${colour.tastik}" text-anchor="end">Taken ✓</text>
${days.join('')}`,
  });
};

for (const [file, content] of Object.entries({ 'banner.svg': banner(), 'porcelain.svg': porcelain(), 'tastik.svg': tastik(), 'itsmedtime.svg': itsmedtime() })) {
  writeFileSync(new URL(`assets/${file}`, root), content);
  console.log(`assets/${file}`, `${Math.round(content.length / 1024)} KB`);
}
