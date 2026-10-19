export interface EtherscanTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  input: string;
  functionName: string;
  timeStamp: string;
}

export interface EtherscanTokenTransfer {
  contractAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  value?: string;
}

export type ScoreLabel = 'GHOST' | 'CAUTIOUS' | 'EXPOSED' | 'VULNERABLE' | 'FULLY TRANSPARENT';

export interface PrivacyReport {
  score: number;
  label: ScoreLabel;
  transactionCount: number;
  contractCount: number;
  swapCount: number;
  approvalCount: number;
  bridgeCount: number;
  largeTransactionCount: number;
  ethUsdPrice: number | null;
}

export function parseEtherscanList<T>(payload: { status?: string; message?: string; result?: unknown }): T[] {
  if (payload.status === '1' && Array.isArray(payload.result)) return payload.result as T[];
  const apiText = `${payload.message ?? ''} ${String(payload.result ?? '')}`;
  if (payload.status === '0' && /no transactions found/i.test(apiText)) return [];
  throw new Error('Unable to fetch data. Try again later.');
}

function labelForScore(score: number): ScoreLabel {
  if (score >= 90) return 'GHOST';
  if (score >= 70) return 'CAUTIOUS';
  if (score >= 50) return 'EXPOSED';
  if (score >= 30) return 'VULNERABLE';
  return 'FULLY TRANSPARENT';
}

function isContractCall(tx: EtherscanTransaction): boolean {
  return Boolean(tx.to) && /^0x[\da-f]{8,}/i.test(tx.input || '');
}

export function calculatePrivacy(
  transactions: EtherscanTransaction[],
  tokenTransfers: EtherscanTokenTransfer[],
  ethUsdPrice: number | null,
): PrivacyReport {
  const contracts = new Set<string>();
  let approvals = 0;
  let swaps = 0;
  let bridges = 0;
  let largeTransactions = 0;

  for (const tx of transactions) {
    const functionName = (tx.functionName || '').toLowerCase();
    const input = (tx.input || '').toLowerCase();
    if (isContractCall(tx)) contracts.add(tx.to.toLowerCase());

    if (input.startsWith('0x095ea7b3') || /\bapprove\s*\(/.test(functionName)) approvals += 1;
    if (/swap|exactinput|exactoutput|execute\s*\(/.test(functionName)) swaps += 1;
    if (/bridge|crosschain|cross-chain|deposit|withdraw/.test(functionName)) bridges += 1;

    if (ethUsdPrice !== null && ethUsdPrice > 0) {
      const ethValue = Number(tx.value || '0') / 1e18;
      if (Number.isFinite(ethValue) && ethValue * ethUsdPrice > 10_000) largeTransactions += 1;
    }
  }

  for (const transfer of tokenTransfers) {
    if (transfer.contractAddress) contracts.add(transfer.contractAddress.toLowerCase());
  }

  const deductions = transactions.length * 0.5
    + contracts.size
    + approvals * 2
    + swaps * 3
    + bridges * 3
    + largeTransactions * 5;
  const score = Math.max(0, Math.round((100 - deductions) * 10) / 10);

  return {
    score,
    label: labelForScore(score),
    transactionCount: transactions.length,
    contractCount: contracts.size,
    swapCount: swaps,
    approvalCount: approvals,
    bridgeCount: bridges,
    largeTransactionCount: largeTransactions,
    ethUsdPrice,
  };
}

export function isEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}
