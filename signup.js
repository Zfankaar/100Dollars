const USERS_KEY = '100dollars_users';

function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    const icon = document.getElementById(fieldId + 'Icon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility_off';
    } else {
        input.type = 'password';
        icon.textContent = 'visibility';
    }
}

function showToast(msg, isError = false) {
    const t = document.getElementById('toast');
    const ti = document.getElementById('toastIcon');
    const tt = document.getElementById('toastText');
    tt.textContent = msg;
    if (isError) {
        t.className = 'fixed top-6 left-1/2 -translate-x-1/2 pl-20 px-24 py-5 rounded-[12px_30px_8px_20px] bg-red-500 shadow-[0_0_20px_rgba(255,0,0,0.3)] text-white font-bold z-[1000] hidden flex items-center gap-2';
        ti.textContent = 'error';
    } else {
        t.className = 'fixed top-6 left-1/2 -translate-x-1/2 pl-20 px-24 py-5 rounded-[12px_30px_8px_20px] bg-gradient-to-r from-primary-container to-primary-fixed shadow-[0_0_20px_rgba(34,255,0,0.5)] text-black font-bold z-[1000] hidden flex items-center gap-2';
        ti.textContent = 'check_circle';
    }
    t.classList.remove('hidden');
    t.classList.add('flex');
    setTimeout(() => { t.classList.add('hidden'); t.classList.remove('flex'); }, 3000);
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const referralCode = document.getElementById('referralCode')?.value.trim() || '';
    if (password !== confirmPassword) { showToast('Passwords do not match', true); return; }
    if (password.length < 6) { showToast('Password must be at least 6 characters', true); return; }
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    if (users.find(u => u.email === email)) { showToast('Email already registered', true); return; }
    const newUser = { id: Date.now(), name, email, password, referralCode, createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem('100dollars_session', JSON.stringify(newUser));
    showToast('Account created!');
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
}