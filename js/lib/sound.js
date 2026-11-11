/** Small synthesized sound effects (no audio files). Off by default; the choice is remembered. */
import { load, save } from './storage.js';

let ctx = null;
export const isOn = () => load('sound', false);
export function setOn(on) { save('sound', !!on); if (on) play('hint'); }

function tone(freq, start, dur, type = 'sine', gain = 0.12) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + dur + 0.05);
}

export function play(kind) {
  if (!isOn()) return;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    if (kind === 'win') { [392, 494, 587, 784].forEach((f, i) => tone(f, i * 0.09, 0.5, 'triangle')); }
    else if (kind === 'lose') { tone(196, 0, 0.6, 'sawtooth', 0.06); tone(147, 0.18, 0.8, 'sawtooth', 0.06); }
    else if (kind === 'wrong') { tone(150, 0, 0.25, 'square', 0.05); }
    else if (kind === 'hint') { tone(880, 0, 0.35, 'sine', 0.06); tone(1318, 0.06, 0.4, 'sine', 0.04); }
  } catch { /* audio unavailable */ }
}
