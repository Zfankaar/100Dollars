const SESSION_KEY = '100dollars_session';
const TASKS_KEY = '100dollars_tasks';
let currentUser = null;
let currentTask = null;
const tasksData = [
    { id: 1, title: 'Watch Ad Video', desc: 'Takes ~30 seconds', reward: 1.50, time: '30 sec', icon: 'play_circle' },
    { id: 2, title: 'Quick Survey', desc: '3 questions remaining', reward: 0.50, time: '2 min', icon: 'fact_check' },
    { id: 3, title: 'Daily Check-in', desc: 'Check in daily', reward: 0.10, time: '10 sec', icon: 'check_circle' },
    { id: 4, title: 'App Test', desc: 'Test new features', reward: 5.00, time: '15 min', icon: 'bug_report' },
    { id: 5, title: 'Write Review', desc: 'Write app review', reward: 3.00, time: '5 min', icon: 'rate_review' },
    { id: 6, title: 'Refer Friend', desc: 'Invite a friend', reward: 10.00, time: '1 min', icon: 'person_add' }
];

document.addEventListener('DOMContentLoaded', () => { checkAuth(); });

function checkAuth() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) { window.location.href = 'index.html'; return; }
    currentUser = JSON.parse(session);
    document.getElementById('userAvatar').src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2322ff00' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ctext x='12' y='16' text-anchor='middle' font-size='12' font-weight='bold' fill='%23000000'%3E${currentUser.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
    loadTasks();
    loadUserStats();
}

function loadUserStats() {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    const userTasks = tasks.filter(t => t.userId === currentUser.id);
    const balance = userTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.reward, 0);
    const pending = userTasks.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.reward, 0);
    const total = userTasks.filter(t => t.status === 'completed' || t.status === 'paid').reduce((sum, t) => sum + t.reward, 0);
    document.getElementById('balance').textContent = balance.toFixed(2);
    document.getElementById('pending').textContent = pending.toFixed(2);
    document.getElementById('totalEarned').textContent = total.toFixed(2);
    document.getElementById('balanceProgress').style.width = Math.min((balance / 100) * 100, 100) + '%';
    document.getElementById('withdrawBtn').disabled = balance < 5;
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    const userTasks = tasks.filter(t => t.userId === currentUser.id);
    const completedIds = userTasks.map(t => t.taskId);
    const available = tasksData.filter(t => !completedIds.includes(t.id));
    if (available.length === 0) {
        document.getElementById('tasksGrid').innerHTML = '<div class="bg-surface rounded-DEFAULT p-6 text-center border border-outline-variant/30"><span class="material-symbols-outlined text-4xl text-primary-container mb-2">celebration</span><p class="text-on-surface">All tasks completed!</p></div>';
        return;
    }
    document.getElementById('tasksGrid').innerHTML = available.map(task => `
    <div class="bg-surface rounded-DEFAULT p-4 border border-outline-variant/50 flex items-center gap-4 hover:border-primary-container/50 transition-colors cursor-pointer group shadow-sm" onclick="openTask(${task.id})">
    <div class="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant group-hover:border-primary-container/30 transition-colors relative">
    <span class="material-symbols-outlined text-on-surface group-hover:text-primary-container transition-colors relative z-10" style="font-variation-settings: 'FILL' 1;">${task.icon}</span>
    </div>
    <div class="flex-1 flex flex-col">
    <h3 class="font-body-lg text-body-lg text-on-surface group-hover:text-white transition-colors">${task.title}</h3>
    <p class="font-body-md text-body-md text-on-surface-variant text-xs">${task.desc}</p>
    </div>
    <div class="bg-primary-container/10 border border-primary-container/20 px-3 py-1.5 rounded-full">
    <span class="font-label-caps text-label-caps text-primary-container drop-shadow-[0_0_4px_rgba(34,255,0,0.4)]">+$${task.reward.toFixed(2)}</span>
    </div>
    </div>
    `).join('');
}

function refreshTasks() { loadTasks(); showToast('Tasks refreshed!'); }

function openTask(taskId) {
    currentTask = tasksData.find(t => t.id === taskId);
    if (!currentTask) return;
    const answer = prompt(`${currentTask.title}\n\n${currentTask.desc}\n\nEnter completion proof:`);
    if (!answer) return;
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    tasks.push({ id: Date.now(), taskId: currentTask.id, userId: currentUser.id, title: currentTask.title, reward: currentTask.reward, answer: answer, status: 'completed', createdAt: new Date().toISOString() });
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    loadTasks();
    loadUserStats();
    showToast(`Task completed! +$${currentTask.reward.toFixed(2)}`);
}

function showWithdraw() { document.getElementById('withdrawAmount').focus(); }

function withdraw() {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const balance = parseFloat(document.getElementById('balance').textContent);
    if (!amount || amount < 5) { showToast('Minimum $5 withdrawal'); return; }
    if (amount > balance) { showToast('Insufficient balance'); return; }
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    let remaining = amount;
    for (let task of tasks) {
        if (task.userId === currentUser.id && task.status === 'completed' && remaining > 0) {
            const deduct = Math.min(task.reward, remaining);
            task.reward -= deduct;
            remaining -= deduct;
            if (task.reward <= 0) task.status = 'paid';
        }
    }
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    document.getElementById('withdrawAmount').value = '';
    loadUserStats();
    showToast(`Withdrawal of $${amount.toFixed(2)} submitted!`);
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    t.classList.add('block');
    setTimeout(() => { t.classList.add('hidden'); t.classList.remove('block'); }, 3000);
}

function goToProfile() {
    showToast('Profile page coming soon!');
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
}