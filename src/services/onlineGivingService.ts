const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function publicFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: unknown }).message || "Request failed")
        : text || "Request failed";
    const error: any = new Error(message);
    error.response = { status: response.status, data };
    error.status = response.status;
    throw error;
  }

  return (data ?? null) as T;
}

export interface PublicOfferingType {
  id: string;
  name: string;
}

export interface PublicCurrency {
  code: string;
  symbol: string;
  name: string;
  isDefault: boolean;
}

export interface GivingOptionsResponse {
  offeringTypes: PublicOfferingType[];
  currencies: PublicCurrency[];
  churchName: string;
}

export interface InitializeOnlineGivingPayload {
  amount: number;
  currencyCode: string;
  offeringTypeId: string;
  donorName?: string;
  donorEmail?: string;
  gateway: string;
}

export interface InitializeOnlineGivingResponse {
  redirectUrl: string;
  reference: string;
}

export interface VerifyOnlineGivingResponse {
  status: string;
  amount: number;
  currencyCode: string;
  offeringTypeName: string;
}

export async function fetchGivingOptions(churchSlug: string) {
  return publicFetch<GivingOptionsResponse>(
    `/public/churches/${encodeURIComponent(churchSlug)}/giving-options`,
  );
}

export async function initializeOnlineGiving(
  churchSlug: string,
  payload: InitializeOnlineGivingPayload,
) {
  return publicFetch<InitializeOnlineGivingResponse>(
    `/public/churches/${encodeURIComponent(churchSlug)}/giving/initialize`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function verifyOnlineGiving(reference: string) {
  return publicFetch<VerifyOnlineGivingResponse>(
    `/public/giving/${encodeURIComponent(reference)}/verify`,
  );
}
