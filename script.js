/* ══════════════════════════════════════════════════════════════
   INSTALLATION – "Submit Early"
   States: IDLE → GENERATING → RESULT_READY → REVEALED
   ══════════════════════════════════════════════════════════════ */

// ── State machine ─────────────────────────────────────────────
const STATE = { IDLE: 'IDLE', GENERATING: 'GENERATING', RESULT_READY: 'RESULT_READY', REVEALED: 'REVEALED' };
let appState = STATE.IDLE;

function setState(s) { appState = s; }

// ── Tagline ───────────────────────────────────────────────────
const TAGLINES = [
  "Ready when you are.",
  "What will you create today?",
  "Describe your vision.",
  "Turn words into visuals.",
  "Your imagination, rendered.",
  "Create anything, instantly.",
  "Bring your idea to life.",
  "The canvas is yours.",
];

// ── DOM refs ──────────────────────────────────────────────────
const phases = {
  intro:      document.getElementById('phase-intro'),
  generating: document.getElementById('phase-generating'),
  result:     document.getElementById('phase-result'),
  printing:   document.getElementById('phase-printing'),
  reveal:     document.getElementById('phase-reveal'),
};

const taglineEl      = document.getElementById('tagline');
const promptInput    = document.getElementById('user-prompt');
const charCount      = document.getElementById('char-count');
const generateBtn    = document.getElementById('generate-btn');
const progressBar    = document.getElementById('progress-bar');
const genDetail      = document.getElementById('gen-detail');
const genPreview     = document.getElementById('gen-preview');
const resultCanvas   = document.getElementById('result-canvas');
const printBtn       = document.getElementById('print-btn');
const printStatus    = document.getElementById('print-status');
const rejectedCount  = document.getElementById('rejected-count');
const flagPercent    = document.getElementById('flag-percent');
const restartBtn     = document.getElementById('restart-btn');

// Generating counters
const gmCorpus   = document.getElementById('gm-corpus');
const gmRejected = document.getElementById('gm-rejected');
const gmDims     = document.getElementById('gm-dims');
const gmEpoch    = document.getElementById('gm-epoch');

// Split / forensic refs
const forensicBar       = document.getElementById('forensic-bar');
const splitWrap         = document.getElementById('split-wrap');
const splitSource       = document.getElementById('split-source');
const comparisonPct     = document.getElementById('comparison-pct');
const analysisOutput    = document.getElementById('analysis-output');
const analysisOutputMeta = document.getElementById('analysis-output-meta');
const analysisSourceEl  = document.getElementById('analysis-source');
const sourceOverlay     = document.getElementById('source-overlay');
const sourceOverlayId   = document.getElementById('source-overlay-id');
const sourceAuthor      = document.getElementById('source-author');
const sourceMeta        = document.getElementById('source-meta');
const sourceReason      = document.getElementById('source-reason');
const comparisonVerdict = document.getElementById('comparison-verdict');
const cbar1 = document.getElementById('cbar-1');
const cbar2 = document.getElementById('cbar-2');
const cbar3 = document.getElementById('cbar-3');
const cbar4 = document.getElementById('cbar-4');
const connLines = document.querySelectorAll('.conn-line');

// ── Visual pairs (generated ↔ source mapping) ─────────────────
const VISUAL_PAIRS = [
  {
    generated: 'images/generated-1.png',
    source: 'images/source-1.png',
    author: 'L. WEBER',
    id: 'A-2024-0418',
    year: 2024,
    reason: 'Insufficient conceptual development'
  },
  {
    generated: 'images/generated-2.png',
    source: 'images/source-2.png',
    author: 'M. KOWALSKI',
    id: 'A-2024-0291',
    year: 2024,
    reason: 'Not suitable for brand identity'
  },
  {
    generated: 'images/generated-3.png',
    source: 'images/source-3.png',
    author: 'S. NAKAMURA',
    id: 'A-2023-0876',
    year: 2023,
    reason: 'Technical execution below threshold'
  },
  {
    generated: 'images/generated-4.png',
    source: 'images/source-4.png',
    author: 'A. PETROV',
    id: 'A-2024-1102',
    year: 2024,
    reason: 'Aesthetic not aligned with programme'
  },
];

let selectedPair  = null;
let userPrompt    = '';
let dataGridInterval = null; // kept for legacy stopDataGridAnimation no-op
// pairIndex überlebt Seiten-Reloads via localStorage
// Startet bei 2 damit sofort Pair 3 & 4 dran kommen
let pairIndex = parseInt(localStorage.getItem('pairIndex') || '2');

// ── Phase transition ──────────────────────────────────────────
function showPhase(name) {
  Object.entries(phases).forEach(([k, el]) => {
    el.classList.toggle('active', k === name);
  });
}

// ── Tagline typewriter ────────────────────────────────────────
function typeText(el, text, speed, cb) {
  speed = speed || 42;
  el.textContent = '';
  let i = 0;
  const tick = () => {
    if (i < text.length) { el.textContent += text[i++]; setTimeout(tick, speed); }
    else if (cb) { cb(); }
  };
  tick();
}

// ── Tagline cycling ───────────────────────────────────────────
let taglineIdx = 0;

function cycleTagline() {
  typeText(taglineEl, TAGLINES[taglineIdx], 40, scheduleNextTagline);
}

function scheduleNextTagline() {
  setTimeout(flipToNextTagline, 2600);
}

function flipToNextTagline() {
  taglineIdx = (taglineIdx + 1) % TAGLINES.length;
  typeText(taglineEl, TAGLINES[taglineIdx], 38, scheduleNextTagline);
}

// ── Prompt input ──────────────────────────────────────────────
promptInput.addEventListener('input', () => {
  const len = promptInput.value.length;
  charCount.textContent = `${len} / 400`;
  generateBtn.disabled = len < 3;
  userPrompt = promptInput.value;
});

// ── Generate ──────────────────────────────────────────────────
generateBtn.addEventListener('click', startGenerating);

function startGenerating() {
  setState(STATE.GENERATING);

  // Select pair early so blur preview can start immediately
  selectedPair = VISUAL_PAIRS[pairIndex % VISUAL_PAIRS.length];
  pairIndex++;
  localStorage.setItem('pairIndex', pairIndex);

  showPhase('generating');
  runBlurPreview();
  runGeneratingCounters();
  runGeneratingPhase();
}

// ── Blur preview during generation ───────────────────────────
function runBlurPreview() {
  genPreview.src = selectedPair.generated;
  genPreview.style.filter = 'blur(30px) saturate(0)';

  genPreview._setProgress = (p) => {
    const blur = (30 * (1 - p)).toFixed(1);
    const sat  = p.toFixed(2);
    genPreview.style.filter = `blur(${blur}px) saturate(${sat})`;
  };
}

function stopDataGridAnimation() {
  // no-op — blur preview uses CSS transitions
}

// ── Generating counters ───────────────────────────────────────
function runGeneratingCounters() {
  const corpusTarget   = 11400 + Math.floor(Math.random() * 2000);
  const rejectedTarget = 847   + Math.floor(Math.random() * 400);
  const epochTarget    = 24    + Math.floor(Math.random() * 8);

  gmDims.textContent = '512';

  animateCounter(gmCorpus,   0, corpusTarget,   4200, (v) => v.toLocaleString());
  animateCounter(gmRejected, 0, rejectedTarget, 3600, (v) => v.toLocaleString());
  animateCounter(gmEpoch,    1, epochTarget,    5000, (v) => v.toString());
}

function animateCounter(el, from, to, duration, fmt) {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const val = Math.floor(from + (to - from) * ease);
    el.textContent = fmt(val);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── Generating phase steps ────────────────────────────────────
const GEN_STEPS = [
  [0,   "Initialising model…"],
  [6,   "Loading rejected corpus…"],
  [17,  "Scanning archived submissions…"],
  [30,  "Weighting student datasets…"],
  [44,  "Sampling latent space…"],
  [59,  "Cross-referencing portfolio archive…"],
  [72,  "Rendering visual pass 1 / 3…"],
  [83,  "Rendering visual pass 2 / 3…"],
  [92,  "Rendering visual pass 3 / 3…"],
  [98,  "Applying post-processing…"],
  [100, "Complete."],
];

function runGeneratingPhase() {
  // selectedPair already set in startGenerating()
  let stepIdx = 0;

  const advance = () => {
    if (stepIdx >= GEN_STEPS.length) {
      setTimeout(transitionToResult, 700);
      return;
    }
    const [pct, label] = GEN_STEPS[stepIdx++];
    progressBar.style.width = pct + '%';
    genDetail.textContent   = label;

    if (genPreview._setProgress) {
      genPreview._setProgress(pct / 100);
    }

    setTimeout(advance, pct < 30 ? 700 : pct < 75 ? 950 : 450);
  };
  advance();
}

// ── Transition to result ──────────────────────────────────────
function transitionToResult() {
  stopDataGridAnimation();
  setState(STATE.RESULT_READY);

  const ctx = resultCanvas.getContext('2d');
  const img = new Image();

  const approveWrap = document.querySelector('.result-approve-wrap');

  img.onload = () => {
    const maxW = Math.min(480, window.innerWidth * 0.8);
    const scale = maxW / img.width;
    resultCanvas.width  = img.width  * scale;
    resultCanvas.height = img.height * scale;
    ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    ctx.drawImage(img, 0, 0, resultCanvas.width, resultCanvas.height);

    approveWrap.classList.remove('entered');
    showPhase('result');
    setTimeout(() => resultCanvas.classList.add('visible'), 60);
    setTimeout(() => approveWrap.classList.add('entered'), 1100);
  };

  img.onerror = () => {
    resultCanvas.width  = 360;
    resultCanvas.height = 360;
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, 360, 360);
    ctx.fillStyle = '#aaa';
    ctx.font = '12px Menlo, Courier New, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[ image not found ]', 180, 185);
    ctx.textAlign = 'left';
    approveWrap.classList.remove('entered');
    showPhase('result');
    setTimeout(() => resultCanvas.classList.add('visible'), 60);
    setTimeout(() => approveWrap.classList.add('entered'), 1100);
  };

  img.src = selectedPair.generated;
}

// ── Print button ──────────────────────────────────────────────
printBtn.addEventListener('click', startPrinting);

function startPrinting() {
  setState(STATE.REVEALED);

  // Load generated image onto the split canvas
  const aCtx = analysisOutput.getContext('2d');
  const img = new Image();

  img.onload = () => {
    const maxH = Math.min(window.innerHeight * 0.60, 520);
    const scale = maxH / img.height;
    analysisOutput.width  = img.width  * scale;
    analysisOutput.height = img.height * scale;
    aCtx.clearRect(0, 0, analysisOutput.width, analysisOutput.height);
    aCtx.drawImage(img, 0, 0, analysisOutput.width, analysisOutput.height);
  };

  img.onerror = () => {
    analysisOutput.width  = 320;
    analysisOutput.height = 450;
    aCtx.fillStyle = '#e0e0e0';
    aCtx.fillRect(0, 0, 320, 450);
  };

  img.src = selectedPair.generated;

  // Load source image (hidden behind overlay until reveal)
  // Remove any previous img but keep the overlay
  const prevImg = analysisSourceEl.querySelector('img');
  if (prevImg) prevImg.remove();
  const sourceImg = document.createElement('img');
  sourceImg.src = selectedPair.source;
  sourceImg.alt = 'Source work';
  analysisSourceEl.appendChild(sourceImg);
  // Reset overlay
  if (sourceOverlay) sourceOverlay.classList.remove('hidden');
  if (sourceOverlayId) sourceOverlayId.textContent = 'ID ' + selectedPair.id;

  // Populate metadata
  analysisOutputMeta.textContent = `prompt #${1000 + Math.floor(Math.random() * 9000)} · user-generated`;
  sourceAuthor.textContent = selectedPair.author;
  sourceMeta.textContent   = `Rejected · Entrance Exam ${selectedPair.year} · ID ${selectedPair.id}`;
  sourceReason.textContent = selectedPair.reason;

  // Reset state
  comparisonPct.textContent = '—';
  forensicBar.classList.remove('visible');
  splitWrap.classList.remove('split-revealed');
  comparisonVerdict.textContent = 'Analysing…';
  comparisonVerdict.classList.remove('alert');
  connLines.forEach(l => l.classList.remove('visible'));
  printStatus.textContent = 'Printing — analysing output in real time…';
  cbar1.textContent = '—';
  cbar2.textContent = '—';
  cbar3.textContent = '—';
  cbar4.textContent = '—';

  showPhase('printing');
  setTimeout(runForensicSequence, 300);
}

// ── Forensic analysis sequence ────────────────────────────────
function runForensicSequence() {
  const finalPct = 91 + Math.floor(Math.random() * 7); // 91–97%

  // Verdict messages — spread out for dramatic pacing
  const verdictSteps = [
    [800,   'Decomposing output…'],
    [2600,  'Extracting visual features…'],
    [4800,  'Indexing colour, form, layout…'],
    [7200,  'Cross-referencing training set…'],
    [10000, 'Match candidate located.'],
    [12200, 'Aligning pixel regions…'],
  ];
  verdictSteps.forEach(([t, txt]) => {
    setTimeout(() => { comparisonVerdict.textContent = txt; }, t);
  });

  // Percentage counts up — starts after initial analysis
  setTimeout(() => {
    let p = 0;
    const tick = () => {
      p += 0.8 + Math.random() * 2.0;
      if (p >= finalPct) p = finalPct;
      comparisonPct.textContent = Math.floor(p) + '%';
      if (p < finalPct) setTimeout(tick, 55);
    };
    tick();
  }, 1800);

  // Metric values — revealed slowly
  const metrics = [
    [cbar1, 90 + Math.floor(Math.random() * 8)],
    [cbar2, 87 + Math.floor(Math.random() * 10)],
    [cbar3, 89 + Math.floor(Math.random() * 9)],
    [cbar4, 93 + Math.floor(Math.random() * 5)],
  ];
  metrics.forEach(([el, val], i) => {
    setTimeout(() => { el.textContent = val + '%'; }, 4000 + i * 1000);
  });

  // SPLIT REVEAL: trigger at 14s — give user time to read the data
  setTimeout(triggerSplitReveal, 14000);

  // Final verdict — appears after split has fully settled
  setTimeout(() => {
    comparisonVerdict.classList.add('alert');
    comparisonVerdict.textContent = '1:1 COPY OF SOURCE WORK';
    printStatus.textContent = 'Output flagged. Sending to thermal printer…';
  }, 17000);

  // Send to printer — trigger early so print starts in background
  setTimeout(sendToPrinter, 800);

  // Move to reveal — long pause so comparison is absorbed
  setTimeout(finishPrinting, 26000);
}

// ── Split reveal animation ────────────────────────────────────
function triggerSplitReveal() {
  // Show forensic bar
  forensicBar.classList.add('visible');

  // Trigger CSS split animation (left shrinks to 50%, right grows to 50%)
  splitWrap.classList.add('split-revealed');

  // After panel fully slides in: hide overlay, reveal source image
  setTimeout(() => {
    if (sourceOverlay) sourceOverlay.classList.add('hidden');
    const sourceImg = analysisSourceEl.querySelector('img');
    if (sourceImg) {
      setTimeout(() => sourceImg.classList.add('revealed'), 500);
    }
  }, 2000);

  // Draw connection lines with stagger
  connLines.forEach((line, i) => {
    setTimeout(() => line.classList.add('visible'), 1000 + i * 220);
  });
}

// ── Finish and move to text reveal ───────────────────────────
function finishPrinting() {
  const rejected = 847 + Math.floor(Math.random() * 400);
  rejectedCount.textContent = rejected.toLocaleString();
  flagPercent.textContent   = comparisonPct.textContent;
  const revealAuthor = document.getElementById('reveal-author');
  if (revealAuthor) revealAuthor.textContent = sourceAuthor.textContent;

  showPhase('reveal');
}

// ── Thermal printer request ───────────────────────────────────
async function sendToPrinter() {
  printStatus.textContent = '▶ Sending to printer…';

  try {
    const imgResponse = await fetch(selectedPair.generated);
    if (!imgResponse.ok) throw new Error('Could not load image file');
    const imageBlob = await imgResponse.blob();

    const formData = new FormData();
    formData.append('image', imageBlob, 'visual.png');
    formData.append('prompt', userPrompt);
    formData.append('sourceAuthor', selectedPair.author);
    formData.append('sourceId', selectedPair.id);
    formData.append('matchPercent', comparisonPct.textContent.replace('%', '').trim() || '0');
    formData.append('userGenerated', 'ANONYMOUS');

    const printResponse = await fetch('/api/print', { method: 'POST', body: formData });
    const result = await printResponse.json();

    if (result.success) {
      printStatus.textContent = result.printerAvailable
        ? '✓ Printed.'
        : '✓ Print simulated (no printer connected).';
    } else {
      printStatus.textContent = 'Print error: ' + result.error;
      console.error('Print error from server:', result.error);
    }
  } catch (err) {
    console.error('Print fetch error:', err);
    printStatus.textContent = 'Failed to reach printer. Check server.';
  }
}

// ── Restart ───────────────────────────────────────────────────
restartBtn.addEventListener('click', () => {
  setState(STATE.IDLE);
  progressBar.style.width = '0%';
  resultCanvas.classList.remove('visible');
  promptInput.value = '';
  charCount.textContent = '0 / 400';
  generateBtn.disabled = true;
  gmCorpus.textContent = '—';
  gmRejected.textContent = '—';
  gmDims.textContent = '—';
  gmEpoch.textContent = '—';
  genPreview.src = '';
  genPreview.style.filter = 'blur(30px) saturate(0)';
  forensicBar.classList.remove('visible');
  splitWrap.classList.remove('split-revealed');
  connLines.forEach(l => l.classList.remove('visible'));
  if (sourceOverlay) sourceOverlay.classList.remove('hidden');
  document.querySelector('.result-approve-wrap').classList.remove('entered');
  showPhase('intro');
});

// ── Theme toggle ──────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// ── Init ──────────────────────────────────────────────────────
cycleTagline();
