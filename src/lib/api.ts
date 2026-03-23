const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "API request failed");
  }

  return res.json();
}

export interface RunResult {
  dataframe: Record<string, unknown>[];
  milestones: Record<string, unknown>;
  retention_matrix?: number[][];
}

export async function runSubscriptionModel(
  config: Record<string, unknown>,
  sensitivity?: Record<string, number>
): Promise<RunResult> {
  return apiRequest<RunResult>("/api/run/subscription", {
    method: "POST",
    body: JSON.stringify({ config, sensitivity }),
  });
}

export async function runEcommerceModel(
  config: Record<string, unknown>,
  sensitivity?: Record<string, number>
): Promise<RunResult> {
  return apiRequest<RunResult>("/api/run/ecommerce", {
    method: "POST",
    body: JSON.stringify({ config, sensitivity }),
  });
}

export async function runSaasModel(
  config: Record<string, unknown>,
  sensitivity?: Record<string, number>
): Promise<RunResult> {
  return apiRequest<RunResult>("/api/run/saas", {
    method: "POST",
    body: JSON.stringify({ config, sensitivity }),
  });
}

/** Generic model runner — resolves product type to its base engine endpoint */
export async function runModelByEngine(
  engine: "subscription" | "ecommerce" | "saas",
  config: Record<string, unknown>,
  sensitivity?: Record<string, number>,
): Promise<RunResult> {
  const fns = {
    subscription: runSubscriptionModel,
    ecommerce: runEcommerceModel,
    saas: runSaasModel,
  };
  return fns[engine](config, sensitivity);
}

/** Ping the backend to prevent Render free-tier cold starts.
 *  Call once on mount from any dashboard page. Repeats every 5 min. */
let _keepAliveTimer: ReturnType<typeof setInterval> | null = null;
export function startKeepAlive() {
  if (_keepAliveTimer) return;
  const ping = () => fetch(`${API_URL}/`, { method: "GET" }).catch(() => {});
  ping(); // immediate first ping
  _keepAliveTimer = setInterval(ping, 5 * 60 * 1000);
}
export function stopKeepAlive() {
  if (_keepAliveTimer) {
    clearInterval(_keepAliveTimer);
    _keepAliveTimer = null;
  }
}


