/* ══════════════════════════════════════════════════════════════
   INSTALLATION – "Submit Early"
   Phase flow: INTRO → GENERATING → RESULT → PRINTING → REVEAL
   ══════════════════════════════════════════════════════════════ */

// ── Tagline ──────────────────────────────────────────────────
const TAGLINES = [
  "Ready when you are.",
];

// ── DOM refs ─────────────────────────────────────────────────
const phases = {
  intro:      document.getElementById('phase-intro'),
  generating: document.getElementById('phase-generating'),
  result:     document.getElementById('phase-result'),
  printing:   document.getElementById('phase-printing'),
  reveal:     document.getElementById('phase-reveal'),
};

const taglineEl    = document.getElementById('tagline');
const promptInput  = document.getElementById('user-prompt');
const charCount    = document.getElementById('char-count');
const generateBtn  = document.getElementById('generate-btn');
const progressBar  = document.getElementById('progress-bar');
const genDetail    = document.getElementById('gen-detail');
const genCanvas    = document.getElementById('gen-canvas');
const resultCanvas = document.getElementById('result-canvas');
const sampleCount  = document.getElementById('sample-count');
const similarityVal= document.getElementById('similarity-val');
const promptEcho   = document.getElementById('prompt-echo');
const printBtn     = document.getElementById('print-btn');
const printStatus  = document.getElementById('print-status');
const rejectedCount= document.getElementById('rejected-count');
const flagPercent  = document.getElementById('flag-percent');
const restartBtn   = document.getElementById('restart-btn');

// Analysis refs
const analysisOutput   = document.getElementById('analysis-output');
const analysisOutputMeta = document.getElementById('analysis-output-meta');
const comparisonPct    = document.getElementById('comparison-pct');
const cbar1 = document.getElementById('cbar-1');
const cbar2 = document.getElementById('cbar-2');
const cbar3 = document.getElementById('cbar-3');
const cbar4 = document.getElementById('cbar-4');
const comparisonVerdict = document.getElementById('comparison-verdict');
const sourceAuthor = document.getElementById('source-author');
const sourceMeta   = document.getElementById('source-meta');



// ── Generated visuals with their sources ──────────────────────
const VISUAL_PAIRS = [
  { 
    generated: 'images/generated-1.png',
    source: 'images/source-1.png',
    author: 'L. WEBER',
    id: 'A-2024-0418',
    year: 2024
  },
  { 
    generated: 'images/generated-2.png',
    source: 'images/source-2.png',
    author: 'M. KOWALSKI',
    id: 'A-2024-0291',
    year: 2024
  },
  { 
    generated: 'images/generated-3.png',
    source: 'images/source-3.png',
    author: 'S. NAKAMURA',
    id: 'A-2023-0876',
    year: 2023
  },
  { 
    generated: 'images/generated-4.png',
    source: 'images/source-4.png',
    author: 'A. PETROV',
    id: 'A-2024-1102',
    year: 2024
  },
];

// ── State ────────────────────────────────────────────────────
let currentPhase = 'intro';
let taglineIndex  = 0;
let taglineTimer  = null;
let userPrompt    = '';
let selectedPair  = null;

// ── Phase transition ─────────────────────────────────────────
function showPhase(name) {
  Object.entries(phases).forEach(([k, el]) => {
    el.classList.toggle('active', k === name);
  });
  currentPhase = name;
}

// ── Tagline typewriter ───────────────────────────────────────
function typeText(el, text, speed = 42, cb) {
  el.textContent = '';
  let i = 0;
  const tick = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(tick, speed);
    } else if (cb) {
      cb();
    }
  };
  tick();
}

function cycleTagline() {
  typeText(taglineEl, TAGLINES[0], 40);
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
  clearTimeout(taglineTimer);
  showPhase('generating');
  runGeneratingPhase();
}

// ── Generating phase ──────────────────────────────────────────
const GEN_STEPS = [
  [0,   "Initialising model…"],
  [8,   "Loading training corpus…"],
  [20,  "Analysing prompt semantics…"],
  [35,  "Sampling latent space…"],
  [52,  "Rendering pass 1 / 3…"],
  [68,  "Rendering pass 2 / 3…"],
  [82,  "Rendering pass 3 / 3…"],
  [93,  "Applying post-processing…"],
  [100, "Complete."],
];

function runGeneratingPhase() {
  const size = 360;
  genCanvas.width  = size;
  genCanvas.height = size;
  genCanvas.classList.remove('visible');

  let stepIdx = 0;

  const advance = () => {
    if (stepIdx >= GEN_STEPS.length) {
      // generation done – copy to result canvas and move on
      setTimeout(transitionToResult, 600);
      return;
    }
    const [pct, label] = GEN_STEPS[stepIdx++];
    progressBar.style.width = pct + '%';
    genDetail.textContent   = label;

    if (pct >= 50 && !genCanvas.classList.contains('visible')) {
      drawGeneratedVisual(genCanvas);
      genCanvas.classList.add('visible');
    }
    setTimeout(advance, pct < 35 ? 600 : pct < 80 ? 900 : 400);
  };
  advance();
}

// ── Canvas visual – load actual image ────────────────────────
function drawGeneratedVisual(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  
  // Wähle zufälliges Visual-Pair aus dem Pool
  selectedPair = VISUAL_PAIRS[Math.floor(Math.random() * VISUAL_PAIRS.length)];
  
  // Lade und zeichne das Bild
  const img = new Image();
  img.onload = () => {
    // Passe Canvas an Bild-Proportionen an (max 360px breit)
    const maxSize = 360;
    const aspectRatio = img.height / img.width;
    canvas.width = maxSize;
    canvas.height = maxSize * aspectRatio;
    
    // Zeichne Bild in voller Größe (ohne Zoom/Crop)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Starte Blur-Animation (unscharf → scharf)
    animateSharpening(canvas);
  };
  
  img.onerror = () => {
    // Fallback: Platzhalter wenn Bild nicht lädt
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);
    ctx.font = '12px Menlo, Courier New, monospace';
    ctx.fillStyle = '#444';
    ctx.textAlign = 'center';
    ctx.fillText('[ image not found ]', w / 2, h / 2);
    ctx.textAlign = 'left';
  };
  
  img.src = selectedPair.generated;
}

// ── Blur Animation (wird graduell schärfer) ──────────────────
function animateSharpening(canvas) {
  let blur = 20; // Start mit starkem Blur
  let startTime = null;
  const blurDuration = 3000; // 3 Sekunden blurry bleiben
  const sharpenDuration = 800; // 0.8 Sekunden schnell schärfen am Ende
  const totalDuration = blurDuration + sharpenDuration;
  
  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    
    if (elapsed < blurDuration) {
      // Bleib stark blurry während der Generation
      blur = 20;
    } else {
      // Schärfe am Ende schnell
      const sharpenProgress = (elapsed - blurDuration) / sharpenDuration;
      blur = 20 * (1 - sharpenProgress);
      if (blur < 0) blur = 0;
    }
    
    canvas.style.filter = `blur(${blur}px)`;
    
    if (elapsed < totalDuration) {
      requestAnimationFrame(step);
    }
  };
  requestAnimationFrame(step);
}

// ── Transition to result ──────────────────────────────────────
function transitionToResult() {
  const ctx = resultCanvas.getContext('2d');
  
  const img = new Image();
  img.onload = () => {
    // Passe Canvas an Bild-Proportionen an
    const maxSize = 360;
    const aspectRatio = img.height / img.width;
    resultCanvas.width = maxSize;
    resultCanvas.height = maxSize * aspectRatio;
    
    // Zeichne Bild in voller Größe
    ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    ctx.drawImage(img, 0, 0, resultCanvas.width, resultCanvas.height);
  };
  
  img.onerror = () => {
    // Fallback
    ctx.fillStyle = '#d4d4d4';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#888';
    ctx.font = '20px Menlo, Courier New, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[ generated image ]', size / 2, size / 2);
    ctx.textAlign = 'left';
  };
  
  img.src = selectedPair.generated;

  // Fake metadata
  const samples    = 7000 + Math.floor(Math.random() * 5000);
  const similarity = (74 + Math.floor(Math.random() * 20));
  sampleCount.textContent  = samples.toLocaleString();
  similarityVal.textContent = similarity + '%';
  promptEcho.textContent   = userPrompt.length > 60 ? userPrompt.slice(0, 60) + '…' : userPrompt;

  showPhase('result');
}

// ── Print ─────────────────────────────────────────────────────
printBtn.addEventListener('click', startPrinting);

function startPrinting() {
  // Load generated image onto analysis canvas
  const aCtx = analysisOutput.getContext('2d');
  const img = new Image();
  img.onload = () => {
    // Passe Canvas an Bild-Proportionen an
    const maxSize = 440;
    const aspectRatio = img.height / img.width;
    analysisOutput.width = maxSize;
    analysisOutput.height = maxSize * aspectRatio;
    
    aCtx.clearRect(0, 0, analysisOutput.width, analysisOutput.height);
    aCtx.drawImage(img, 0, 0, analysisOutput.width, analysisOutput.height);
  };
  
  img.onerror = () => {
    aCtx.fillStyle = '#d4d4d4';
    aCtx.fillRect(0, 0, 440, 440);
    aCtx.fillStyle = '#888';
    aCtx.font = '12px Menlo, Courier New, monospace';
    aCtx.textAlign = 'center';
    aCtx.fillText('[ generated image ]', 220, 220);
    aCtx.textAlign = 'left';
  };
  
  img.src = selectedPair.generated;

  // Verwende die passende Source aus dem Pair
  sourceAuthor.textContent = selectedPair.author;
  sourceMeta.textContent   = `submission ${selectedPair.id} · rejected · entrance exam ${selectedPair.year}`;
  analysisOutputMeta.textContent = `prompt #${1000 + Math.floor(Math.random() * 9000)} · user-generated`;
  
  // Lade Source-Bild (passend zum generierten Bild) als IMG Element
  const analysisSourceEl = document.getElementById('analysis-source');
  if (analysisSourceEl) {
    analysisSourceEl.innerHTML = ''; // Clear previous content
    const sourceImg = document.createElement('img');
    sourceImg.src = selectedPair.source;
    sourceImg.style.width = '100%';
    sourceImg.style.height = '100%';
    sourceImg.style.objectFit = 'contain';
    sourceImg.style.objectPosition = 'center';
    sourceImg.style.display = 'block';
    analysisSourceEl.appendChild(sourceImg);
  }

  // Reset analysis state
  comparisonPct.textContent = '0%';
  comparisonPct.style.color = '';
  cbar1.textContent = '—';
  cbar2.textContent = '—';
  cbar3.textContent = '—';
  cbar4.textContent = '—';
  comparisonVerdict.classList.remove('alert');
  comparisonVerdict.textContent = 'Searching training set…';
  printStatus.textContent = 'Printing — analysing output in real time…';

  showPhase('printing');

  setTimeout(runAnalysisSequence, 300);
}

function runAnalysisSequence() {
  const finalPct = 94 + Math.floor(Math.random() * 5); // 94–98 %

  // Step-by-step verdict messages that reference the *generated* visual
  const verdictSteps = [
    [600,   'Decomposing generated image…'],
    [1400,  'Extracting visual features…'],
    [2200,  'Indexing colour, form, layout…'],
    [3000,  'Cross-referencing training set…'],
    [3800,  'Match candidate located.'],
    [4400,  'Aligning pixel regions…'],
  ];
  verdictSteps.forEach(([t, txt]) => {
    setTimeout(() => { comparisonVerdict.textContent = txt; }, t);
  });

  // Percentage counts up
  setTimeout(() => {
    let p = 0;
    const tick = () => {
      p += 1 + Math.random() * 2;
      if (p >= finalPct) { p = finalPct; }
      comparisonPct.textContent = Math.floor(p) + '%';
      if (p < finalPct) {
        setTimeout(tick, 40);
      }
    };
    tick();
  }, 700);

  // Individual metric values fill in
  const metrics = [
    [cbar1, 92 + Math.floor(Math.random() * 6)],
    [cbar2, 88 + Math.floor(Math.random() * 10)],
    [cbar3, 90 + Math.floor(Math.random() * 8)],
    [cbar4, 95 + Math.floor(Math.random() * 4)],
  ];
  metrics.forEach(([el, val], i) => {
    setTimeout(() => { el.textContent = val + '%'; }, 1200 + i * 500);
  });

  // Final verdict – 1:1 copy
  setTimeout(() => {
    comparisonVerdict.classList.add('alert');
    comparisonVerdict.textContent = '1:1 COPY OF SOURCE WORK';
    comparisonPct.style.color = '#c0392b';
    printStatus.textContent = 'Output flagged. Sending to thermal printer…';
  }, 5200);

  // Sende an Thermodrucker
  setTimeout(() => {
    sendToPrinter();
  }, 6000);

  // Move to reveal
  setTimeout(() => {
    finishPrinting();
  }, 8000);
}

function finishPrinting() {
  // Populate reveal data
  const rejected = 847 + Math.floor(Math.random() * 400);
  rejectedCount.textContent = rejected.toLocaleString();
  flagPercent.textContent   = comparisonPct.textContent;
  const revealAuthor = document.getElementById('reveal-author');
  if (revealAuthor) revealAuthor.textContent = sourceAuthor.textContent;

  showPhase('reveal');
}

// ── Drucken ──────────────────────────────────────────────────
async function sendToPrinter() {
  printStatus.textContent = 'Sending to printer…';

  try {
    const imgResponse = await fetch(selectedPair.generated);
    if (!imgResponse.ok) throw new Error('Could not load image file');
    const imageBlob = await imgResponse.blob();

    const formData = new FormData();
    formData.append('image', imageBlob, 'visual.png');
    formData.append('prompt', userPrompt);
    formData.append('sourceAuthor', selectedPair.author);
    formData.append('sourceId', selectedPair.id);
    formData.append('matchPercent', comparisonPct.textContent.replace('%', ''));
    formData.append('userGenerated', 'ANONYMOUS');

    const printResponse = await fetch('/api/print', {
      method: 'POST',
      body: formData
    });

    const result = await printResponse.json();

    if (result.success) {
      printStatus.textContent = result.printerAvailable
        ? 'Printed successfully.'
        : 'Print simulated (no printer connected).';
    } else {
      printStatus.textContent = 'Print error: ' + result.error;
    }
  } catch (err) {
    console.error('Print error:', err);
    printStatus.textContent = 'Failed to send to printer.';
  }
}

// ── Restart ───────────────────────────────────────────────────
restartBtn.addEventListener('click', () => {
  progressBar.style.width = '0%';
  genCanvas.classList.remove('visible');
  genCanvas.style.filter = 'none'; // Reset blur
  promptInput.value = '';
  charCount.textContent = '0 / 400';
  generateBtn.disabled = true;
  showPhase('intro');
});

// ── Init ──────────────────────────────────────────────────────
cycleTagline();
