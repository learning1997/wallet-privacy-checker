import type { PrivacyReport, ScoreLabel } from './privacy';

export const SCORE_COLORS: Record<ScoreLabel, string> = {
  GHOST: '#00ffb0',
  CAUTIOUS: '#4bdcff',
  EXPOSED: '#f4d35e',
  VULNERABLE: '#ff964f',
  'FULLY TRANSPARENT': '#ff4d67',
};

export interface ShareCardStat {
  label: string;
  value: number;
  tone: 'danger' | 'warn';
}

export interface ShareCardModel {
  score: number;
  label: ScoreLabel;
  color: string;
  address: string;
  stats: ShareCardStat[];
  line: string;
  site: string;
  handle: string;
}

export function shortWallet(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function buildShareCardModel(report: PrivacyReport, address: string): ShareCardModel {
  return {
    score: report.score,
    label: report.label,
    color: SCORE_COLORS[report.label],
    address: shortWallet(address),
    stats: [
      { label: 'TOTAL TRANSACTIONS', value: report.transactionCount, tone: 'danger' },
      { label: 'DEX SWAPS DETECTED', value: report.swapCount, tone: 'danger' },
      { label: 'CONTRACTS TOUCHED', value: report.contractCount, tone: 'warn' },
      { label: 'BRIDGE ACTIVITY', value: report.bridgeCount, tone: 'warn' },
    ],
    line: `${report.swapCount} swaps · ${report.contractCount} contracts · ${report.bridgeCount} bridge txns`,
    site: 'TESTNET.FLUTON.IO',
    handle: '@FLUTONIO',
  };
}

export function shareCardFilename(address: string): string {
  return `fluton-privacy-${address.toLowerCase().slice(0, 10)}.png`;
}

export function buildShareText(report: PrivacyReport, url: string): string {
  return `My wallet privacy score is ${report.score}/100 ${report.label} on @flutonIo Privacy Checker.\n\nIs your DeFi wallet exposed? Check yours: ${url}\n\n#Fluton #PrivacyDeFi #Web3Privacy`;
}
