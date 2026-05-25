// قوالب جاهزة للتطبيقات الشائعة - تستخدم كـ fallback أو للعرض السريع

export interface Template {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  icon: string;
  category: string;
  code: string;
}

const htmlWrapper = (title: string, body: string, styles = "", scripts = "") => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
  * { font-family: 'Cairo', sans-serif; }
  body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
  ${styles}
</style>
</head>
<body>
${body}
<script>
${scripts}
<\/script>
</body>
</html>`;

export const templates: Template[] = [
  {
    id: "calculator",
    name: "Calculator",
    nameAr: "آلة حاسبة",
    description: "آلة حاسبة علمية احترافية",
    icon: "🧮",
    category: "أدوات",
    code: htmlWrapper("آلة حاسبة", `
<div class="min-h-screen flex items-center justify-center p-4">
  <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 w-full max-w-sm">
    <h1 class="text-white text-2xl font-bold mb-4 text-center">🧮 آلة حاسبة</h1>
    <div id="display" class="bg-black/40 text-white text-4xl font-bold p-6 rounded-2xl text-left mb-4 min-h-[100px] flex items-center justify-end overflow-hidden">0</div>
    <div class="grid grid-cols-4 gap-3" id="buttons"></div>
  </div>
</div>`, `
button { transition: all 0.15s; }
button:active { transform: scale(0.95); }
`, `
const display = document.getElementById('display');
const buttonsContainer = document.getElementById('buttons');
let current = '0';
let previous = '';
let operator = '';

const buttons = [
  'C', '±', '%', '÷',
  '7', '8', '9', '×',
  '4', '5', '6', '-',
  '1', '2', '3', '+',
  '0', '.', '⌫', '='
];

buttons.forEach(btn => {
  const b = document.createElement('button');
  b.textContent = btn;
  b.className = 'h-16 rounded-2xl text-xl font-bold text-white ' + 
    (['÷', '×', '-', '+', '='].includes(btn) ? 'bg-orange-500 hover:bg-orange-600' :
     ['C', '±', '%', '⌫'].includes(btn) ? 'bg-white/20 hover:bg-white/30' :
     'bg-white/10 hover:bg-white/20');
  b.onclick = () => handle(btn);
  buttonsContainer.appendChild(b);
});

function handle(btn) {
  if (btn === 'C') { current = '0'; previous = ''; operator = ''; }
  else if (btn === '⌫') { current = current.length > 1 ? current.slice(0, -1) : '0'; }
  else if (btn === '±') { current = current.startsWith('-') ? current.slice(1) : '-' + current; }
  else if (['+', '-', '×', '÷'].includes(btn)) {
    if (previous && operator) calculate();
    previous = current;
    operator = btn;
    current = '0';
  } else if (btn === '=') {
    calculate();
    operator = '';
    previous = '';
  } else if (btn === '%') {
    current = String(parseFloat(current) / 100);
  } else {
    if (btn === '.' && current.includes('.')) return;
    current = current === '0' && btn !== '.' ? btn : current + btn;
  }
  display.textContent = current;
}

function calculate() {
  const a = parseFloat(previous);
  const b = parseFloat(current);
  let r = 0;
  if (operator === '+') r = a + b;
  else if (operator === '-') r = a - b;
  else if (operator === '×') r = a * b;
  else if (operator === '÷') r = b !== 0 ? a / b : 0;
  current = String(r);
}
`)
  },
  {
    id: "todo",
    name: "Todo List",
    nameAr: "قائمة المهام",
    description: "تطبيق إدارة المهام اليومية",
    icon: "✅",
    category: "إنتاجية",
    code: htmlWrapper("قائمة المهام", `
<div class="min-h-screen p-4 md:p-8">
  <div class="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
    <h1 class="text-white text-4xl font-bold mb-2">✅ قائمة مهامي</h1>
    <p class="text-white/70 mb-6" id="stats">0 مهمة</p>
    <div class="flex gap-2 mb-6">
      <input id="input" type="text" placeholder="أضف مهمة جديدة..." class="flex-1 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50">
      <button id="addBtn" class="px-6 py-3 bg-white text-purple-700 font-bold rounded-2xl hover:bg-white/90 transition">إضافة</button>
    </div>
    <div class="flex gap-2 mb-4">
      <button data-filter="all" class="filter-btn px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold">الكل</button>
      <button data-filter="active" class="filter-btn px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold">نشطة</button>
      <button data-filter="done" class="filter-btn px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold">مكتملة</button>
    </div>
    <div id="list" class="space-y-2"></div>
  </div>
</div>`, `
.todo-item { animation: slideIn 0.3s ease; }
@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
`, `
let todos = [];
let filter = 'all';
const list = document.getElementById('list');
const input = document.getElementById('input');
const stats = document.getElementById('stats');

function render() {
  const filtered = todos.filter(t => filter === 'all' ? true : filter === 'done' ? t.done : !t.done);
  list.innerHTML = filtered.length === 0 ? '<p class="text-white/50 text-center py-8">لا توجد مهام</p>' :
    filtered.map(t => \`
      <div class="todo-item flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/10">
        <input type="checkbox" \${t.done ? 'checked' : ''} onchange="toggle('\${t.id}')" class="w-6 h-6 accent-pink-500 cursor-pointer">
        <span class="flex-1 text-white \${t.done ? 'line-through opacity-50' : ''}">\${t.text}</span>
        <button onclick="remove('\${t.id}')" class="text-red-400 hover:text-red-300 text-xl">🗑️</button>
      </div>
    \`).join('');
  const done = todos.filter(t => t.done).length;
  stats.textContent = \`\${todos.length} مهمة - \${done} مكتملة\`;
}

function add() {
  const text = input.value.trim();
  if (!text) return;
  todos.unshift({ id: Date.now().toString(), text, done: false });
  input.value = '';
  render();
}

window.toggle = (id) => { todos = todos.map(t => t.id === id ? {...t, done: !t.done} : t); render(); };
window.remove = (id) => { todos = todos.filter(t => t.id !== id); render(); };

document.getElementById('addBtn').onclick = add;
input.onkeypress = (e) => e.key === 'Enter' && add();
document.querySelectorAll('.filter-btn').forEach(b => b.onclick = (e) => {
  document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('bg-white/20'));
  e.target.classList.add('bg-white/20');
  filter = e.target.dataset.filter;
  render();
});
render();
`)
  },
  {
    id: "snake",
    name: "Snake Game",
    nameAr: "لعبة الثعبان",
    description: "لعبة الثعبان الكلاسيكية",
    icon: "🐍",
    category: "ألعاب",
    code: htmlWrapper("لعبة الثعبان", `
<div class="min-h-screen flex items-center justify-center p-4">
  <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-white text-3xl font-bold">🐍 لعبة الثعبان</h1>
      <div class="text-white text-xl font-bold">النقاط: <span id="score">0</span></div>
    </div>
    <canvas id="game" width="400" height="400" class="rounded-2xl bg-black/40 border-2 border-white/20"></canvas>
    <p class="text-white/70 text-center mt-4">استخدم الأسهم أو WASD للتحكم</p>
    <button id="restart" class="w-full mt-4 px-6 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition">إعادة البدء</button>
  </div>
</div>`, ``, `
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const grid = 20;
let snake = [{x: 10, y: 10}];
let dir = {x: 0, y: 0};
let food = {x: 15, y: 15};
let score = 0;
let gameOver = false;

function placeFood() {
  food = { x: Math.floor(Math.random() * grid), y: Math.floor(Math.random() * grid) };
}

function draw() {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Snake
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? '#10b981' : '#34d399';
    ctx.fillRect(s.x * 20 + 1, s.y * 20 + 1, 18, 18);
  });
  
  // Food
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(food.x * 20 + 10, food.y * 20 + 10, 8, 0, Math.PI * 2);
  ctx.fill();
}

function update() {
  if (gameOver) return;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  
  if (head.x < 0 || head.x >= grid || head.y < 0 || head.y >= grid ||
      snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver = true;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Cairo';
    ctx.textAlign = 'center';
    ctx.fillText('انتهت اللعبة!', canvas.width/2, canvas.height/2);
    return;
  }
  
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    document.getElementById('score').textContent = score;
    placeFood();
  } else {
    snake.pop();
  }
}

document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if ((k === 'arrowup' || k === 'w') && dir.y !== 1) dir = {x: 0, y: -1};
  if ((k === 'arrowdown' || k === 's') && dir.y !== -1) dir = {x: 0, y: 1};
  if ((k === 'arrowleft' || k === 'a') && dir.x !== 1) dir = {x: -1, y: 0};
  if ((k === 'arrowright' || k === 'd') && dir.x !== -1) dir = {x: 1, y: 0};
});

document.getElementById('restart').onclick = () => {
  snake = [{x: 10, y: 10}];
  dir = {x: 0, y: 0};
  score = 0;
  gameOver = false;
  document.getElementById('score').textContent = 0;
  placeFood();
};

setInterval(() => { update(); draw(); }, 120);
`)
  },
  {
    id: "weather",
    name: "Weather",
    nameAr: "حالة الطقس",
    icon: "⛅",
    description: "تطبيق الطقس بتصميم جميل",
    category: "طقس",
    code: htmlWrapper("الطقس", `
<div class="min-h-screen flex items-center justify-center p-4">
  <div class="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 w-full max-w-md">
    <h1 class="text-white text-3xl font-bold mb-6 text-center">⛅ حالة الطقس</h1>
    <input id="city" type="text" placeholder="ابحث عن مدينة..." class="w-full px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none mb-4" value="الرياض">
    <button id="search" class="w-full py-3 bg-white text-purple-700 font-bold rounded-2xl hover:bg-white/90 mb-6">بحث</button>
    <div id="result" class="text-center text-white"></div>
  </div>
</div>`, ``, `
const cities = {
  'الرياض': { temp: 32, condition: 'صافي', humidity: 25, icon: '☀️' },
  'جدة': { temp: 29, condition: 'غائم جزئياً', humidity: 65, icon: '⛅' },
  'القاهرة': { temp: 26, condition: 'مشمس', humidity: 45, icon: '☀️' },
  'دبي': { temp: 35, condition: 'حار', humidity: 30, icon: '🌞' },
  'لندن': { temp: 15, condition: 'ممطر', humidity: 80, icon: '🌧️' },
  'نيويورك': { temp: 18, condition: 'غائم', humidity: 60, icon: '☁️' },
  'باريس': { temp: 16, condition: 'مشمس', humidity: 50, icon: '⛅' },
  'طوكيو': { temp: 22, condition: 'صافي', humidity: 55, icon: '☀️' },
};

function search() {
  const city = document.getElementById('city').value.trim();
  const data = cities[city];
  const result = document.getElementById('result');
  if (!data) {
    result.innerHTML = '<p class="text-red-300">المدينة غير موجودة. جرب: الرياض، جدة، القاهرة، دبي، لندن</p>';
    return;
  }
  result.innerHTML = \`
    <div class="text-8xl mb-4">\${data.icon}</div>
    <h2 class="text-4xl font-bold mb-2">\${city}</h2>
    <p class="text-6xl font-bold mb-4">\${data.temp}°</p>
    <p class="text-xl mb-6">\${data.condition}</p>
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white/10 rounded-2xl p-4">
        <p class="text-white/70 text-sm">الرطوبة</p>
        <p class="text-2xl font-bold">\${data.humidity}%</p>
      </div>
      <div class="bg-white/10 rounded-2xl p-4">
        <p class="text-white/70 text-sm">الرياح</p>
        <p class="text-2xl font-bold">\${Math.floor(Math.random()*30)} km/h</p>
      </div>
    </div>
  \`;
}

document.getElementById('search').onclick = search;
document.getElementById('city').onkeypress = (e) => e.key === 'Enter' && search();
search();
`)
  },
  {
    id: "quiz",
    name: "Quiz",
    nameAr: "اختبار ثقافي",
    icon: "🧠",
    description: "اختبار ثقافي تفاعلي",
    category: "تعليم",
    code: htmlWrapper("اختبار ثقافي", `
<div class="min-h-screen flex items-center justify-center p-4">
  <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 w-full max-w-2xl">
    <h1 class="text-white text-4xl font-bold mb-2 text-center">🧠 اختبار ثقافي</h1>
    <p class="text-white/70 text-center mb-6">اختبر معلوماتك العامة</p>
    <div id="quiz"></div>
  </div>
</div>`, ``, `
const questions = [
  { q: 'ما هي عاصمة فرنسا؟', options: ['لندن', 'باريس', 'برلين', 'مدريد'], answer: 1 },
  { q: 'كم عدد كواكب المجموعة الشمسية؟', options: ['7', '8', '9', '10'], answer: 1 },
  { q: 'من هو مخترع المصباح الكهربائي؟', options: ['نيوتن', 'أينشتاين', 'أديسون', 'تسلا'], answer: 2 },
  { q: 'ما هي أكبر قارة في العالم؟', options: ['أفريقيا', 'أوروبا', 'آسيا', 'أمريكا'], answer: 2 },
  { q: 'في أي عام هبط الإنسان على القمر؟', options: ['1965', '1969', '1972', '1975'], answer: 1 },
];

let current = 0, score = 0;

function render() {
  const q = questions[current];
  document.getElementById('quiz').innerHTML = \`
    <div class="text-white/70 mb-2">السؤال \${current+1} من \${questions.length}</div>
    <div class="w-full bg-white/10 rounded-full h-2 mb-6"><div class="bg-purple-500 h-2 rounded-full transition-all" style="width: \${((current)/questions.length)*100}%"></div></div>
    <h2 class="text-white text-2xl font-bold mb-6">\${q.q}</h2>
    <div class="space-y-3">
      \${q.options.map((opt, i) => \`<button onclick="answer(\${i})" class="w-full text-right px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition font-semibold">\${opt}</button>\`).join('')}
    </div>
  \`;
}

window.answer = (i) => {
  const q = questions[current];
  if (i === q.answer) score++;
  current++;
  if (current >= questions.length) {
    document.getElementById('quiz').innerHTML = \`
      <div class="text-center py-8">
        <div class="text-8xl mb-4">\${score >= 4 ? '🏆' : score >= 2 ? '👍' : '📚'}</div>
        <h2 class="text-white text-3xl font-bold mb-2">انتهى الاختبار!</h2>
        <p class="text-white text-5xl font-bold mb-4">\${score} / \${questions.length}</p>
        <p class="text-white/70 mb-6">\${score >= 4 ? 'ممتاز! أداء رائع' : score >= 2 ? 'جيد، حاول مرة أخرى' : 'اقرأ المزيد!'}</p>
        <button onclick="restart()" class="px-8 py-3 bg-white text-purple-700 font-bold rounded-2xl hover:bg-white/90">إعادة</button>
      </div>
    \`;
  } else render();
};

window.restart = () => { current = 0; score = 0; render(); };
render();
`)
  },
  {
    id: "notes",
    name: "Notes",
    nameAr: "دفتر ملاحظات",
    icon: "📝",
    description: "تطبيق لتدوين الملاحظات",
    category: "إنتاجية",
    code: htmlWrapper("دفتر الملاحظات", `
<div class="min-h-screen p-4 md:p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-white text-4xl font-bold mb-2">📝 دفتر ملاحظاتي</h1>
    <p class="text-white/70 mb-6">دوّن أفكارك وملاحظاتك</p>
    <button id="newBtn" class="px-6 py-3 bg-white text-purple-700 font-bold rounded-2xl hover:bg-white/90 mb-6">+ ملاحظة جديدة</button>
    <div id="notes" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
  </div>
</div>`, `
.note { animation: pop 0.3s; }
@keyframes pop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.colors { display: flex; gap: 8px; margin-top: 10px; }
.color-dot { width: 24px; height: 24px; border-radius: 50%; cursor: pointer; border: 2px solid white/20; }
`, `
let notes = JSON.parse(localStorage.getItem('notes') || '[]');
const colors = ['bg-yellow-200', 'bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-purple-200'];

function save() { localStorage.setItem('notes', JSON.stringify(notes)); }

function render() {
  const container = document.getElementById('notes');
  container.innerHTML = notes.length === 0 ? 
    '<p class="col-span-full text-white/50 text-center py-12">لا توجد ملاحظات بعد. ابدأ بإضافة واحدة!</p>' :
    notes.map((n, i) => \`
      <div class="note \${n.color} text-gray-800 rounded-2xl p-5 shadow-lg">
        <input value="\${n.title}" onchange="updateTitle(\${i}, this.value)" class="w-full font-bold text-lg bg-transparent outline-none mb-2" placeholder="العنوان">
        <textarea onchange="updateText(\${i}, this.value)" class="w-full bg-transparent outline-none resize-none text-sm" rows="6" placeholder="اكتب ملاحظتك هنا...">\${n.text}</textarea>
        <div class="flex justify-between items-center mt-3 pt-3 border-t border-black/10">
          <span class="text-xs text-gray-500">\${n.date}</span>
          <button onclick="remove(\${i})" class="text-red-500 hover:text-red-700">🗑️</button>
        </div>
        <div class="colors">
          \${colors.map(c => \`<div class="color-dot \${c}" onclick="changeColor(\${i}, '\${c}')"></div>\`).join('')}
        </div>
      </div>
    \`).join('');
}

window.updateTitle = (i, v) => { notes[i].title = v; save(); };
window.updateText = (i, v) => { notes[i].text = v; save(); };
window.remove = (i) => { notes.splice(i, 1); save(); render(); };
window.changeColor = (i, c) => { notes[i].color = c; save(); render(); };

document.getElementById('newBtn').onclick = () => {
  notes.unshift({
    title: '',
    text: '',
    color: colors[Math.floor(Math.random() * colors.length)],
    date: new Date().toLocaleDateString('ar-EG')
  });
  save(); render();
};
render();
`)
  },
  {
    id: "pomodoro",
    name: "Pomodoro Timer",
    nameAr: "مؤقت بومودورو",
    icon: "⏱️",
    description: "مؤقت لزيادة الإنتاجية",
    category: "إنتاجية",
    code: htmlWrapper("مؤقت بومودورو", `
<div class="min-h-screen flex items-center justify-center p-4">
  <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 w-full max-w-md text-center">
    <h1 class="text-white text-3xl font-bold mb-2">⏱️ بومودورو</h1>
    <p class="text-white/70 mb-6" id="mode">جلسة عمل</p>
    <div class="text-white text-8xl font-bold mb-8 font-mono" id="timer">25:00</div>
    <div class="flex gap-3 justify-center mb-6">
      <button id="startBtn" class="px-8 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600">بدء</button>
      <button id="pauseBtn" class="px-8 py-3 bg-yellow-500 text-white font-bold rounded-2xl hover:bg-yellow-600">إيقاف</button>
      <button id="resetBtn" class="px-8 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600">تصفير</button>
    </div>
    <div class="text-white/70">الجلسات المكتملة: <span id="count" class="font-bold text-white">0</span></div>
  </div>
</div>`, ``, `
let time = 25 * 60;
let interval = null;
let isBreak = false;
let count = 0;

function update() {
  const m = Math.floor(time / 60).toString().padStart(2, '0');
  const s = (time % 60).toString().padStart(2, '0');
  document.getElementById('timer').textContent = \`\${m}:\${s}\`;
}

function tick() {
  if (time > 0) {
    time--;
    update();
  } else {
    clearInterval(interval);
    interval = null;
    if (!isBreak) {
      count++;
      document.getElementById('count').textContent = count;
      isBreak = true;
      time = 5 * 60;
      document.getElementById('mode').textContent = 'استراحة قصيرة';
    } else {
      isBreak = false;
      time = 25 * 60;
      document.getElementById('mode').textContent = 'جلسة عمل';
    }
    update();
  }
}

document.getElementById('startBtn').onclick = () => {
  if (!interval) interval = setInterval(tick, 1000);
};
document.getElementById('pauseBtn').onclick = () => {
  clearInterval(interval);
  interval = null;
};
document.getElementById('resetBtn').onclick = () => {
  clearInterval(interval);
  interval = null;
  isBreak = false;
  time = 25 * 60;
  document.getElementById('mode').textContent = 'جلسة عمل';
  update();
};
update();
`)
  },
  {
    id: "password",
    name: "Password Generator",
    nameAr: "مولد كلمات السر",
    icon: "🔐",
    description: "مولد كلمات مرور قوية",
    category: "أدوات",
    code: htmlWrapper("مولد كلمات السر", `
<div class="min-h-screen flex items-center justify-center p-4">
  <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 w-full max-w-md">
    <h1 class="text-white text-3xl font-bold mb-6 text-center">🔐 مولد كلمات السر</h1>
    <div class="bg-black/40 rounded-2xl p-4 mb-4 flex items-center justify-between gap-3">
      <code id="password" class="text-green-400 text-lg font-mono flex-1 break-all">اضغط توليد</code>
      <button onclick="copy()" class="text-white/70 hover:text-white">📋</button>
    </div>
    <div class="space-y-4 mb-6">
      <div>
        <label class="text-white flex justify-between mb-2">الطول: <span id="lenVal">16</span></label>
        <input id="length" type="range" min="6" max="32" value="16" class="w-full accent-purple-500">
      </div>
      <label class="flex items-center gap-3 text-white"><input id="upper" type="checkbox" checked class="w-5 h-5 accent-purple-500"> أحرف كبيرة (A-Z)</label>
      <label class="flex items-center gap-3 text-white"><input id="lower" type="checkbox" checked class="w-5 h-5 accent-purple-500"> أحرف صغيرة (a-z)</label>
      <label class="flex items-center gap-3 text-white"><input id="numbers" type="checkbox" checked class="w-5 h-5 accent-purple-500"> أرقام (0-9)</label>
      <label class="flex items-center gap-3 text-white"><input id="symbols" type="checkbox" checked class="w-5 h-5 accent-purple-500"> رموز (!@#$)</label>
    </div>
    <button onclick="generate()" class="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl">توليد كلمة سر</button>
  </div>
</div>`, ``, `
document.getElementById('length').oninput = (e) => document.getElementById('lenVal').textContent = e.target.value;

function generate() {
  const len = parseInt(document.getElementById('length').value);
  let chars = '';
  if (document.getElementById('upper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (document.getElementById('lower').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (document.getElementById('numbers').checked) chars += '0123456789';
  if (document.getElementById('symbols').checked) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (!chars) { alert('اختر نوعاً واحداً على الأقل'); return; }
  
  let password = '';
  for (let i = 0; i < len; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  document.getElementById('password').textContent = password;
}

window.copy = () => {
  const p = document.getElementById('password').textContent;
  navigator.clipboard.writeText(p);
  alert('تم النسخ!');
};

generate();
`)
  },
];

export function findMatchingTemplate(description: string): Template | null {
  const desc = description.toLowerCase();
  const keywords: Record<string, string[]> = {
    "calculator": ["حاسبة", "calculator", "حساب", "calc"],
    "todo": ["مهام", "todo", "task", "مهمة", "قائمة"],
    "snake": ["ثعبان", "snake", "لعبة الثعبان"],
    "weather": ["طقس", "weather", "جو"],
    "quiz": ["اختبار", "quiz", "امتحان", "ثقافي"],
    "notes": ["ملاحظات", "notes", "دفتر", "note"],
    "pomodoro": ["بومودورو", "pomodoro", "مؤقت", "timer", "انتاجية"],
    "password": ["كلمة سر", "password", "باسوورد", "سر"],
  };

  for (const [templateId, words] of Object.entries(keywords)) {
    if (words.some(w => desc.includes(w))) {
      return templates.find(t => t.id === templateId) || null;
    }
  }
  return null;
}
