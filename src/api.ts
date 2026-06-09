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

  // In production, default to the Render backend.
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    return 'https://ecoletrack-5481.onrender.com';
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

// Recover admin session after deployment (when token is lost on server but stored locally)
export const recoverAdminSession = async (email: string, password: string): Promise<{ user: UserProfile; token: string; message: string }> => {
  return apiFetch<{ user: UserProfile; token: string; message: string }>('/api/session/recover', {
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

// FedaPay Payment Gateway Integration
export interface FedaPayTransactionPayload {
  amount: number;
  phoneNumber: string;
  currency?: string; // Default: XOF
  description: string;
  customerName?: string;
  customerEmail?: string;
  callbackUrl?: string;
  returnUrl?: string;
  failureUrl?: string;
  purpose?: string;
  userEmail?: string;
  projectId?: string;
}

export interface FedaPayTransactionResponse {
  success?: boolean;
  transaction?: {
    id: string;
    reference: string;
    amount: number;
    currency: string;
    status: string;
  };
  link?: string;
  redirectUrl?: string;
  redirect_url?: string;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export interface FedaPayTransactionRecord {
  transactionId: string;
  reference: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  purpose: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export const getFedaPayTransactions = async (): Promise<FedaPayTransactionRecord[]> => {
  const data = await apiFetch<{ transactions: FedaPayTransactionRecord[] }>('/api/fedapay/transactions');
  return data.transactions;
};

export const getFedaPayInvestorCount = async (): Promise<number> => {
  const data = await apiFetch<{ investorCount: number }>('/api/fedapay/investor-count');
  return Number(data.investorCount || 0);
};

export interface ProjectMetricsResponse {
  collectedAmount: number;
  investedAmount: number;
  donorCount: number;
}

export const getFedaPaySummary = async (): Promise<{ investorCount: number; totalAmount: number }> => {
  const data = await apiFetch<{ investorCount: number; totalAmount: number }>('/api/fedapay/summary');
  return {
    investorCount: Number(data.investorCount || 0),
    totalAmount: Number(data.totalAmount || 0),
  };
};

export const getProjectMetrics = async (): Promise<ProjectMetricsResponse> => {
  const data = await apiFetch<ProjectMetricsResponse>('/api/project-metrics');
  return {
    collectedAmount: Number(data.collectedAmount || 0),
    investedAmount: Number(data.investedAmount || 0),
    donorCount: Number(data.donorCount || 0),
  };
};

export const initiateFedaPayTransaction = async (
  payload: FedaPayTransactionPayload,
): Promise<FedaPayTransactionResponse> => {
  return apiFetch<FedaPayTransactionResponse>('/api/fedapay', {
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
