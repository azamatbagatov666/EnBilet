"use client";

import DialogModal from "@/src/components/alerts/DialogModal";
import SuccessAlert from "@/src/components/alerts/SuccessAlert";
import { useState, useEffect } from "react";

import { useImageUpload } from "@/src/hooks/useImageUpload";

import { fetchWithAuth } from "@/src/lib/fetchWithAuth";

import ImageCollection from "@/src/components/image/ImageCollection";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ShowType } from "@/src/models/ShowType";

export type ImageFile = {
  original: File;
  thumbnail?: File;
} | null;

export default function showGallery({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { uploadImage } = useImageUpload();
  const { id } = use(params);
  const router = useRouter();

  const [theShow, setTheShow] = useState<ShowType>();

  const EVENT_IMAGE_CONFIG = [
    {
      key: "horKey",
      title: "Gösteri Fotoğrafı (Geniş Ekran)",
      uploadPath: "/cdn/shows/horizantal",
      maxSizeMB: 20,
      description: "Lütfen 16:9 oranında bir fotoğraf yükleyiniz.",
      currentPath: theShow?.horKey,
    },
    {
      key: "verKey",
      title: "Gösteri Fotoğrafı (Dikey Ekran - Mobil)",
      uploadPath: "/cdn/shows/vertical",
      maxSizeMB: 20,
      description: "Lütfen 3:4 oranında bir fotoğraf yükleyiniz.",
      currentPath: theShow?.verKey,
    },
  ] as const;

  useEffect(() => {
    (async () => {
      await getShowInfo();
    })();
  }, []);

  const getShowInfo = async () => {
    try {
      const res = await fetchWithAuth(
        `/services/account/get/getTheShow?showID=${id}`,
      );

      const data = await res.json();

      setTheShow(data);
    } catch (err: any) {
      router.push(`/account/shows/`);
    }
  };

  type ImageKeys = (typeof EVENT_IMAGE_CONFIG)[number]["key"];

  const [images, setImages] = useState<Partial<Record<ImageKeys, ImageFile>>>(
    {},
  );

  const submit = async () => {
    const uploaded: Record<string, string> = {};

    for (const category of EVENT_IMAGE_CONFIG) {
      const image = images[category.key];

      if (!image) continue;

      const result = await uploadImage({
        uploadPath: category.uploadPath,
        entityId: Number(id),
        original: image.original,
        thumbnail: "thumbnail" in image ? image.thumbnail : undefined,
      });

      uploaded[category.key] = result.imageKey;
    }

    const updatedShow = {
      showName:theShow?.showName,
      showID:theShow?.showID,
      description:theShow?.description,
      horKey: uploaded.horKey,
      verKey: uploaded.verKey,
    };

    await fetchWithAuth("/services/account/actions/editShow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedShow),
    });
  };

  const clearFile = (imageKey: string) => {
    console.log("imageKey");
    console.log(imageKey);
  };

  return (
    <>
      <div className="">
        <div className="grid lg:flex gap-4 text-xl font-bold my-4">
          <span>
            Gösteri İsmi:{" "}
            <span className="font-semibold">{theShow?.showName}</span>
          </span>
        </div>
      </div>

      <ImageCollection
        config={EVENT_IMAGE_CONFIG}
        onChange={setImages}
        entityId={id}
        clearFile={clearFile}
      />

      <button
        className="btn btn-success text-white"
        onClick={() => {
          submit();
        }}
      >
        Deneme
      </button>
    </>
  );
}
