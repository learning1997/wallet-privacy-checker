import type { ShareCardModel } from './shareCard';

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1350;

const BG = '#050508';
const GRID = 'rgba(0,255,176,0.045)';
const TEXT = '#f1f2ef';
const MUTED = '#89908e';
const DIM = '#6c7471';
const GREEN = '#00ffb0';
const TONE_COLORS: Record<'danger' | 'warn', string> = { danger: '#ff6278', warn: '#ffa553' };
const DISPLAY = '"Bebas Neue", Impact, "Arial Narrow", sans-serif';
const MONO = '"Space Mono", "Courier New", monospace';

/** Draws the shareable privacy card. Kept separate from DOM APIs so it can be tested with a recording context. */
export function drawShareCard(
  model: ShareCardModel,
  ctx: CanvasRenderingContext2D,
  width = SHARE_CARD_WIDTH,
  height = SHARE_CARD_HEIGHT,
): void {
  const left = 88;
  const right = width - 88;
  const centerX = width / 2;

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 54) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 54) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(0,255,176,0.28)';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  const tick = 34;
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 3;
  ([[20, 20, 1, 1], [width - 20, 20, -1, 1], [20, height - 20, 1, -1], [width - 20, height - 20, -1, -1]] as const).forEach(
    ([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x + dx * tick, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * tick);
      ctx.stroke();
    },
  );

  ctx.fillStyle = GREEN;
  ctx.font = `700 22px ${MONO}`;
  ctx.letterSpacing = '4px';
  ctx.fillText('02 — YOUR PRIVACY REPORT', left, 145);

  ctx.textAlign = 'right';
  ctx.fillStyle = TEXT;
  ctx.font = `400 44px ${DISPLAY}`;
  ctx.letterSpacing = '3px';
  ctx.fillText('FLUTON', right, 143);

  ctx.textAlign = 'left';
  ctx.fillStyle = TEXT;
  ctx.font = `400 76px ${DISPLAY}`;
  ctx.letterSpacing = '2px';
  ctx.fillText('THE PUBLIC RECORD', left, 225);

  ctx.strokeStyle = 'rgba(255,255,255,0.09)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, 262);
  ctx.lineTo(right, 262);
  ctx.stroke();

  const cx = centerX;
  const cy = 505;
  const radius = 185;
  const fraction = Math.max(0, Math.min(1, model.score / 100));

  ctx.lineWidth = 22;
  ctx.lineCap = 'butt';
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = model.color;
  ctx.shadowColor = model.color;
  ctx.shadowBlur = 34;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  ctx.textAlign = 'center';
  ctx.fillStyle = TEXT;
  ctx.font = `400 150px ${DISPLAY}`;
  ctx.letterSpacing = '2px';
  ctx.fillText(String(model.score), cx, 537);

  ctx.fillStyle = MUTED;
  ctx.font = `400 26px ${MONO}`;
  ctx.letterSpacing = '2px';
  ctx.fillText('/ 100', cx, 585);

  ctx.fillStyle = model.color;
  ctx.font = `700 36px ${MONO}`;
  ctx.letterSpacing = '8px';
  ctx.fillText(model.label, cx, 648);

  ctx.fillStyle = MUTED;
  ctx.font = `700 22px ${MONO}`;
  ctx.letterSpacing = '5px';
  ctx.fillText('YOUR PRIVACY SCORE', cx, 758);

  ctx.strokeStyle = 'rgba(255,255,255,0.09)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, 800);
  ctx.lineTo(right, 800);
  ctx.stroke();

  const cellWidth = 440;
  const cellHeight = 148;
  const gap = 24;
  const gridTop = 820;

  model.stats.forEach((stat, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = left + column * (cellWidth + gap);
    const y = gridTop + row * (cellHeight + gap);

    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.018)';
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cellWidth, cellHeight);

    ctx.fillStyle = MUTED;
    ctx.font = `400 20px ${MONO}`;
    ctx.letterSpacing = '3px';
    ctx.fillText(stat.label, x + 26, y + 42);

    ctx.fillStyle = TEXT;
    ctx.font = `400 64px ${DISPLAY}`;
    ctx.letterSpacing = '1px';
    ctx.fillText(stat.value.toLocaleString('en-US'), x + 24, y + 112);

    ctx.fillStyle = TONE_COLORS[stat.tone];
    ctx.fillRect(x + 1, y + cellHeight - 4, 132, 4);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = DIM;
  ctx.font = `700 22px ${MONO}`;
  ctx.letterSpacing = '4px';
  ctx.fillText(`SCANNED WALLET ${model.address}`, centerX, 1195);

  const panelTop = 1225;
  const panelHeight = 90;
  const panelWidth = right - left;
  ctx.fillStyle = 'rgba(0,255,176,0.045)';
  ctx.fillRect(left, panelTop, panelWidth, panelHeight);
  ctx.strokeStyle = 'rgba(0,255,176,0.32)';
  ctx.lineWidth = 1;
  ctx.strokeRect(left, panelTop, panelWidth, panelHeight);

  ctx.textAlign = 'left';
  ctx.fillStyle = GREEN;
  ctx.font = `700 22px ${MONO}`;
  ctx.letterSpacing = '4px';
  ctx.fillText('WHAT FLUTON WOULD PROTECT', left + 26, panelTop + 36);

  ctx.fillStyle = '#d6d9d6';
  ctx.font = `400 22px ${MONO}`;
  ctx.letterSpacing = '1px';
  ctx.fillText(model.line, left + 26, panelTop + 70);

  ctx.textAlign = 'right';
  ctx.fillStyle = DIM;
  ctx.font = `400 22px ${MONO}`;
  ctx.letterSpacing = '2px';
  ctx.fillText(model.site, right - 26, panelTop + 70);

  ctx.fillStyle = GREEN;
  ctx.font = `700 20px ${MONO}`;
  ctx.letterSpacing = '2px';
  ctx.fillText(model.handle, right - 26, panelTop + 36);

  ctx.restore();
}

async function loadCardFonts(): Promise<void> {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (!fonts?.load) return;
  try {
    await Promise.all([
      fonts.load(`400 150px ${DISPLAY}`),
      fonts.load(`400 76px ${DISPLAY}`),
      fonts.load(`700 22px ${MONO}`),
    ]);
    await fonts.ready;
  } catch {
    // Fall back to system fonts; the card still renders.
  }
}

export async function renderShareCardBlob(model: ShareCardModel): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot render images.');
  await loadCardFonts();
  drawShareCard(model, ctx, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not create the image.');
  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
