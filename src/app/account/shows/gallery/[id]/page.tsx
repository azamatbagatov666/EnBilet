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
  //alerts
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [dialogueText, setDialogueText] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");

  const [resetCounter, setResetCounter] = useState(0);

  const [isEditing, setIsEditing] = useState(false);

  const { uploadImage, deleteImages, getUploadSession } = useImageUpload();
  const { id } = use(params);
  const router = useRouter();

  const [theShow, setTheShow] = useState<ShowType>();
  const [originalShow, setOriginalShow] = useState<ShowType>();

  const EVENT_IMAGE_CONFIG = [
    {
      key: "horKey",
      title: "Gösteri Fotoğrafı (Geniş Ekran)",
      uploadPath: "show-covers/horizantal",
      maxSizeMB: 20,
      description: "Lütfen 16:9 oranında bir fotoğraf yükleyiniz.",
      currentPath: theShow?.horKey,
    },
    {
      key: "verKey",
      title: "Gösteri Fotoğrafı (Dikey Ekran - Mobil)",
      uploadPath: "show-covers/vertical",
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
      setOriginalShow(data);
    } catch (err: any) {
      router.push(`/account/shows/`);
    }
  };

  type ImageKeys = (typeof EVENT_IMAGE_CONFIG)[number]["key"];

  const [images, setImages] = useState<Partial<Record<ImageKeys, ImageFile>>>(
    {},
  );

  const submit = async () => {
    setIsEditing(true);

    const session = await getUploadSession();

    const results = await Promise.all(
      EVENT_IMAGE_CONFIG.map(async (category) => {
        const image = images[category.key];

        if (!image) {
          return null;
        }

        const result = await uploadImage({
          session,
          uploadPath: category.uploadPath,
          entityId: Number(id),
          original: image.original,
          thumbnail: "thumbnail" in image ? image.thumbnail : undefined,
        });

        return {
          key: category.key,
          imageKey: result.imageKey,
        };
      }),
    );

    const uploaded: Record<string, string> = {};

    results.forEach((result) => {
      if (!result) return;

      uploaded[result.key] = result.imageKey;
    });

    const updatedShow = {
      ...theShow,
      horKey: uploaded.horKey ?? theShow?.horKey,
      verKey: uploaded.verKey ?? theShow?.verKey,
    };

    try {
      await fetchWithAuth("/services/account/actions/editShow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedShow),
      });

      let imagesToDelete: string[] = [];

      if (
        theShow?.horKey !== originalShow?.horKey &&
        originalShow?.horKey != null
      ) {
        imagesToDelete.push(originalShow.horKey);
      }

      if (
        theShow?.verKey !== originalShow?.verKey &&
        originalShow?.verKey != null
      ) {
        imagesToDelete.push(originalShow.verKey);
      }

      await deleteImages(imagesToDelete);
      getShowInfo();

      setImages({});
      setResetCounter(resetCounter + 1);
      setAlertText("Galeri başarıyla kaydedildi.");
    } catch (err: any) {
      setDialogueText(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const clearFile = (imageKey: string) => {
    setTheShow((prev) => ({ ...prev, [imageKey]: null }));
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

      <div
        className={`relative`}
      >
        {isEditing && (
          <span className="loading loading-xl absolute left-1/2 top-1/2 z-50 loading-spinner blur-none! opacity-100! text-accent"></span>
        )}

      <div
        className={`  ${isEditing ? "opacity-35 blur-sm pointer-events-none" : ""} relative`}
      >
        <ImageCollection
          config={EVENT_IMAGE_CONFIG}
          onChange={setImages}
          entityId={id}
          clearFile={clearFile}
          key={resetCounter}
        />
      </div>
      </div>

      <button
        disabled={isEditing}
        className="btn btn-success text-white mt-2"
        onClick={() => {
          submit();
        }}
      >
        Kaydet
      </button>

      <DialogModal
        open={dialogueOpen}
        dialogueText={dialogueText}
        onClose={() => {
          setDialogueOpen(false);
          setDialogueText("");
        }}
      ></DialogModal>

      <SuccessAlert
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        alertText={alertText}
      ></SuccessAlert>
    </>
  );
}
