import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getHeader, createError, readMultipartFormData } from "h3";
import prisma from "~/server/database/client";
import { nanoid } from "nanoid";

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
    // Extract groupId from the URL params
    const groupIdParam = event.context.params?.id;
    if (!groupIdParam || isNaN(Number(groupIdParam))) {
      throw createError({ statusCode: 400, message: "Missing or invalid groupId" });
    }
    const groupId = Number(groupIdParam);

    const authToken = getHeader(event, "authorization")?.replace("Bearer ", "");
    if (!authToken) throw createError({ statusCode: 401, message: "Unauthorized" });

    const user = await prisma.session.findUnique({
      where: { authToken },
      include: { user: true },
    });
    if (!user?.user) throw createError({ statusCode: 401, message: "Invalid user" });

    const formData = await readMultipartFormData(event);
    const file = formData.find((item) => item.name === "image");
    const groupPostIdItem = formData.find((item) => item.name === "groupPostId");

    if (!file) throw createError({ statusCode: 400, message: "No image file found" });

    const groupPostId = groupPostIdItem ? Number(groupPostIdItem.data.toString()) : null;

    // Generate a unique filename for the image
    const fileExt = file.filename.split(".").pop();
    const fileName = `memes/${Date.now()}-${nanoid()}.${fileExt}`;

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

    // Save the photo info to the database in GroupPhoto table
    const newPhoto = await prisma.groupPhoto.create({
      data: {
        userId: user.user.id,
        groupId,
        groupPostId,
        url: fileUrl,
      },
    });

    return { success: true, photo: newPhoto };
  } catch (error) {
    console.error("❌ Error uploading to S3:", error);
    throw createError({ statusCode: 500, message: "Upload failed" });
  }
});
