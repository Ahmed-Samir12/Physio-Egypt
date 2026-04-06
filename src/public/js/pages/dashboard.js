import { requireAuth } from '../auth.js';

const me = await requireAuth();
const role = me?.data?.user?.role || me?.user?.role || me?.role || 'employee';

if (role === 'admin') window.location.replace('/admin/dashboard');
else if (role === 'mini-admin')
  window.location.replace('/mini-admin/dashboard');
else window.location.replace('/employee/dashboard');
