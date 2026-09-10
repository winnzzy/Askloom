import { getAuthHeader, refreshSession, type AuthPlan, type AuthUser } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export interface GroupedResults {
  [category: string]: { [subgroup: string]: string[] };
}

export interface Plan {
  code: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  billingInterval: string;
  dailySearchLimit: number | null;
  scriptHookLimit: number | null;
  teamSeatLimit?: number | null;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface AccountResponse {
  user: AuthUser;
  plan: AuthPlan | null;
}

export interface AdminOverview {
  counts: {
    users: number;
    activeSubscriptions: number;
    transactions: number;
    pendingWebhooks: number;
    failedWebhooks: number;
  };
  latestTransactions: Array<{
    id: string;
    txRef: string;
    userEmail: string;
    plan: { code: string; name: string };
    amount: string;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  latestWebhookEvents: Array<{
    id: string;
    provider: string;
    eventType: string;
    processed: boolean;
    processingError: string | null;
    receivedAt: string;
    processedAt: string | null;
  }>;
}

export interface WebhookRetryResult {
  attempted: number;
  processed: number;
  errors: string[];
}

async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const response = await fetch(input, { credentials: "include", ...init });
  if (response.status !== 401) return response;

  const session = await refreshSession();
  if (!session?.token) return response;

  return fetch(input, {
    credentials: "include",
    ...init,
    headers: { ...(init.headers as Record<string, string>), ...getAuthHeader(session.token) },
  });
}

export async function signup(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Signup failed");
  }
  return res.json();
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Login failed");
  }
  return res.json();
}

export async function fetchCurrentAccount(
  token?: string | null
): Promise<AccountResponse> {
  const res = await apiFetch(`${API_BASE}/auth/me`, {
    headers: { ...getAuthHeader(token) },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Session refresh failed");
  }

  const data = (await res.json()) as AccountResponse;
  return {
    ...data,
    user: { ...data.user, currentPlan: data.plan },
  };
}

export async function fetchPlans(): Promise<Plan[]> {
  const res = await fetch(`${API_BASE}/plans`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to load plans");
  }

  const data = await res.json();
  return data.plans;
}

export async function fetchSuggestions(seed: string, token?: string | null): Promise<{
  grouped: GroupedResults;
  total: number;
}> {
  const res = await apiFetch(`${API_BASE}/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader(token) },
    body: JSON.stringify({ seed }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export async function fetchScriptHooks(
  phrase: string,
  token?: string | null
): Promise<string> {
  const res = await apiFetch(`${API_BASE}/script-hook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader(token) },
    body: JSON.stringify({ phrase }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }
  const data = await res.json();
  return data.hooks;
}

export async function startCheckout(
  plan: string,
  token?: string | null
): Promise<string> {
  const res = await apiFetch(`${API_BASE}/payment/initialize`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader(token) },
    credentials: "include",
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Payment initialization failed");
  }
  const data = await res.json();
  return data.checkoutUrl; // redirect window.location.href to this
}

export async function verifyPayment(transactionId: string): Promise<{
  verified: boolean;
  plan?: string;
  currentPeriodEnd?: string | null;
}> {
  const res = await fetch(`${API_BASE}/payment/verify/${transactionId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Payment verification failed");
  }
  return res.json();
}

export async function updateProfile(
  token: string | null,
  profile: { firstName?: string | null; lastName?: string | null }
): Promise<{ user: AuthUser }> {
  const res = await apiFetch(`${API_BASE}/auth/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeader(token) },
    credentials: "include",
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Profile update failed");
  }
  return res.json();
}

export async function requestEmailVerification(token: string | null): Promise<{
  ok: true;
  verificationToken?: string;
}> {
  const res = await apiFetch(`${API_BASE}/auth/email/verification`, {
    method: "POST",
    headers: { ...getAuthHeader(token) },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not create verification token");
  }
  return res.json();
}

export async function verifyEmail(tokenValue: string): Promise<{ ok: true }> {
  const res = await fetch(`${API_BASE}/auth/email/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token: tokenValue }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Email verification failed");
  }
  return res.json();
}

export async function requestPasswordReset(email: string): Promise<{
  ok: true;
  resetToken?: string;
}> {
  const res = await fetch(`${API_BASE}/auth/password/forgot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Password reset request failed");
  }
  return res.json();
}

export async function resetPassword(tokenValue: string, password: string): Promise<{ ok: true }> {
  const res = await fetch(`${API_BASE}/auth/password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token: tokenValue, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Password reset failed");
  }
  return res.json();
}

export async function fetchBilling(token: string | null) {
  const res = await apiFetch(`${API_BASE}/account/billing`, {
    headers: { ...getAuthHeader(token) },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Billing fetch failed");
  }
  return res.json();
}

export async function cancelSubscription(token: string | null) {
  const res = await apiFetch(`${API_BASE}/account/subscription/cancel`, {
    method: "POST",
    headers: { ...getAuthHeader(token) },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Cancellation failed");
  }
  return res.json();
}

export async function downgradeSubscription(token: string | null) {
  const res = await apiFetch(`${API_BASE}/account/subscription/downgrade`, {
    method: "POST",
    headers: { ...getAuthHeader(token) },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Downgrade failed");
  }
  return res.json();
}

export async function fetchSearchHistory(token: string | null) {
  const res = await apiFetch(`${API_BASE}/account/searches`, {
    headers: { ...getAuthHeader(token) },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Search history fetch failed");
  }
  return res.json();
}

export async function deleteSavedSearch(token: string | null, searchId: string): Promise<{ ok: true }> {
  const res = await apiFetch(`${API_BASE}/account/searches/${searchId}`, {
    method: "DELETE",
    headers: { ...getAuthHeader(token) },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not delete saved search");
  }
  return res.json();
}

export function savedSearchCsvUrl(searchId: string): string {
  return `${API_BASE}/account/searches/${searchId}/export.csv`;
}

export async function downloadSavedSearchCsv(token: string | null, searchId: string): Promise<Blob> {
  const res = await apiFetch(savedSearchCsvUrl(searchId), {
    headers: { ...getAuthHeader(token) },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "CSV export failed");
  }
  return res.blob();
}

export async function fetchTeam(token: string | null) {
  const res = await apiFetch(`${API_BASE}/account/team`, {
    headers: { ...getAuthHeader(token) },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Team fetch failed");
  }
  return res.json();
}

export async function createTeam(token: string | null, name: string) {
  const res = await apiFetch(`${API_BASE}/account/team`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader(token) },
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Team creation failed");
  }
  return res.json();
}

export async function addTeamMember(token: string | null, teamId: string, email: string) {
  const res = await apiFetch(`${API_BASE}/account/team/${teamId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader(token) },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not add team member");
  }
  return res.json();
}

export async function removeTeamMember(token: string | null, teamId: string, memberId: string) {
  const res = await apiFetch(`${API_BASE}/account/team/${teamId}/members/${memberId}`, {
    method: "DELETE",
    headers: { ...getAuthHeader(token) },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not remove team member");
  }
  return res.json();
}

export async function fetchAdminOverview(token: string | null): Promise<AdminOverview> {
  const res = await apiFetch(`${API_BASE}/admin/overview`, {
    headers: { ...getAuthHeader(token) },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Admin overview failed");
  }
  return res.json();
}

export async function retryWebhooks(token: string | null): Promise<WebhookRetryResult> {
  const res = await apiFetch(`${API_BASE}/admin/webhooks/retry`, {
    method: "POST",
    headers: { ...getAuthHeader(token) },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Webhook retry failed");
  }
  return res.json();
}
