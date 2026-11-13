/**
 * Safely parses a fetch Response whose body may be non-JSON on upstream gateway errors (502/503/504).
 */
export async function parseApiResponse<T = Record<string, unknown>>(
  response: Response,
  fallback4xxMessage: string,
  fallback5xxMessage = "Our booking service is temporarily unavailable. Please try again in a moment or tap Call Now directly."
): Promise<{ ok: boolean; data: (T & { success?: boolean; error?: string }) | null; errorMessage?: string }> {
  const rawText = await response.text();
  let data: (T & { success?: boolean; error?: string }) | null = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText) as T & { success?: boolean; error?: string };
    } catch {
      data = null;
    }
  }

  if (!response.ok || !data?.success) {
    const fallback = response.status >= 500 ? fallback5xxMessage : fallback4xxMessage;
    return {
      ok: false,
      data,
      errorMessage: data?.error || fallback,
    };
  }

  return { ok: true, data };
}

