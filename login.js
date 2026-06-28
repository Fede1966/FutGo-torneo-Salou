const form = document.getElementById('login-form');
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const submitBtn = document.getElementById('submit');
const messageEl = document.getElementById('message');
const guestBtn = document.getElementById('guest-login');

// API base: use local auth server in development, relative path in production
const API_BASE = (['127.0.0.1', 'localhost'].includes(window.location.hostname)) ? 'http://127.0.0.1:4000' : '';

function setMessage(text, isError = true){
  messageEl.textContent = text;
  messageEl.style.color = isError ? '#b91c1c' : '#065f46';
}

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  messageEl.textContent = '';

  const email = emailEl.value.trim();
  const password = passwordEl.value;

  if(!email || !password){
    setMessage('Completa email y contraseña.');
    return;
  }

  // Simple client-side password policy hint
  if(password.length < 8){
    setMessage('La contraseña debe tener al menos 8 caracteres.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Accediendo...';

  try{
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email, password})
    });

    if(res.status === 429){
      setMessage('Demasiados intentos. Intenta más tarde.');
      return;
    }

    const body = await res.json().catch(()=>({}));

    if(!res.ok){
      setMessage(body?.message || 'Correo o contraseña incorrectos.');
      return;
    }

    // Expected shape: { user: { id,name,email,role,mustChangePassword }, token }
    const { user, token } = body;
    if(!user || !token){
      setMessage('Respuesta de autenticación inválida.');
      return;
    }

    // Guardar token (ejemplo). En producción preferir HttpOnly cookie desde backend.
    localStorage.setItem('futgo_token', token);
    localStorage.setItem('futgo_user', JSON.stringify(user));
    document.dispatchEvent(new CustomEvent('futgo:auth-changed'));

    if(user.mustChangePassword){
      window.location.href = '/change-password';
      return;
    }

    // Redirección según rol (usar hash para evitar 404 en servidor estático)
    if(user.role === 'administrador') window.location.href = '/#admin';
    else if(user.role === 'responsable') window.location.href = '/#responsable';
    else window.location.href = '/#tecnico';

  }catch(err){
    console.error(err);
    setMessage('Error de red. Intenta de nuevo.');
  }finally{
    submitBtn.disabled = false;
    submitBtn.textContent = 'Iniciar sesión';
  }
});

document.getElementById('forgot').addEventListener('click', ()=>{
  alert('Solicita restablecimiento de contraseña al administrador.');
});

if(guestBtn){
  guestBtn.addEventListener('click', () => {
    localStorage.removeItem('futgo_token');
    localStorage.setItem('futgo_user', JSON.stringify({
      id: 'guest',
      name: 'Invitado',
      email: '',
      role: 'invitado'
    }));
    document.dispatchEvent(new CustomEvent('futgo:auth-changed'));
    const overlay = document.getElementById('login-overlay');
    if(overlay){
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    } else {
      window.location.href = '/#invitado';
      return;
    }
    setMessage('Has entrado como invitado. Sólo podrás ver el contenido.', false);
  });
}

// Toggle password visibility
const togglePasswordBtn = document.getElementById('toggle-password');
if(togglePasswordBtn){
  togglePasswordBtn.addEventListener('click', () => {
    if(passwordEl.type === 'password'){
      passwordEl.type = 'text';
      togglePasswordBtn.textContent = 'Ocultar contraseña';
    } else {
      passwordEl.type = 'password';
      togglePasswordBtn.textContent = 'Ver contraseña';
    }
    passwordEl.focus();
  });
}
