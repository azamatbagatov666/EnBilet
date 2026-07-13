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
type UploadSession = {
  uploadUrl: string;
  sasToken: string;
};

type UploadParams = {
  session: UploadSession;
  uploadPath: string;
  entityId: number;
  original: File;
  thumbnail?: File;
};

type UploadResult = {
  imageKey: string;
  imageThumbKey?: string;
};

const getUploadSession = useCallback(async (): Promise<UploadSession> => {
  const sasRes = await fetchWithAuth(
    "/services/account/cdn/getImageUploadSas",
    {
      method: "POST",
    },
  );

  if (!sasRes.ok) {
    throw new Error("Failed to get upload SAS");
  }

  return await sasRes.json();
}, []);

const uploadImage = useCallback(
  async ({
    session,
    uploadPath,
    entityId,
    original,
    thumbnail,
  }: UploadParams): Promise<UploadResult> => {
    const uuid = generateId();

    const imageKey = `${uploadPath}/${entityId}/${uuid}.webp`;

    const imageThumbKey = thumbnail
      ? `${uploadPath}/${entityId}/${uuid}_thumb.webp`
      : undefined;

    const upload = async (file: File, blobName: string) => {
      const res = await fetch(
        `${session.uploadUrl}/${blobName}?${session.sasToken}`,
        {
          method: "PUT",
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": file.type,
          },
          body: file,
        },
      );

      if (!res.ok) {
        throw new Error("Upload failed");
      }
    };

    const uploads = [upload(original, imageKey)];

    if (thumbnail && imageThumbKey) {
      uploads.push(upload(thumbnail, imageThumbKey));
    }

    await Promise.all(uploads);

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
    getUploadSession,
    uploadImage,
    deleteImages,
  };
}