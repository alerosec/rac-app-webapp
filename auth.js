import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
});

const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const signInGoogle = document.getElementById('signInGoogle');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const authAction = document.getElementById('authAction');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const toast = document.getElementById('toast');
let isSignUp = false;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(window.__authToastTimer);
  window.__authToastTimer = window.setTimeout(() => toast.classList.remove('visible'), 3200);
}

function emitAuthEvent(name, user) {
  window.dispatchEvent(new CustomEvent(name, { detail: { user } }));
}

async function fetchCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}

async function handleAuthState() {
  const user = await fetchCurrentUser();

  if (!user) {
    authModal?.showModal();
    document.body.dataset.authed = 'false';
    emitAuthEvent('supabase-auth-ready', null);
    return;
  }

  document.body.dataset.authed = 'true';
  authModal?.close();
  emitAuthEvent('supabase-auth-ready', user);
}

async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href,
    },
  });
  if (error) showToast(error.message);
}

async function signInWithEmail(email, password) {
  if (!email || !password) {
    showToast('Please enter both email and password.');
    return;
  }

  if (isSignUp) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return showToast(error.message);
    showToast('Check your email to confirm your account.');
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return showToast(error.message);
  showToast('Signed in successfully.');
}

function updateAuthMode() {
  if (!toggleAuthMode || !authAction) return;
  isSignUp = !isSignUp;
  authAction.textContent = isSignUp ? 'Create account' : 'Sign in';
  toggleAuthMode.textContent = isSignUp ? 'Already have an account? Sign in' : 'Create an account';
}

if (signInGoogle) {
  signInGoogle.addEventListener('click', (event) => {
    event.preventDefault();
    signInWithGoogle();
  });
}

if (toggleAuthMode) {
  toggleAuthMode.addEventListener('click', updateAuthMode);
}

if (authForm) {
  authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await signInWithEmail(authEmail.value.trim(), authPassword.value);
  });
}

window.addEventListener('DOMContentLoaded', handleAuthState);

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    document.body.dataset.authed = 'true';
    authModal?.close();
    emitAuthEvent('supabase-auth-ready', session?.user ?? null);
  } else if (event === 'SIGNED_OUT') {
    document.body.dataset.authed = 'false';
    authModal?.showModal();
    emitAuthEvent('supabase-signed-out', null);
  }
});
