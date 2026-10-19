import { describe, expect, it } from 'vitest';
import { buildShareCardModel, buildShareText, shareCardFilename, SCORE_COLORS } from '../src/lib/shareCard';
import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH, drawShareCard } from '../src/lib/renderShareCard';
import type { PrivacyReport } from '../src/lib/privacy';

const report: PrivacyReport = {
  score: 83,
  label: 'CAUTIOUS',
  transactionCount: 128,
  contractCount: 34,
  swapCount: 12,
  approvalCount: 7,
  bridgeCount: 3,
  largeTransactionCount: 2,
  ethUsdPrice: 3000,
};

const address = '0xDeadBeef00000000000000000000000000001234';

type Call = { method: string; args: unknown[]; fillStyle: string; strokeStyle: string; font: string; text: string };

function fakeContext() {
  const calls: Call[] = [];
  const record = (method: string) => (...args: unknown[]) => {
    calls.push({
      method,
      args,
      fillStyle: String(ctx.fillStyle),
      strokeStyle: String(ctx.strokeStyle),
      font: String(ctx.font),
      text: typeof args[0] === 'string' ? args[0] : '',
    });
  };
  const ctx: Record<string, unknown> = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    shadowBlur: 0,
    shadowColor: '',
    lineCap: 'butt',
    letterSpacing: '0px',
    globalAlpha: 1,
    fillRect: record('fillRect'),
    strokeRect: record('strokeRect'),
    beginPath: record('beginPath'),
    closePath: record('closePath'),
    moveTo: record('moveTo'),
    lineTo: record('lineTo'),
    arc: record('arc'),
    stroke: record('stroke'),
    fill: record('fill'),
    save: record('save'),
    restore: record('restore'),
    translate: record('translate'),
    rotate: record('rotate'),
    setLineDash: record('setLineDash'),
    fillText: record('fillText'),
    strokeText: record('strokeText'),
    measureText: (text: string) => ({ width: String(text).length * 12 }),
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
}

describe('buildShareCardModel', () => {
  it('carries the score, label color, shortened wallet and the four stats', () => {
    const model = buildShareCardModel(report, address);
    expect(model.score).toBe(83);
    expect(model.label).toBe('CAUTIOUS');
    expect(model.color).toBe(SCORE_COLORS.CAUTIOUS);
    expect(model.address).toBe('0xDead…1234');
    expect(model.stats.map((stat) => stat.label)).toEqual([
      'TOTAL TRANSACTIONS',
      'DEX SWAPS DETECTED',
      'CONTRACTS TOUCHED',
      'BRIDGE ACTIVITY',
    ]);
    expect(model.stats.map((stat) => stat.value)).toEqual([128, 12, 34, 3]);
  });
});

describe('shareCardFilename', () => {
  it('builds a lowercase png filename from the address', () => {
    expect(shareCardFilename(address)).toBe('fluton-privacy-0xdeadbeef.png');
  });
});

describe('buildShareText', () => {
  it('embeds the score, label, url and hashtags', () => {
    const text = buildShareText(report, 'https://example.com');
    expect(text).toContain('83/100 CAUTIOUS');
    expect(text).toContain('https://example.com');
    expect(text).toContain('@flutonIo');
    expect(text).toContain('#Fluton #PrivacyDeFi #Web3Privacy');
  });
});

describe('drawShareCard', () => {
  it('paints the card background at the exported size', () => {
    const { ctx, calls } = fakeContext();
    drawShareCard(buildShareCardModel(report, address), ctx);
    const background = calls.find((call) => call.method === 'fillRect' && call.fillStyle === '#050508');
    expect(background?.args).toEqual([0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT]);
    expect([SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT]).toEqual([1080, 1350]);
  });

  it('draws the score, label, ring color, wallet and stats onto the card', () => {
    const { ctx, calls } = fakeContext();
    drawShareCard(buildShareCardModel(report, address), ctx);
    const texts = calls.filter((call) => call.method === 'fillText').map((call) => call.text);
    expect(texts).toContain('83');
    expect(texts).toContain('CAUTIOUS');
    expect(texts).toContain('128');
    expect(texts.some((text) => text.includes('0xDead…1234'))).toBe(true);
    expect(calls.some((call) => call.method === 'arc' && call.strokeStyle === SCORE_COLORS.CAUTIOUS)).toBe(true);
  });

  it('uses the label color for the score number ring and keeps text inside the canvas', () => {
    const { ctx, calls } = fakeContext();
    drawShareCard(buildShareCardModel(report, address), ctx);
    const textBaselines = calls.filter((call) => call.method === 'fillText').map((call) => Number(call.args[2]));
    expect(textBaselines.length).toBeGreaterThan(8);
    expect(Math.max(...textBaselines)).toBeLessThan(SHARE_CARD_HEIGHT);
  });
});
