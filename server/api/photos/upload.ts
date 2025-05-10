import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getHeader, createError, readMultipartFormData } from "h3";
import prisma from "~/server/database/client";
import { nanoid } from "nanoid";

// AWS Config from .env
const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const AWS_BUCKET_NAME = process.env.AWS_S3_BUCKET;

export default defineEventHandler(async (event) => {
  try {
    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) throw createError({ statusCode: 401, message: "Unauthorized" });

    const user = await prisma.session.findUnique({
      where: { authToken },
      include: { user: true },
    });
    if (!user?.user) throw createError({ statusCode: 401, message: "Invalid user" });

    const formData = await readMultipartFormData(event);
    const file = formData.find((item) => item.name === "image");
    if (!file) throw createError({ statusCode: 400, message: "No image file found" });

    // Generate unique filename
    const fileExt = file.filename.split(".").pop();
    const fileName = `memes/${Date.now()}-${nanoid()}.${fileExt}`; // 👈 folder must match bucket policy


    // Upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.data,
        ContentType: file.type,
      })
    );

    const fileUrl = `https://${AWS_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileName}`;

    // Save to DB
    const newPhoto = await prisma.photo.create({
      data: {
        userId: user.user.id,
        url: fileUrl,
      },
    });

    return { success: true, photo: newPhoto };
  } catch (error) {
    console.error("❌ Error uploading to S3:", error);
    throw createError({ statusCode: 500, message: "Upload failed" });
  }
});
