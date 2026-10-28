import "client-only";
import type { z } from "zod";
import type { UploadTarget } from "@/lib/contracts/common";
import { errorResponseSchema, type ErrorCode } from "@/lib/contracts/errors";
import { currentIdToken } from "@/lib/firebase/client";

/** Every failed call throws this; switch on `code` to show the right message. */
export class ApiError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    /** HTTP status, or 0 when the request never reached the server. */
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** A message to show the user for any thrown error (API errors carry their own). */
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

type Query = Record<string, string | number | undefined>;

/** Validates a request body or query before it is sent. */
export function validate<T extends z.ZodType>(schema: T, value: z.infer<T>): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ApiError("INVALID_REQUEST", result.error.issues[0]?.message ?? "Invalid request", 400);
  }
  return result.data;
}

/** Builds a path from segments, encoding each dynamic part. */
export function apiPath(...segments: string[]): string {
  return `/api/${segments.map(encodeURIComponent).join("/")}`;
}

/** Calls an API route with the signed-in user's Firebase ID token and parses the response. */
export async function apiRequest<T extends z.ZodType>(
  method: Method,
  path: string,
  response: T,
  options: { body?: unknown; query?: Query } = {},
): Promise<z.infer<T>> {
  const token = await currentIdToken();
  if (!token) throw new ApiError("UNAUTHENTICATED", "Sign in to continue.", 401);

  const url = new URL(path, window.location.origin);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError("INTERNAL", "Network error. Check your connection and try again.", 0);
  }

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const parsed = errorResponseSchema.safeParse(json);
    if (parsed.success) throw new ApiError(parsed.data.error.code, parsed.data.error.message, res.status);
    throw new ApiError("INTERNAL", "Something went wrong. Please try again.", res.status);
  }
  return response.parse(json);
}

/** PUTs a file to the signed URL from an upload-url route, with the headers it was signed for. */
export async function uploadToTarget(target: UploadTarget, file: Blob): Promise<void> {
  let res: Response;
  try {
    res = await fetch(target.uploadUrl, { method: "PUT", headers: target.headers, body: file });
  } catch {
    throw new ApiError("INTERNAL", "Upload failed. Check your connection and try again.", 0);
  }
  if (!res.ok) throw new ApiError("INTERNAL", "Upload failed. Please try again.", res.status);
}
