'use server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_API_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

/**
 * Uploads an image file to R2 (S3-compatible) and returns the public URL.
 * @param file File or Blob to upload
 * @param fileName Name to use for the file in the bucket
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToR2(
  file: File | Blob,
  fileName: string
): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type || "application/octet-stream";
    console.log("process.env.CLOUDFLARE_BUCKET_NAME", process.env.CLOUDFLARE_BUCKET_NAME);
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: `tickets/images/${fileName}`,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return `${process.env.CLOUDFLARE_BUCKET_PUBLIC_URL}/tickets/images/${fileName}`;
  } catch (error) {
    console.error('Error uploading image to R2:', error);
    throw error;
  }
}
