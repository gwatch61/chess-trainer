// ============================================
// Chess Training Program - Supabase Auth
// ============================================

var SUPABASE_URL = 'https://vgtoyqqysahodhkrgtrn.supabase.co';
var SUPABASE_KEY = 'sb_publishable_ksDqhTzjquXpEhOSFQea1Q_3qyF8QMB';

window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.CT = window.CT || {};
CT.currentUser = null;

(function () {
  'use strict';

  var activeTab = 'login';

  function showModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
  }

  function hideModal() {
    document.getElementById('auth-modal').classList.add('hidden');
  }

  function showUserBar(email) {
    var bar = document.getElementById('user-bar');
    document.getElementById('user-email-display').textContent = email;
    bar.classList.remove('hidden');
  }

  function hideUserBar() {
    document.getElementById('user-bar').classList.add('hidden');
  }

  function setError(msg) {
    var el = document.getElementById('auth-error');
    el.textContent = msg;
    el.classList.toggle('hidden', !msg);
  }

  function onSession(user) {
    CT.currentUser = user || null;
    if (user) {
      hideModal();
      showUserBar(user.email);
      CT.Storage.syncFromSupabase();
    } else {
      hideUserBar();
      showModal();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Check existing session
    window.sb.auth.getSession().then(function (res) {
      var user = res.data && res.data.session && res.data.session.user;
      onSession(user || null);
    });

    // Listen for auth changes
    window.sb.auth.onAuthStateChange(function (_event, session) {
      onSession(session ? session.user : null);
    });

    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.dataset.tab;
        document.querySelectorAll('.auth-tab').forEach(function (b) {
          b.classList.toggle('active', b.dataset.tab === activeTab);
        });
        document.getElementById('auth-submit').textContent =
          activeTab === 'login' ? 'Sign In' : 'Create Account';
        setError('');
      });
    });

    // Submit
    document.getElementById('auth-submit').addEventListener('click', async function () {
      var email = document.getElementById('auth-email').value.trim();
      var password = document.getElementById('auth-password').value;
      if (!email || !password) { setError('Please enter email and password.'); return; }

      var res;
      if (activeTab === 'login') {
        res = await window.sb.auth.signInWithPassword({ email: email, password: password });
        if (res.error) {
          setError(res.error.message);
          var isUnconfirmed = res.error.message.toLowerCase().includes('confirm') ||
                              res.error.message.toLowerCase().includes('not confirmed');
          document.querySelector('.auth-resend').classList.toggle('hidden', !isUnconfirmed);
          return;
        }
      } else {
        res = await window.sb.auth.signUp({ email: email, password: password });
        if (!res.error && res.data.user && !res.data.session) {
          setError('Check your email to confirm your account, then sign in.');
          return;
        }
        if (res.error) { setError(res.error.message); return; }
      }
      setError('');
      document.querySelector('.auth-resend').classList.add('hidden');
    });

    // Resend confirmation
    document.getElementById('auth-resend-link').addEventListener('click', async function (e) {
      e.preventDefault();
      var email = document.getElementById('auth-email').value.trim();
      if (!email) { setError('Enter your email above first.'); return; }
      var res = await window.sb.auth.resend({ type: 'signup', email: email });
      if (res.error) { setError(res.error.message); return; }
      setError('');
      document.querySelector('.auth-resend').classList.add('hidden');
      document.getElementById('auth-error').classList.remove('hidden');
      document.getElementById('auth-error').style.color = 'var(--accent-green)';
      document.getElementById('auth-error').textContent = 'Confirmation email resent — check your inbox.';
    });

    // Guest mode
    document.getElementById('auth-guest-link').addEventListener('click', function (e) {
      e.preventDefault();
      CT.currentUser = null;
      hideModal();
    });

    // Sign out
    document.getElementById('btn-signout').addEventListener('click', function () {
      window.sb.auth.signOut();
    });
  });
})();
