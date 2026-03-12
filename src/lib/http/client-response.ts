interface JsonObject {
  readonly [key: string]: unknown;
}

export async function readJsonObject(
  response: Response,
  fallbackMessage: string,
): Promise<JsonObject> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error(fallbackMessage);
  }

  if (
    payload === null ||
    typeof payload !== 'object' ||
    Array.isArray(payload)
  ) {
    throw new Error(fallbackMessage);
  }

  const jsonObject: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    jsonObject[key] = value;
  }

  return jsonObject;
}

export function readOptionalString(
  payload: JsonObject,
  key: string,
): string | null {
  const value = payload[key];

  return typeof value === 'string' ? value : null;
}

export function readRequiredString(
  payload: JsonObject,
  key: string,
  fallbackMessage: string,
): string {
  const value = readOptionalString(payload, key);

  if (value === null || value === '') {
    throw new Error(fallbackMessage);
  }

  return value;
}

export function readErrorMessage(
  payload: JsonObject,
  fallbackMessage: string,
): string {
  const error = readOptionalString(payload, 'error');

  return error === null || error === '' ? fallbackMessage : error;
}
