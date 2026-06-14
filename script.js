const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;
const STORAGE_KEY = 'pomodoro_sessions';
const SOUND_KEY = 'pomodoro_sound_enabled';

let timerInterval = null;
let secondsRemaining = WORK_MINUTES * 60;
let isRunning = false;
let mode = 'work';
let soundEnabled = localStorage.getItem(SOUND_KEY) !== 'false';

const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const soundBtn = document.getElementById('sound-btn');
const modeLabel = document.getElementById('mode-label');

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function updateDisplay() {
  timerEl.textContent = formatTime(secondsRemaining);
  modeLabel.textContent = mode === 'work' ? 'Focus session' : 'Break';
  document.title = `${formatTime(secondsRemaining)} · Pomodoro`;
}

function playSound() {
  if (!soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

function recordSession() {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  sessions.push({
    completedAt: new Date().toISOString(),
    durationMinutes: WORK_MINUTES,
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  renderStats();
}

function startTimer() {
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.textContent = 'Resume';
    return;
  }
  isRunning = true;
  startBtn.textContent = 'Pause';
  timerInterval = setInterval(() => {
    secondsRemaining--;
    updateDisplay();
    if (secondsRemaining <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      playSound();
      if (mode === 'work') {
        recordSession();
        mode = 'break';
        secondsRemaining = BREAK_MINUTES * 60;
      } else {
        mode = 'work';
        secondsRemaining = WORK_MINUTES * 60;
      }
      startBtn.textContent = 'Start';
      updateDisplay();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  mode = 'work';
  secondsRemaining = WORK_MINUTES * 60;
  startBtn.textContent = 'Start';
  updateDisplay();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, soundEnabled);
  soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
}

function dateKey(d) {
  return d.toISOString().split('T')[0];
}

function renderStats() {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const today = dateKey(new Date());
  const todaySessions = sessions.filter(s => dateKey(new Date(s.completedAt)) === today);
  
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const weekSessions = sessions.filter(s => new Date(s.completedAt) >= weekAgo);
  
  const todayMin = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const weekMin = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  
  document.getElementById('today-time').textContent = `${todayMin}m`;
  document.getElementById('week-time').textContent = `${weekMin}m`;
  document.getElementById('today-sessions').textContent = todaySessions.length;
  document.getElementById('streak').textContent = calculateStreak(sessions);
  
  renderChart(sessions);
}

function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;
  const dates = new Set(sessions.map(s => dateKey(new Date(s.completedAt))));
  let streak = 0;
  let day = new Date();
  while (dates.has(dateKey(day))) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

function renderChart(sessions) {
  const chart = document.getElementById('chart');
  chart.innerHTML = '';
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const dayMin = sessions
      .filter(s => dateKey(new Date(s.completedAt)) === key)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    days.push(dayMin);
  }
  const max = Math.max(...days, 25);
  days.forEach(min => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = `${(min / max) * 100}%`;
    bar.title = `${min} minutes`;
    if (min === 0) bar.dataset.empty = 'true';
    chart.appendChild(bar);
  });
}

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);
soundBtn.addEventListener('click', toggleSound);

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.code === 'Space') {
    e.preventDefault();
    startTimer();
  } else if (e.code === 'KeyR') {
    resetTimer();
  }
});

soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
updateDisplay();
renderStats();
