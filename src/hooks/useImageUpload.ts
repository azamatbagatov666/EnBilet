import { useCallback } from "react";
import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import { generateId } from "@/src/lib/generateId";

type UploadParams = {
  uploadPath: string;
  entityId: number;
  original: File;
  thumbnail?: File;
};

type UploadResult = {
  imageKey: string;
  imageThumbKey?: string;
};

export function useImageUpload() {
  const uploadImage = useCallback(
    async ({
      uploadPath,
      entityId,
      original,
      thumbnail,
    }: UploadParams): Promise<UploadResult> => {
      const sasRes = await fetchWithAuth(
        "/services/account/cdn/getImageUploadSas",
        { method: "POST" },
      );

      if (!sasRes.ok) {
        throw new Error("Failed to get upload SAS");
      }

      const { uploadUrl, sasToken } = await sasRes.json();

      const uuid = generateId();

      const imageKey = `${uploadPath}/${entityId}/${uuid}.webp`;
      const imageThumbKey = thumbnail
        ? `${uploadPath}/${entityId}/${uuid}_thumb.webp`
        : undefined;

      const upload = async (file: File, blobName: string) => {
        const res = await fetch(`${uploadUrl}/${blobName}?${sasToken}`, {
          method: "PUT",
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }
      };

      await upload(original, imageKey);

      if (thumbnail && imageThumbKey) {
        await upload(thumbnail, imageThumbKey);
      }

      return {
        imageKey,
        imageThumbKey,
      };
    },
    [],
  );

  const deleteImages = useCallback(async (imageKeys: string[]) => {
    if (!imageKeys.length) return;

    await fetchWithAuth("/services/account/cdn/deleteImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageKeys: imageKeys.filter(Boolean),
      }),
    });
  }, []);

  return {
    uploadImage,
    deleteImages,
  };
}