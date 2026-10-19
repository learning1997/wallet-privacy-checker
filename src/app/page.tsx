'use client';

import { useState, type FormEvent } from 'react';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronRight, CircleHelp,
  Download, ExternalLink, Fingerprint, LockKeyhole, Menu, Radar, ScanLine, Shield,
  ShieldCheck, Sparkles, TriangleAlert, Wallet, X,
} from 'lucide-react';
import {
  calculatePrivacy, isEvmAddress, parseEtherscanList,
  type EtherscanTokenTransfer, type EtherscanTransaction, type PrivacyReport,
} from '@/lib/privacy';
import { buildShareCardModel, buildShareText, shareCardFilename, shortWallet as shortAddress, SCORE_COLORS } from '@/lib/shareCard';
import { downloadBlob, renderShareCardBlob } from '@/lib/renderShareCard';

const ETHERSCAN = 'https://api.etherscan.io/v2/api?chainid=1';
const FLUTON_TESTNET = 'https://testnet.fluton.io';
const FLUTON_SITE = 'https://fluton.io';

async function fetchEtherscanList<T>(action: 'txlist' | 'tokentx', address: string, apiKey: string): Promise<T[]> {
  const params = new URLSearchParams({
    module: 'account', action, address, startblock: '0', endblock: '99999999',
    page: '1', offset: '10000', sort: 'asc', apikey: apiKey,
  });
  const response = await fetch(`${ETHERSCAN}&${params.toString()}`);
  if (!response.ok) throw new Error('Etherscan request failed');
  const payload: { status?: string; message?: string; result?: unknown } = await response.json();
  return parseEtherscanList<T>(payload);
}

async function fetchEthUsd(): Promise<number | null> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    if (!response.ok) return null;
    const data = await response.json();
    const price = Number(data?.ethereum?.usd);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}

export default function Home() {
  const [address, setAddress] = useState('');
  const [report, setReport] = useState<PrivacyReport | null>(null);
  const [scannedAddress, setScannedAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [imageState, setImageState] = useState<'idle' | 'working' | 'done'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = address.trim();
    setError('');
    setReport(null);
    if (!isEvmAddress(normalized)) {
      setError('That address doesn’t look right. Enter a valid 0x wallet address.');
      return;
    }
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    if (!apiKey) {
      setError('Etherscan API key missing. Add NEXT_PUBLIC_ETHERSCAN_API_KEY to your .env.local file.');
      return;
    }

    setLoading(true);
    setScannedAddress(normalized);
    try {
      const [transactions, transfers, ethUsdPrice] = await Promise.all([
        fetchEtherscanList<EtherscanTransaction>('txlist', normalized, apiKey),
        fetchEtherscanList<EtherscanTokenTransfer>('tokentx', normalized, apiKey),
        fetchEthUsd(),
      ]);
      setReport(calculatePrivacy(transactions, transfers, ethUsdPrice));
    } catch {
      setError('Unable to fetch data. Try again later.');
    } finally {
      setLoading(false);
    }
  }

  function shareScore() {
    if (!report) return;
    const text = buildShareText(report, window.location.origin);
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  async function downloadScoreCard() {
    if (!report || imageState === 'working') return;
    setError('');
    setImageState('working');
    try {
      const blob = await renderShareCardBlob(buildShareCardModel(report, scannedAddress));
      downloadBlob(blob, shareCardFilename(scannedAddress));
      setImageState('done');
      window.setTimeout(() => setImageState('idle'), 2400);
    } catch {
      setError('Could not render the image. Try again.');
      setImageState('idle');
    }
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(scannedAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Could not copy the address.');
    }
  }

  const color = report ? SCORE_COLORS[report.label] : SCORE_COLORS.GHOST;
  const scoreStyle = report ? ({ '--score-color': color, '--score-angle': `${report.score * 3.6}deg` } as React.CSSProperties) : undefined;

  return (
    <main>
      <div className="page-grid" aria-hidden="true" />
      <header className="topbar wrap">
        <a className="brand" href="#top" aria-label="Fluton home">
          <span className="brand-mark"><span /></span><span>FLUTON<span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-right">
          <span className="network-pill"><span className="live-dot" /> ETHEREUM MAINNET</span>
          <a className="top-link" href={FLUTON_SITE} target="_blank" rel="noreferrer">FLUTON.IO <ExternalLink size={12} /></a>
        </div>
        <button className="mobile-menu" aria-label="Open menu" onClick={() => window.location.assign(FLUTON_TESTNET)}><Menu size={20} /></button>
      </header>

      <section className="hero wrap" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> ON-CHAIN PRIVACY SCANNER <span className="eyebrow-index">01 / 03</span></div>
          <h1>HOW EXPOSED<br />IS YOUR <span className="outline-text">WALLET?</span></h1>
          <p className="hero-sub">Your wallet tells a story. Find out <em>who can read it.</em></p>
          <div className="powered"><span className="powered-icon"><ShieldCheck size={14} /></span> POWERED BY <b>FLUTON</b><span className="powered-separator">/</span> PRIVATE BY DESIGN</div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-outer" /><div className="orbit orbit-inner" />
          <div className="art-cross cross-one" /><div className="art-cross cross-two" />
          <div className="art-core"><Fingerprint size={56} strokeWidth={1.1} /><span className="core-spark">✳</span></div>
          <div className="art-tag tag-top"><span>0x</span> TRACEABLE</div>
          <div className="art-tag tag-bottom"><span className="tiny-pulse" /> PUBLIC LEDGER · LIVE</div>
          <div className="art-coord">37° 33&apos; 12.0&quot; N<br />127° 00&apos; 31.2&quot; E</div>
        </div>
      </section>

      <section className="scan-section wrap" aria-labelledby="scan-title">
        <div className="scan-heading">
          <div><span className="section-kicker">01 — ENTER YOUR ADDRESS</span><h2 id="scan-title">CHECK YOUR EXPOSURE</h2></div>
          <span className="read-only"><LockKeyhole size={12} /> READ-ONLY SCAN</span>
        </div>
        <form className="scan-form" onSubmit={handleSubmit} noValidate>
          <div className="input-shell">
            <span className="input-prefix"><Wallet size={17} /></span>
            <input
              aria-label="EVM wallet address"
              autoComplete="off"
              spellCheck={false}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter EVM wallet address 0x..."
            />
            {address && <button className="clear-input" type="button" onClick={() => { setAddress(''); setError(''); }} aria-label="Clear address"><X size={15} /></button>}
          </div>
          <button className="scan-button" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> ANALYZING WALLET...</> : <>CHECK PRIVACY SCORE <ArrowRight size={16} /></>}
          </button>
        </form>
        <div className="form-foot"><span><LockKeyhole size={12} /> We never store your address</span><span>ETHEREUM MAINNET <span className="foot-divider">/</span> EVM COMPATIBLE ADDRESS</span></div>
        {error && <div className="toast-error" role="alert"><TriangleAlert size={15} /> {error}</div>}
      </section>

      {loading && <div className="loading-line wrap"><span className="loading-bar" /><span>ANALYZING WALLET<span className="loading-dots">...</span></span><span className="loading-address">{shortAddress(scannedAddress)}</span></div>}

      {report && <section className="results wrap" aria-live="polite">
        <div className="results-head">
          <div><span className="section-kicker">02 — YOUR PRIVACY REPORT</span><h2>THE PUBLIC RECORD</h2></div>
          <button className="scanned-wallet" onClick={copyAddress} title="Copy address"><span className="scanned-ledger">0x</span>{shortAddress(scannedAddress)} {copied ? <Check size={13} /> : <ScanLine size={13} />}</button>
        </div>
        <div className="results-grid">
          <article className="score-card">
            <div className="score-topline"><span>PRIVACY INDEX</span><CircleHelp size={14} /></div>
            <div className="score-gauge" style={scoreStyle}>
              <div className="gauge-inner"><Radar size={22} className="gauge-icon" /><span className="score-number">{report.score}</span><span className="score-outof">/ 100</span><span className="score-label">{report.label}</span></div>
            </div>
            <p className="score-caption">YOUR PRIVACY SCORE</p>
            <div className="score-divider" />
            <p className="score-summary">{report.transactionCount === 0 ? 'Clean wallet. No exposure detected.' : `${report.transactionCount.toLocaleString()} public transaction${report.transactionCount === 1 ? '' : 's'} analyzed on Ethereum.`}</p>
            <span className="score-footnote">A HEURISTIC ESTIMATE · NOT AN AUDIT</span>
          </article>

          <div className="stats-panel">
            <div className="stats-head"><span>EXPOSURE BREAKDOWN</span><span className="stats-live"><span className="live-dot" /> SCAN COMPLETE</span></div>
            <div className="stats-grid">
              <StatCard label="TOTAL TRANSACTIONS" value={report.transactionCount} icon={<TriangleAlert size={16} />} tone="red" detail="publicly visible" />
              <StatCard label="DEX SWAPS DETECTED" value={report.swapCount} icon={<ArrowDownRight size={17} />} tone="red" detail="swap patterns" />
              <StatCard label="CONTRACTS TOUCHED" value={report.contractCount} icon={<Fingerprint size={17} />} tone="orange" detail="unique contracts" />
              <StatCard label="BRIDGE ACTIVITY" value={report.bridgeCount} icon={<ArrowUpRight size={17} />} tone="orange" detail="likely bridge calls" />
            </div>
            <div className="score-method"><Sparkles size={13} /><span>Score deductions include public transactions, unique contracts, approvals, swap / bridge patterns{report.ethUsdPrice ? ', and native ETH transfers over $10k.' : '.'}</span></div>
          </div>
        </div>

        <section className="protect-panel">
          <div className="protect-title"><div><span className="section-kicker">THE CASE FOR PRIVACY</span><h3>WHAT FLUTON WOULD PROTECT</h3></div><span className="shield-stamp"><Shield size={17} /></span></div>
          <ProtectionRow title="YOUR SWAP AMOUNTS" detail={`${report.swapCount} detected swap${report.swapCount === 1 ? '' : 's'} are publicly traceable`} outcome="Hidden on Fluton" />
          <ProtectionRow title="YOUR WALLET BALANCE" detail="Balances and token holdings can be viewed on-chain" outcome="Encrypted on Fluton" />
          <ProtectionRow title="YOUR TRADING STRATEGY" detail={`${report.contractCount} unique contract${report.contractCount === 1 ? '' : 's'} leave a public trail`} outcome="Hidden on Fluton" />
          <ProtectionRow title="YOUR BRIDGE ACTIVITY" detail={`${report.bridgeCount} likely bridge interaction${report.bridgeCount === 1 ? '' : 's'} detected`} outcome="Private on Fluton" />
          <p className="protect-note">Fluton features are described by the project. Verify current testnet capabilities before use.</p>
        </section>

        <div className="cta-row">
          <a className="protect-cta" href={FLUTON_TESTNET} target="_blank" rel="noreferrer"><ShieldCheck size={17} /> PROTECT YOUR WALLET <ArrowRight size={16} /></a>
          <button className="share-cta" onClick={shareScore}><span className="x-mark">𝕏</span> SHARE MY SCORE ON X <ArrowUpRight size={14} /></button>
          <button className="download-cta" onClick={downloadScoreCard} disabled={imageState === 'working'}>
            {imageState === 'working' ? <><span className="spinner neon" /> RENDERING IMAGE...</> : imageState === 'done' ? <><Check size={15} /> IMAGE SAVED</> : <><Download size={15} /> DOWNLOAD IMAGE</>}
          </button>
        </div>
        <p className="cta-note">Saves a share-ready 1080×1350 PNG of this report, including the shortened wallet address.</p>

        <section className="how-section">
          <div className="how-header"><div><span className="section-kicker">PRIVATE TRANSACTIONS, SIMPLIFIED</span><h3>HOW FLUTON WORKS</h3></div><a href={FLUTON_TESTNET} target="_blank" rel="noreferrer" className="text-link">EXPLORE TESTNET <ChevronRight size={14} /></a></div>
          <div className="steps-grid">
            <StepCard number="01" title="SHIELD" body="Encrypt your tokens before they enter the public view." icon={<Shield size={19} />} />
            <StepCard number="02" title="TRANSACT" body="Execute transactions with your strategy kept private." icon={<ArrowRight size={19} />} />
            <StepCard number="03" title="UNSHIELD" body="Exit when you want. Privacy should stay in your control." icon={<LockKeyhole size={19} />} />
          </div>
          <a className="testnet-link" href={FLUTON_TESTNET} target="_blank" rel="noreferrer">TRY FLUTON TESTNET <ArrowRight size={15} /></a>
        </section>
      </section>}

      <section className={`how-section intro-how wrap ${report ? 'after-results' : ''}`}>
        {!report && <>
          <div className="how-header"><div><span className="section-kicker">PRIVATE TRANSACTIONS, SIMPLIFIED</span><h3>HOW FLUTON WORKS</h3></div><a href={FLUTON_TESTNET} target="_blank" rel="noreferrer" className="text-link">EXPLORE TESTNET <ChevronRight size={14} /></a></div>
          <div className="steps-grid">
            <StepCard number="01" title="SHIELD" body="Encrypt your tokens before they enter the public view." icon={<Shield size={19} />} />
            <StepCard number="02" title="TRANSACT" body="Execute transactions with your strategy kept private." icon={<ArrowRight size={19} />} />
            <StepCard number="03" title="UNSHIELD" body="Exit when you want. Privacy should stay in your control." icon={<LockKeyhole size={19} />} />
          </div>
          <a className="testnet-link" href={FLUTON_TESTNET} target="_blank" rel="noreferrer">TRY FLUTON TESTNET <ArrowRight size={15} /></a>
        </>}
      </section>

      <footer className="footer wrap">
        <div className="footer-brand"><a className="brand" href="#top"><span className="brand-mark"><span /></span><span>FLUTON<span className="brand-dot">.</span></span></a><p>Built for the Fluton community.</p></div>
        <div className="footer-links"><a href={FLUTON_SITE} target="_blank" rel="noreferrer">FLUTON.IO <ExternalLink size={11} /></a><a href={FLUTON_TESTNET} target="_blank" rel="noreferrer">TESTNET <ExternalLink size={11} /></a><a href="https://x.com/flutonIo" target="_blank" rel="noreferrer">@FLUTONIO <ExternalLink size={11} /></a></div>
        <p className="disclaimer">Educational tool only. Scores are heuristic estimates based on public Ethereum data. Wallet addresses are not stored.</p>
        <span className="footer-copy">© FLUTON <span>·</span> PRIVACY IS A RIGHT, NOT A FEATURE.</span>
      </footer>
    </main>
  );
}

function StatCard({ label, value, icon, tone, detail }: { label: string; value: number; icon: React.ReactNode; tone: 'red' | 'orange'; detail: string }) {
  return <article className={`stat-card tone-${tone}`}><div className="stat-card-head"><span>{label}</span><span className="stat-icon">{icon}</span></div><div className="stat-value">{value.toLocaleString()}</div><div className="stat-detail">{detail}</div></article>;
}

function ProtectionRow({ title, detail, outcome }: { title: string; detail: string; outcome: string }) {
  return <div className="protect-row"><span className="protect-icon"><ShieldCheck size={16} /></span><div className="protect-copy"><b>{title}</b><span>{detail}</span></div><span className="protect-outcome"><Check size={13} /> {outcome}</span></div>;
}

function StepCard({ number, title, body, icon }: { number: string; title: string; body: string; icon: React.ReactNode }) {
  return <article className="step-card"><div className="step-top"><span>{number} / STEP</span><span className="step-icon">{icon}</span></div><h4>{title}</h4><p>{body}</p><span className="step-line" /></article>;
}
