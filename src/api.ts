export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  profession: string;
  gender: string;
  photoUrl: string;
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
  if (import.meta.env.PROD && typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')) {
    return 'https://ecoletrack-5481.onrender.com';
  }

  return '';
};

const apiFetch = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const apiBase = getApiBase();
  const target = apiBase.endsWith('/') ? `${apiBase.slice(0, -1)}${path}` : `${apiBase}${path}`;
  try {
    const response = await fetch(target, {
      credentials: 'include',
      ...options,
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

export const loginUser = async (email: string, password: string): Promise<{ user: UserProfile; mustChangePassword: boolean }> => {
  return apiFetch<{ user: UserProfile; mustChangePassword: boolean }>('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
};

export const createUser = async (account: Omit<UserAccount, 'createdAt' | 'mustChangePassword'>): Promise<void> => {
  const accountWithName = {
    ...account,
    name: `${account.firstName} ${account.lastName}`.trim(),
  };
  await apiFetch('/api/users/create', {
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

export interface PayGateTransactionPayload {
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  description: string;
  orderId: string;
  callbackUrl?: string;
  returnUrl?: string;
}

export interface PayGateTransactionResponse {
  status: string;
  transactionId: string;
  redirectUrl?: string;
  message?: string;
  [key: string]: unknown;
}

const PAYGATE_API_KEY = import.meta.env.VITE_PAYGATE_GLOBAL_API_KEY as string;

export const initiatePayGateTransaction = async (
  payload: PayGateTransactionPayload,
): Promise<PayGateTransactionResponse> => {
  if (!PAYGATE_API_KEY) {
    throw new Error('La clé API PayGateGlobal n’est pas configurée. Ajoutez VITE_PAYGATE_GLOBAL_API_KEY dans .env.');
  }

  const response = await fetch('https://paygateglobal.com/api/v1/pay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PAYGATE_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`PayGateGlobal HTTP ${response.status}: ${errorBody}`);
  }

  return response.json();
};

export const logActivity = async (email: string, action: string): Promise<void> => {
  await apiFetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, action }),
  });
};
