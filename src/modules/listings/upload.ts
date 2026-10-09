"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";
import { requireOnboarded } from "@/modules/identity/session";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const URL_TTL_SECONDS = 60;

type PresignResult =
  | { ok: true; uploadUrl: string; publicUrl: string }
  | { ok: false; error: string };

export async function requestUploadUrl(input: {
  contentType: string;
  size: number;
  slot: number;
}): Promise<PresignResult> {
  const user = await requireOnboarded();

  if (!ALLOWED_TYPES.includes(input.contentType)) {
    return { ok: false, error: "Only JPEG, PNG, and WebP images are allowed." };
  }
  if (input.size > MAX_SIZE_BYTES) {
    return { ok: false, error: "Image is larger than 5MB." };
  }
  if (input.slot < 0 || input.slot > 2) {
    return { ok: false, error: "Invalid image slot." };
  }

  const ext = input.contentType.split("/")[1].replace("jpeg", "jpg");
  const key = `listings/${user.id}/${crypto.randomUUID()}-${input.slot}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(r2, command, {
    expiresIn: URL_TTL_SECONDS,
  });

  return {
    ok: true,
    uploadUrl,
    publicUrl: `${R2_PUBLIC_URL}/${key}`,
  };
}