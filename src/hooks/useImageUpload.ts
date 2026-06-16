import { useCallback } from "react";
import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import { generateId } from "@/src/lib/generateId";

type UploadResult = {
  imageKey: string;
};

type UploadResultThumbs = {
  imageKey: string;
  imageThumbKey: string;
};

export function useImageUploadThumbs(basePath: string) {
  const uploadImage = useCallback(
    async (
      original: File,
      thumbnail: File,
      entityId: number,
    ): Promise<UploadResultThumbs> => {
      const sasRes = await fetchWithAuth(
        "/services/account/cdn/getImageUploadSas",
        { method: "POST" },
      );

      if (!sasRes.ok) {
        throw new Error("Failed to get upload SAS");
      }

      const { uploadUrl, sasToken } = await sasRes.json();
      const UUID = generateId();

      const fileName = `${basePath}/${entityId}/${UUID}.webp`;
      const thumbName = `${basePath}/${entityId}/${UUID}_thumb.webp`;

      const upload = async (file: File, name: string) => {
        const res = await fetch(`${uploadUrl}/${name}?${sasToken}`, {
          method: "PUT",
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!res.ok) throw new Error("Upload failed");
      };

      await upload(original, fileName);
      await upload(thumbnail, thumbName);

      return {
        imageKey: fileName,
        imageThumbKey: thumbName,
      };
    },
    [basePath],
  );

  const deleteImages = useCallback(async (imageKeys: string[]) => {
    if (!imageKeys.length) return;

    await fetchWithAuth("/services/account/cdn/deleteImage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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



export function useImageUpload(basePath: string) {
  const uploadImage = useCallback(
    async (
      original: File,
      entityId: number,
    ): Promise<UploadResult> => {
      const sasRes = await fetchWithAuth(
        "/services/account/cdn/getImageUploadSas",
        { method: "POST" },
      );

      if (!sasRes.ok) {
        throw new Error("Failed to get upload SAS");
      }

      const { uploadUrl, sasToken } = await sasRes.json();
      const UUID = generateId();

      const fileName = `${basePath}/${entityId}/${UUID}.webp`;

      const upload = async (file: File, name: string) => {
        const res = await fetch(`${uploadUrl}/${name}?${sasToken}`, {
          method: "PUT",
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!res.ok) throw new Error("Upload failed");
      };

      await upload(original, fileName);

      return {
        imageKey: fileName,
      };
    },
    [basePath],
  );

  const deleteImages = useCallback(async (imageKeys: string[]) => {
    if (!imageKeys.length) return;

    await fetchWithAuth("/services/account/cdn/deleteImage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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