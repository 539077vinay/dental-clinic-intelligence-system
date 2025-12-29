// Toast notifications
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type === 'error' ? 'error' : ''}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('visible'));
    btn.classList.add('active');
    document.getElementById(tab).classList.add('visible');
  });
});

// Check if already logged in
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = '/pages/dashboard.html';
  }
});

// Sign In
async function handleSignin(e) {
  e.preventDefault();
  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;
  if (!email || !password) { showToast('Enter email and password', 'error'); return; }
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    showToast('Signed in successfully');
    setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 500);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// Sign Up
async function handleSignup(e) {
  e.preventDefault();
  const clinicId = document.getElementById('signupClinicId').value;
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  if (!clinicId || !name || !email || !password) { showToast('Fill all fields', 'error'); return; }
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinicId, name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    
    // Start trial
    await fetch('/api/start-trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinicId, ownerName: name, email })
    });
    
    showToast('Account created successfully');
    setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 500);
  } catch (e) {
    showToast(e.message, 'error');
  }
}
