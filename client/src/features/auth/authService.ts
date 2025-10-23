import { API_BASE } from '../../configapi/api' ;

export async function login(phone: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ phone, password })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Login failed');

  // Save token (User-wise unique)
  localStorage.setItem('access_token', json.token);
  localStorage.setItem('user', JSON.stringify(json.user));
  return json.user;
}
