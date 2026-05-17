"use client";

import { useState, useEffect, useRef } from "react";
import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import DataTable from "@/src/components/DataTable";
import { generateId } from "@/src/lib/generateId";

import type { ShowType } from "@/src/models/ShowType";
import type { Column } from "@/src/models/dataTable/Column";
import DialogModal from "@/src/components/alerts/DialogModal";
import SuccessAlert from "@/src/components/alerts/SuccessAlert";
import FileDropzone, { FileDropzoneRef } from "@/src/components/FileDropzone";
import FormContainer from "@/src/components/forms/FormContainer";

export default function shows() {
  //Fetched
  const [shows, setShows] = useState<ShowType[]>([]);

  //ADD Show
  const [showName, setShowName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<{
    original: File;
    thumbnail: File;
  } | null>(null);

  const [newImageFiles, setNewImageFiles] = useState<{
    original: File;
    thumbnail: File;
  } | null>(null);

  //EditShow
  const [isEditing, setIsEditing] = useState(false);
  const [editedShow, setEditedShow] = useState<ShowType>();
  const [editDialogueOpen, setEditDialogueOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState("");
  const [imagesToDelete, setImagesToDelete] = useState({
    original: "",
    thumbnail: "",
  });

  const [originalShow, setOriginalShow] = useState<ShowType | null>(null);

  //Alerts
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [dialogueText, setDialogueText] = useState("");
  const [alertText, setAlertText] = useState("");

  //Refs
  const dropzoneRef = useRef<FileDropzoneRef>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const resetForm = async () => {
    dropzoneRef.current?.cleanUp();
  };

  const showColumns: Column<ShowType>[] = [
    {
      key: "showName",
      label: "Gösteri Adı",
      searchable: true,
      filterType: "multi",
    },
    {
      key: "description",
      label: "Gösteri Açıklaması",
      filterType: "none",
      overflow: true,
    },
    {
      key: "imageKey",
      label: "Kapak Fotoğrafı",
      filterType: "none",
      render: (row) =>
        row.imageThumbKey ? (
          <img
            className="w-full sm:max-w-64 h-auto"
            src={`https://cocukakli.blob.core.windows.net/public-images/${row.imageThumbKey}`}
            alt="Gösteri Fotoğrafı"
          />
        ) : null,
    },
    {
      key: "showID",
      label: "Düzenle",
      filterType: "none",
      render: (row) => (
        <button
          onClick={() => {
            handleOpenEdit(row);
          }}
          className="bg-white p-1 rounded-md hover:bg-red-500 duration-200 transition-colors border border-black"
        >
          <svg className="size-6 sm:size-8" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3.99997H6C4.89543 3.99997 4 4.8954 4 5.99997V18C4 19.1045 4.89543 20 6 20H18C19.1046 20 20 19.1045 20 18V12M18.4142 8.41417L19.5 7.32842C20.281 6.54737 20.281 5.28104 19.5 4.5C18.7189 3.71895 17.4526 3.71895 16.6715 4.50001L15.5858 5.58575M18.4142 8.41417L12.3779 14.4505C12.0987 14.7297 11.7431 14.9201 11.356 14.9975L8.41422 15.5858L9.00257 12.6441C9.08001 12.2569 9.27032 11.9013 9.54951 11.6221L15.5858 5.58575M18.4142 8.41417L15.5858 5.58575"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ),
    },
  ];

  const handleOpenEdit = (showInfo: ShowType) => {
    setIsEditing(false);
    setEditedShow({ ...showInfo });
    setOriginalShow({ ...showInfo });
    setImagesToDelete({ original: "", thumbnail: "" });
    setNewImageFiles(null);
    setEditDialogueOpen(true);
    setDialogueOpen(true);
  };

  const getShows = async () => {
    const res = await fetchWithAuth("/services/account/get/getShows");
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setShows(data);
  };

  useEffect(() => {
    getShows();
  }, []);

  const createShow = async () => {
    if (!showName) {
      setDialogueText("Lütfen gösteri adını girin.");
      setDialogueOpen(true);
      return;
    }

    try {
      const res = await fetchWithAuth("/services/account/actions/addShow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showName,
          description,
          imageKey: null,
          imageThumbKey: null,
        }),
      });

      if (!res.ok) {
        const { message } = await res.json();
        setDialogueText(message);
        setDialogueOpen(true);
        return;
      }

      const { showID } = await res.json();

      // 2️⃣ Upload image (if exists)
      let uploadedPath: string | null = null;

      if (imageFiles?.original) {
        const { imageKey, imageThumbKey } = await uploadImage(
          imageFiles.original,
          imageFiles.thumbnail,
          showID,
        );

        // 3️⃣ Update show with imageKey
        await fetchWithAuth("/services/account/actions/editShow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            showID,
            showName,
            description,
            imageKey,
            imageThumbKey,
          }),
        });
      }

      // Reset UI
      resetForm();
      setShowName("");
      setDescription("");
      setImageFiles(null);

      setAlertText("Gösteri başarıyla eklendi.");
      setAlertOpen(true);
      getShows();
    } catch {
      setDialogueText("Bağlantı sorunu.");
      setDialogueOpen(true);
    }
  };

  const hasShowChanged = (
    original: ShowType,
    updated: ShowType,
    imagesToDelete: { original: string; thumbnail: string },
    newImageFiles: { original: File; thumbnail: File } | null,
  ) => {
    if (original.showName !== updated.showName) return true;
    if (original.description !== updated.description) return true;

    if (newImageFiles !== null) return true;

    if (imagesToDelete.original !== "" || imagesToDelete.thumbnail !== "") {
      return true;
    }

    return false;
  };

  const editShow = async () => {
    if (!editedShow || isEditing || editedShow?.showName == "" || !originalShow)
      return;

    if (
      !hasShowChanged(originalShow, editedShow, imagesToDelete, newImageFiles)
    ) {
      setDialogueOpen(false);
      setEditDialogueOpen(false);
      setEditedShow(undefined);
      setOriginalShow(null);
      return;
    }

    setIsEditing(true);
    let updatedShow = { ...editedShow };

    if (newImageFiles?.original && editedShow.showID) {
      const { imageKey, imageThumbKey } = await uploadImage(
        newImageFiles!.original,
        newImageFiles!.thumbnail,
        editedShow.showID,
      );

      updatedShow.imageKey = imageKey;
      updatedShow.imageThumbKey = imageThumbKey;
    }

    const res = await fetchWithAuth("/services/account/actions/editShow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedShow),
    });

    if (!res.ok) {
      const { message } = await res.json();
      setDialogueText(message);
      setEditDialogueOpen(false);
      setIsEditing(false);

      if (newImageFiles?.original) {
        await fetchWithAuth("/services/account/cdn/deleteImage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageKeys: [updatedShow.imageKey, updatedShow.imageThumbKey].filter(
              Boolean,
            ),
          }),
        });
      }

      setDialogueOpen(true);
      return;
    }

    if (imagesToDelete.original != "") {
      await fetchWithAuth("/services/account/cdn/deleteImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageKeys: [imagesToDelete.original, imagesToDelete.thumbnail].filter(
            Boolean,
          ),
        }),
      });
      updatedShow.imageKey = null;
      updatedShow.imageThumbKey = null;
    }

    setIsEditing(false);
    setDialogueOpen(false);
    setEditDialogueOpen(false);
    setEditedShow(undefined);
    setImageToDelete("");
    setImagesToDelete({ original: "", thumbnail: "" });
    setNewImageFiles(null);
    getShows();

    setAlertText("Gösteri başarıyla düzenlendi.");
    setAlertOpen(true);
  };

  useEffect(() => {
    if (dialogueOpen) {
      dialogRef.current?.focus();
    }
  }, [dialogueOpen]);

  const uploadImage = async (
    original: File,
    thumbnail: File,
    showID: number,
  ): Promise<{ imageKey: string; imageThumbKey: string }> => {
    const sasRes = await fetchWithAuth(
      "/services/account/cdn/getImageUploadSas",
      {
        method: "POST",
      },
    );

    const { uploadUrl, sasToken } = await sasRes.json();
    const UUID = generateId();
    const fileName = `show-covers/${showID}/${UUID}.webp`;
    const thumbName = `show-covers/${showID}/${UUID}_thumb.webp`;

    const oriRes = await fetch(`${uploadUrl}/${fileName}?${sasToken}`, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": original.type,
      },
      body: original,
    });

    if (!oriRes.ok) throw new Error("Upload failed");

    const thumbRes = await fetch(`${uploadUrl}/${thumbName}?${sasToken}`, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": thumbnail.type,
      },
      body: thumbnail,
    });

    if (!thumbRes.ok) throw new Error("Upload failed");

    return {
      imageKey: fileName,
      imageThumbKey: thumbName,
    };
  };

  return (
    <>
      <FormContainer title="Yeni Gösteri Ekle">
        <div>Gösteri İsmi:</div>
        <input
          maxLength={200}

          className="input input-accent  w-full"
          value={showName}
          onChange={(e) => setShowName(e.target.value)}
        ></input>
        <div>Gösteri Açıklaması:</div>
        <textarea
          className="input input-accent w-full h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <div>Kapak Resmi:</div>

        <FileDropzone
          ref={dropzoneRef}
          file={imageFiles}
          onChange={setImageFiles}
          MAX_SIZE_MB={50}
        />
        <div className="flex justify-center mt-10">
          <button
            className="btn btn-success text-white "
            onClick={() => createShow()}
          >
            GÖSTERİ EKLE
          </button>
        </div>
      </FormContainer>

      <DataTable data={shows} columns={showColumns} title="Gösteriler" />

      {dialogueOpen && (
        <DialogModal
          open={dialogueOpen}
          dialogueText={dialogueText}
          onClose={() => {
            setDialogueOpen(false);
            setDialogueText("");
            setEditDialogueOpen(false);
          }}
          width={700}
          disableClose={isEditing}
        >
          {editDialogueOpen && (
            <div className={`grid gap-2 w-[800px]`}>
              <div>Gösteri İsmi:</div>
              <input
          maxLength={200}

                className={`input input-accent w-full ${
                  editedShow?.showName == ""
                    ? "border-red-500! border-4 outline-red-500!"
                    : ""
                }`}
                value={editedShow?.showName ?? ""}
 onChange={(e) =>
                  setEditedShow((prev) =>
                    prev ? { ...prev, showName: e.target.value } : prev,
                  )
                }
              ></input>
              <div>Gösteri Açıklaması:</div>
              <textarea
                className="input input-accent w-full h-56"
                value={editedShow?.description ?? ""}
                onChange={(e) =>
                  setEditedShow((prev) =>
                    prev ? { ...prev, description: e.target.value } : prev,
                  )
                }
              ></textarea>

              <div>Kapak Fotoğrafı</div>
              {editedShow?.imageKey != null ? (
                <div className="flex justify-center">
                  <div className=" bg-gray-500   relative p-1 rounded-3xl">
                    <div>
                      <button
                        onClick={() => {
                          setImagesToDelete({
                            original: editedShow?.imageKey ?? "",
                            thumbnail: editedShow?.imageThumbKey ?? "",
                          });
                          setEditedShow((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  imageKey: null,
                                  imageThumbKey: null,
                                }
                              : prev,
                          );
                        }}
                        className="btn btn-sm btn-circle btn-error border-2 border-black absolute -top-3 -left-3"
                      >
                        ✕
                      </button>
                      <img
                        className="rounded-3xl max-w-[330px] "
                        src={`https://cocukakli.blob.core.windows.net/public-images/${editedShow?.imageKey}`}
                        alt="Gösteri Fotoğrafı"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <FileDropzone
                    ref={dropzoneRef}
                    file={newImageFiles}
                    onChange={setNewImageFiles}
                    MAX_SIZE_MB={50}
                  />
                </div>
              )}

              <div className="flex justify-center mt-2">
                <button
                  className="btn btn-success text-white"
                  onClick={() => {
                    editShow();
                  }}
                >
                  Kaydet
                </button>
              </div>
            </div>
          )}
        </DialogModal>
      )}

      <SuccessAlert open={alertOpen} onClose={() => setAlertOpen(false)}>
        {alertText}
      </SuccessAlert>
    </>
  );
}
