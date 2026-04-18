/**
 * Shared API Utility & Auth Helpers
 * Used across all frontend pages
 */

const API_BASE = 'http://localhost:5000/api';

// ---- Token Management ----
const getToken = () => localStorage.getItem('cem_token');
const getUser  = () => JSON.parse(localStorage.getItem('cem_user') || 'null');
const setAuth  = (token, user) => { localStorage.setItem('cem_token', token); localStorage.setItem('cem_user', JSON.stringify(user)); };
const clearAuth = () => { localStorage.removeItem('cem_token'); localStorage.removeItem('cem_user'); };

// ---- API Request Helper ----
const api = async (method, endpoint, data = null, isFormData = false) => {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const config = { method, headers };
  if (data) config.body = isFormData ? data : JSON.stringify(data);

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
};

// ---- Auth Guards ----
const requireAuth = (allowedRoles = []) => {
  const user = getUser();
  const token = getToken();
  if (!token || !user) { window.location.href = '/index.html'; return null; }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    alert('Access denied. Redirecting...');
    redirectByRole(user.role);
    return null;
  }
  return user;
};

const redirectByRole = (role) => {
  const routes = { admin: '/pages/admin-dashboard.html', organizer: '/pages/organizer-dashboard.html', student: '/pages/student-dashboard.html' };
  window.location.href = routes[role] || '/index.html';
};

// ---- UI Helpers ----
const showAlert = (containerId, message, type = 'error') => {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${icons[type]} ${message}</div>`;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

const clearAlert = (containerId) => {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '';
};

const showLoading = (btnId, text = 'Loading...') => {
  const btn = document.getElementById(btnId);
  if (btn) { btn.disabled = true; btn.dataset.original = btn.innerHTML; btn.innerHTML = `⏳ ${text}`; }
};

const hideLoading = (btnId) => {
  const btn = document.getElementById(btnId);
  if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.original || 'Submit'; }
};

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString('en-IN');

const categoryEmoji = { technical: '💻', cultural: '🎭', sports: '⚽', academic: '📚', workshop: '🔧', seminar: '🎤', fest: '🎉', other: '📌' };
const statusBadge = (status) => {
  const map = { upcoming: 'info', ongoing: 'success', completed: 'gray', cancelled: 'danger', pending: 'warning', approved: 'success', rejected: 'danger', sent: 'info', accepted: 'success', declined: 'danger' };
  return `<span class="badge badge-${map[status] || 'gray'}">${status}</span>`;
};

// ---- Render Sidebar ----
const renderSidebar = (role, activePage) => {
  const navItems = {
    admin: [
      { icon: '📊', label: 'Dashboard', page: 'admin-dashboard' },
      { icon: '👥', label: 'Organizers', page: 'admin-organizers' },
      { icon: '🎓', label: 'Students', page: 'admin-students' },
      { icon: '🏛️', label: 'Venues', page: 'admin-venues' },
      { icon: '🎓', label: 'Colleges', page: 'admin-colleges' },
      { icon: '📅', label: 'Events', page: 'admin-events' },
      { icon: '✉️', label: 'Invitations', page: 'admin-invitations' }
    ],
    organizer: [
      { icon: '📊', label: 'Dashboard', page: 'organizer-dashboard' },
      { icon: '📅', label: 'My Events', page: 'organizer-events' },
      { icon: '🏛️', label: 'Venues', page: 'organizer-venues' },
      { icon: '📋', label: 'Registrations', page: 'organizer-registrations' },
      { icon: '✉️', label: 'Invitations', page: 'organizer-invitations' },
      { icon: '🏅', label: 'Certificates', page: 'organizer-certificates' },
      { icon: '🤖', label: 'AI Estimator', page: 'organizer-ai' }
    ],
    student: [
      { icon: '📊', label: 'Dashboard', page: 'student-dashboard' },
      { icon: '📅', label: 'Events', page: 'student-events' },
      { icon: '📋', label: 'My Registrations', page: 'student-registrations' },
      { icon: '🏅', label: 'Certificates', page: 'student-certificates' },
      { icon: '🤖', label: 'Chatbot', page: 'student-chatbot' }
    ]
  };

  const user = getUser();
  const items = navItems[role] || [];
  const nav = items.map(item => `
    <a class="nav-item ${activePage === item.page ? 'active' : ''}" href="/pages/${item.page}.html">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </a>`).join('');

  return `
    <div class="sidebar-logo">
      <div class="logo-icon">🎓</div>
      <h2>College Event<br>Management</h2>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-title">${role.toUpperCase()} MENU</div>
      ${nav}
    </nav>
    <div class="sidebar-footer">
      <div class="nav-item" onclick="logout()" style="cursor:pointer">
        <span class="nav-icon">🚪</span>
        <span>Logout</span>
      </div>
    </div>`;
};

const logout = () => {
  clearAuth();
  window.location.href = '/index.html';
};

// ---- Render Topbar ----
const renderTopbar = (title) => {
  const user = getUser();
  return `
    <div class="topbar-title">${title}</div>
    <div class="topbar-actions">
      <button class="notif-btn" onclick="toggleNotifications()" title="Notifications">🔔</button>
      <div class="avatar" title="${user?.name}">${user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
      <span style="font-size:14px;font-weight:600">${user?.name || 'User'}</span>
    </div>`;
};

// ---- Notifications ----
const toggleNotifications = async () => {
  try {
    const data = await api('GET', '/notifications');
    const notifs = data.data;
    const html = notifs.length
      ? notifs.map(n => `<div style="padding:12px;border-bottom:1px solid #eee"><b>${n.title}</b><p style="font-size:13px;color:#666">${n.message}</p></div>`).join('')
      : '<p style="padding:20px;text-align:center;color:#666">No notifications</p>';
    alert(html.replace(/<[^>]+>/g, '\n').trim()); // Simple fallback
  } catch (e) { console.log('Notifications unavailable'); }
};
