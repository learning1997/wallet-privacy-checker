import { describe, expect, it } from 'vitest';
import { calculatePrivacy } from '../src/lib/privacy';
import type { EtherscanTransaction } from '../src/lib/privacy';

const tx = (overrides: Partial<EtherscanTransaction> = {}): EtherscanTransaction => ({
  hash: '0x1',
  from: '0xabc',
  to: '0xdef',
  value: '0',
  input: '0x',
  functionName: '',
  timeStamp: '1700000000',
  ...overrides,
});

describe('calculatePrivacy', () => {
  it('returns a perfect ghost score for a clean wallet', () => {
    const result = calculatePrivacy([], [], 3000);
    expect(result.score).toBe(100);
    expect(result.label).toBe('GHOST');
    expect(result.transactionCount).toBe(0);
  });

  it('deducts for transactions, unique contracts, approvals, swaps, bridges, and large ETH transfers', () => {
    const result = calculatePrivacy([
      tx({ hash: '0x1', to: '0xrouter', input: '0x7ff36ab5', functionName: 'swapExactETHForTokens' }),
      tx({ hash: '0x2', to: '0xrouter', input: '0x095ea7b3', functionName: 'approve' }),
      tx({ hash: '0x3', to: '0xbridge', input: '0x12345678', functionName: 'deposit' }),
      tx({ hash: '0x4', to: '0xwhale', value: '4000000000000000000' }),
    ], [], 3000);
    expect(result.transactionCount).toBe(4);
    expect(result.contractCount).toBe(2);
    expect(result.swapCount).toBe(1);
    expect(result.approvalCount).toBe(1);
    expect(result.bridgeCount).toBe(1);
    expect(result.largeTransactionCount).toBe(1);
    expect(result.score).toBe(83);
  });

  it('clamps the score to zero and assigns the correct labels at boundaries', () => {
    expect(calculatePrivacy(Array.from({ length: 30 }, (_, i) => tx({ hash: `0x${i}`, to: `0x${i}` })), [], 3000).score).toBe(85);
    expect(calculatePrivacy(Array.from({ length: 300 }, (_, i) => tx({ hash: `0x${i}`, to: `0x${i}` })), [], 3000).score).toBe(0);
    expect(calculatePrivacy([], [], 3000).label).toBe('GHOST');
  });

  it('counts unique contract interactions across transactions and token transfers', () => {
    const result = calculatePrivacy([
      tx({ to: '0xCAFE', input: '0x12345678', functionName: 'interact' }),
      tx({ hash: '0x2', to: '0xcafe' }),
    ], [{ contractAddress: '0xBEEF' }], null);
    expect(result.contractCount).toBe(2);
    expect(result.score).toBe(97);
  });
});
