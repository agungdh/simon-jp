import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.MINIO_ENDPOINT ?? "http://localhost:9000";
const accessKeyId = process.env.MINIO_ACCESS_KEY ?? "admin";
const secretAccessKey = process.env.MINIO_SECRET_KEY ?? "admin123";
export const BUCKET = process.env.MINIO_BUCKET ?? "simonjp";

export const s3 = new S3Client({
  endpoint,
  region: process.env.MINIO_REGION ?? "us-east-1",
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
});

export async function getPresignedPutUrl(
  key: string,
  contentType?: string,
  expiresIn = 900,
): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, cmd, { expiresIn });
}

export async function getPresignedGetUrl(
  key: string,
  expiresIn = 900,
): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn });
}

export async function deleteObject(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: key }),
  );
}
