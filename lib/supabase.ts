export const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
export async function api(path: string, init: RequestInit = {}, token?: string) {
  if (!projectUrl || !publishableKey) throw new Error('Store connection is not configured.');
  const response = await fetch(projectUrl + path, { ...init, cache: 'no-store', headers: { apikey: publishableKey, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || 'Request failed. Please try again.');
  return data;
}
export const rpc = (name: string, args: object) => api('/rest/v1/rpc/' + name, {method:'POST', body:JSON.stringify(args)});
