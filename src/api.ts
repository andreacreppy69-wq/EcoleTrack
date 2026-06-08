export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  profession: string;
  phoneNumber: string;
  gender: string;
  photoUrl: string;
  role?: string;
  name?: string;
}

export interface UserAccount extends UserProfile {
  password: string;
  createdAt: string;
  mustChangePassword: boolean;
}

export interface ActivityRecord {
  email: string;
  action: string;
  createdAt: string;
}

const getApiBase = () => {
  const base = String(import.meta.env.VITE_API_BASE || '').trim();
  if (base) {
    return base;
  }

  // In production on Vercel, the frontend is deployed separately from the Render backend.
  // Use the Render API URL when the Vite env variable is not configured.
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    const hostname = String(window.location.hostname).toLowerCase();
    if (hostname.endsWith('.vercel.app') || hostname === 'ecolestrack.vercel.app' || hostname === 'ecoletrack.vercel.app') {
      return 'https://ecoletrack-5481.onrender.com';
    }
  }

  return '';
};

const apiFetch = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const apiBase = getApiBase();
  const target = apiBase.endsWith('/') ? `${apiBase.slice(0, -1)}${path}` : `${apiBase}${path}`;
  try {
    const headers = new Headers(options && (options as any).headers ? (options as any).headers : undefined);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('siteAuthToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(target, {
      credentials: 'include',
      ...options,
      headers,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || response.statusText || 'Erreur API');
    }
    return response.json();
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Connexion au serveur impossible. Vérifiez que le backend est démarré.');
    }
    throw error;
  }
};

export const getUsers = async (): Promise<UserAccount[]> => {
  const data = await apiFetch<{ users: UserAccount[] }>('/api/users');
  return data.users;
};

export const getUserByEmail = async (email: string): Promise<UserProfile> => {
  const data = await apiFetch<{ user: UserProfile }>(`/api/users/${encodeURIComponent(email)}`);
  return data.user;
};

export const getActivity = async (): Promise<ActivityRecord[]> => {
  const data = await apiFetch<{ activity: ActivityRecord[] }>('/api/activity');
  return data.activity;
};

export const getMessages = async (): Promise<{ name: string; email: string; message: string; createdAt: string }[]> => {
  const data = await apiFetch<{ messages: { name: string; email: string; message: string; createdAt: string }[] }>('/api/messages');
  return data.messages;
};

export const submitMessage = async (message: { name: string; email: string; message: string }): Promise<void> => {
  await apiFetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
};

export const getTierProgress = async (): Promise<number[]> => {
  const data = await apiFetch<{ tierProgress: number[] }>('/api/tier-progress');
  return data.tierProgress;
};

export const saveTierProgress = async (tierProgress: number[]): Promise<void> => {
  await apiFetch('/api/tier-progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tierProgress }),
  });
};

export const loginUser = async (email: string, password: string): Promise<{ user: UserProfile; mustChangePassword: boolean; token?: string }> => {
  return apiFetch<{ user: UserProfile; mustChangePassword: boolean; token?: string }>('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async (account: Omit<UserAccount, 'createdAt' | 'mustChangePassword'>): Promise<any> => {
  const accountWithName = {
    ...account,
    name: `${account.firstName} ${account.lastName}`.trim(),
  };
  return apiFetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(accountWithName),
  });
};

export const createUser = async (account: Omit<UserAccount, 'createdAt' | 'mustChangePassword'>): Promise<any> => {
  const accountWithName = {
    ...account,
    name: `${account.firstName} ${account.lastName}`.trim(),
  };
  const isAdminSession = typeof window !== 'undefined' && localStorage.getItem('siteAdminAuthenticated') === 'true' && !!localStorage.getItem('siteAuthToken');
  const path = isAdminSession ? '/api/users/create' : '/api/users/register';
  return apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(accountWithName),
  });
};

export const changePassword = async (email: string, newPassword: string): Promise<void> => {
  await apiFetch('/api/users/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });
};

export const resetPassword = async (email: string, newPassword: string): Promise<void> => {
  await apiFetch('/api/users/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });
};

export const updateUserProfile = async (oldEmail: string, profile: UserProfile): Promise<UserProfile> => {
  const profileWithName = {
    ...profile,
    name: `${profile.firstName} ${profile.lastName}`.trim(),
  };
  const data = await apiFetch<{ user: UserProfile }>('/api/users/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldEmail, ...profileWithName }),
  });
  return data.user;
};

export const deleteUser = async (email: string): Promise<void> => {
  await apiFetch(`/api/users/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
};

export interface PayGateTransactionPayload {
  amount: number;
  phoneNumber: string;
  network: 'FLOOZ' | 'TMONEY';
  description: string;
  identifier: string;
  customerName?: string;
  customerEmail?: string;
  callbackUrl?: string;
  returnUrl?: string;
}

export interface PayGateTransactionResponse {
  tx_reference?: string;
  status?: number;
  transactionId?: string;
  redirectUrl?: string;
  redirect_url?: string;
  message?: string;
  [key: string]: unknown;
}

export const initiatePayGateTransaction = async (
  payload: PayGateTransactionPayload,
): Promise<PayGateTransactionResponse> => {
  return apiFetch<PayGateTransactionResponse>('/api/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

export const logActivity = async (email: string, action: string): Promise<void> => {
  await apiFetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, action }),
  });
};
