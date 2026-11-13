import { music } from './music.js';
let context;
let master;
let ambience;
let speechTimer;
let recording;
let extraLines = [];
fetch(new URL('./station-recordings.json', import.meta.url), {cache:'no-cache'}).then(r=>r.json()).then(lines=>{extraLines=lines;}).catch(()=>{});
let voiceLines = [];
fetch(new URL('./voice-lines.json?v=supplied-v1', import.meta.url)).then(response => response.json()).then(lines => { voiceLines = lines; }).catch(() => {});
let enabled = true;
try { enabled = localStorage.getItem('neilo-audio') !== 'off'; } catch {}

function cue(kind = 'tap') {
  if (!enabled || !context || context.state !== 'running') return;
  const tones = { tap: [560, .07], step: [120, .045], discover: [880, .2], success: [1046, .3], warning: [290, .16], radio: [740, .12] };
  const [frequency, duration] = tones[kind] || tones.tap;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = kind === 'step' ? 'triangle' : 'sine';
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * (kind === 'success' ? 1.5 : .8), context.currentTime + duration);
  gain.gain.setValueAtTime(.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(kind === 'step' ? .035 : .11, context.currentTime + .01);
  gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
  oscillator.connect(gain).connect(master);
  oscillator.start();
  oscillator.stop(context.currentTime + duration + .02);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
}

async function unlock() {
  try {
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = enabled ? .55 : 0;
      master.connect(context.destination);
      music.start(context, master);
      ambience = context.createGain();
      ambience.gain.value = .009;
      ambience.connect(master);
      for (const frequency of [55, 82.4]) {
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.connect(ambience);
        oscillator.start();
      }
    }
    if (enabled) await context.resume();
  } catch { /* Captions and visual cues remain available. */ }
}

function stopVoice() {
  clearTimeout(speechTimer);
  recording?.pause();
  recording = null;
  music.duck(false);
  window.speechSynthesis?.cancel();
}

function say(text, speaker = 'neilo') {
  stopVoice();
  if (!enabled || document.hidden) return;
  const recordedLine = voiceLines.find(line => line.text === text) || extraLines.find(line => line.text === text);
  if (recordedLine) {
    recording = new Audio(new URL(recordedLine.audio || `./assets/audio/${recordedLine.id}.mp3`, import.meta.url).href);
    music.duck(true);
    recording.onended = () => music.duck(false);
    recording.play().catch(() => speakSynthetic(text, speaker));
    return;
  }
  speakSynthetic(text, speaker);
}
function speakSynthetic(text, speaker) {
  if (!enabled || !window.speechSynthesis || !window.SpeechSynthesisUtterance || document.hidden) return;
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en'));
  utterance.voice = voices.find(voice => /Google US English|Microsoft.*(David|Guy)|English.*United States/i.test(voice.name)) || voices[0] || null;
  utterance.onstart = () => music.duck(true);
  utterance.onend = utterance.onerror = () => music.duck(false);
  utterance.lang = 'en-US';
  utterance.rate = speaker === 'neilo' ? .94 : .9;
  utterance.pitch = speaker === 'neilo' ? 1.12 : .9;
  utterance.volume = .9;
  speechTimer = setTimeout(() => { if (enabled && !document.hidden) speechSynthesis.speak(utterance); }, 70);
}

function toggle() {
  enabled = !enabled;
  try { localStorage.setItem('neilo-audio', enabled ? 'on' : 'off'); } catch {}
  if (master) master.gain.value = enabled ? .55 : 0;
  if (!enabled) stopVoice(); else unlock();
  return enabled;
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopVoice(); context?.suspend(); }
  else if (enabled && context) context.resume().catch(() => {});
});
export const audio = { unlock, cue, say, stopVoice, toggle, music, get enabled() { return enabled; }, get status() { return { enabled, context:context?.state || 'not-started', recordedLines:voiceLines.length }; } };
