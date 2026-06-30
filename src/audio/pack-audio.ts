/*
 * Synthetic audio for the pack-opening ritual — Web Audio API, no asset files.
 * All functions are no-ops in SSR or when AudioContext is unavailable.
 */

let audioCtx: AudioContext | null = null;
let tickTimer: ReturnType<typeof setInterval> | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new window.AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

// Short bandpass-filtered noise burst — mechanical escapement click.
function singleTick(): void {
  const ac = getCtx();
  if (!ac) return;
  const len = Math.floor(ac.sampleRate * 0.022);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.08));
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  const bpf = ac.createBiquadFilter();
  bpf.type = "bandpass";
  bpf.frequency.value = 3200;
  bpf.Q.value = 4;
  const gain = ac.createGain();
  gain.gain.value = 0.22;
  src.connect(bpf);
  bpf.connect(gain);
  gain.connect(ac.destination);
  src.start();
}

export function initPackAudio(): void {
  const ac = getCtx();
  if (ac?.state === "suspended") ac.resume().catch(() => null);
}

export function startTicking(bpm: number): void {
  stopTicking();
  singleTick();
  tickTimer = setInterval(singleTick, 60_000 / bpm);
}

export function stopTicking(): void {
  if (tickTimer !== null) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

export function accelerateTicking(targetBpm: number): void {
  stopTicking();
  let bpm = 80;
  const step = (): void => {
    singleTick();
    if (bpm >= targetBpm) {
      startTicking(targetBpm);
      return;
    }
    bpm = Math.min(bpm + 10, targetBpm);
    setTimeout(step, 60_000 / bpm);
  };
  step();
}

// Short descending sine — card flip whoosh.
export function playCardFlip(): void {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(680, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(110, ac.currentTime + 0.16);
  gain.gain.setValueAtTime(0.07, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.2);
}

// Ascending chord — pitch and richness scale with rarity tier.
const REVEAL_FREQS: Partial<Record<string, number[]>> = {
  ebauche: [220],
  emergence: [261, 329],
  maitrise: [329, 415, 523],
  virtuosite: [415, 523, 659, 784],
  "grande-oeuvre": [523, 659, 784, 1047],
  "opus-aeternum": [523, 659, 784, 1047, 1319],
};

export function playRarityReveal(rarity: string): void {
  const ac = getCtx();
  if (!ac) return;
  const freqs = REVEAL_FREQS[rarity] ?? [220];
  const now = ac.currentTime;
  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + i * 0.075;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.055, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    osc.start(t);
    osc.stop(t + 0.7);
  });
}
