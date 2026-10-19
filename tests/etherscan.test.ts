import { describe, expect, it } from 'vitest';
import { parseEtherscanList } from '../src/lib/privacy';

describe('parseEtherscanList', () => {
  it('treats the Etherscan empty-results response as an empty list', () => {
    expect(parseEtherscanList({ status: '0', message: 'No transactions found', result: [] })).toEqual([]);
  });

  it('returns a successful result list', () => {
    expect(parseEtherscanList({ status: '1', message: 'OK', result: [{ hash: '0xabc' }] })).toEqual([{ hash: '0xabc' }]);
  });

  it('surfaces API errors instead of silently reporting a clean wallet', () => {
    expect(() => parseEtherscanList({ status: '0', message: 'NOTOK', result: 'Invalid API Key' })).toThrow('Unable to fetch data. Try again later.');
  });
});
