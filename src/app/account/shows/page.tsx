"use client";

import { useState, useEffect, useRef } from "react";
import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import type { ShowType } from "@/src/models/ShowType";
import "@/src/app/account/account.css";
import DialogModal from "@/src/components/DialogModal";
import SuccessAlert from "@/src/components/SuccessAlert";
import FileDropzone, { FileDropzoneRef } from "@/src/components/FileDropzone";

export default function shows() {
  const [showName, setShowName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editedShow, setEditedShow] = useState<ShowType>();
  const [editDialogueOpen, setEditDialogueOpen] = useState(false);
  const [shows, setShows] = useState<ShowType[]>([]);

  const [imageToDelete, setImageToDelete] = useState("");

  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [dialogueText, setDialogueText] = useState("");
  const [alertText, setAlertText] = useState("");

  const dropzoneRef = useRef<FileDropzoneRef>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const resetForm = async () => {
    dropzoneRef.current?.cleanUp();
  };

  const handleOpenEdit = (showInfo: ShowType) => {
    setIsEditing(false);
    setEditedShow(showInfo);
    setImageToDelete("");
    setNewImageFile(null);
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
        }),
      });

      if (res.status === 409) {
        setDialogueText("Belirttiğiniz isimde bir gösteri zaten bulunuyor.");
        setDialogueOpen(true);
        return;
      }

      if (!res.ok) throw new Error();

      const { showID } = await res.json();

      // 2️⃣ Upload image (if exists)
      let uploadedPath: string | null = null;

      if (imageFile) {
        uploadedPath = await uploadImage(imageFile, showID);

        // 3️⃣ Update show with imageKey
        await fetchWithAuth("/services/account/actions/editShow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            showID,
            showName,
            description,
            imageKey: uploadedPath,
          }),
        });
      }

      // Reset UI
      resetForm();
      setShowName("");
      setDescription("");
      setImageFile(null);

      setAlertText("Gösteri başarıyla eklendi.");
      setAlertOpen(true);
      getShows();
    } catch {
      setDialogueText("Bağlantı sorunu.");
      setDialogueOpen(true);
    }
  };

  const editShow = async () => {
    if (!editedShow || isEditing) return;

    setIsEditing(true);
    let updatedShow = { ...editedShow };

    if (imageToDelete) {
      await fetchWithAuth("/services/account/cdn/deleteImage", {
        method: "POST",

        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageKey: imageToDelete }),
      });
      updatedShow.imageKey = null;
    }

    if (newImageFile && editedShow.showID) {
      const uploadedPath = await uploadImage(newImageFile, editedShow.showID);
      updatedShow.imageKey = uploadedPath;
    }

    await fetchWithAuth("/services/account/actions/editShow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedShow),
    });

    //setIsEditing(false)
    //setDialogueOpen(false);
    //setEditDialogueOpen(false);
    setEditedShow(undefined);
    setImageToDelete("");
    setNewImageFile(null);
    getShows();

    setAlertText("Gösteri başarıyla düzenlendi.");
    setAlertOpen(true);
  };

  useEffect(() => {
    if (dialogueOpen) {
      dialogRef.current?.focus();
    }
  }, [dialogueOpen]);

  const uploadImage = async (file: File, showID: number): Promise<string> => {
    const sasRes = await fetchWithAuth(
      "/services/account/cdn/getImageUploadSas",
      {
        method: "POST",
      },
    );

    const { uploadUrl, sasToken } = await sasRes.json();

    const ext = file.name.split(".").pop();
    const fileName = `show-covers/${showID}/${crypto.randomUUID()}.${ext}`;

    const res = await fetch(`${uploadUrl}/${fileName}?${sasToken}`, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!res.ok) throw new Error("Upload failed");

    return fileName;
  };

  return (
    <>
      <div>
        <div className="mt-4 flex justify-center ">
          <div className="grid gap-2 w-[500px]">
            <div>Gösteri İsmi:</div>
            <input
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
              file={imageFile}
              onChange={(file) => setImageFile(file)}
            />
          </div>
        </div>
        <div className="flex justify-center mt-10">
          <button className="btn btn-success  " onClick={() => createShow()}>
            GÖSTERİ EKLE
          </button>
        </div>
      </div>
      <div>
        <div className="  my-10">
          <div className="overflow-x-auto flex justify-center">
            <table className="table sm:table-auto sm:w-6/12 table-zebra border-2 border-black dark:border-white">
              <colgroup>
                <col />
                <col />
                <col />
                <col className="w-4" />
              </colgroup>
              <thead>
                <tr className="bg-gray-300 font-bold text-lg text-black text-center">
                  <th>Gösteri Adı</th>
                  <th>Gösteri Açıklaması</th>
                  <th>Kapak Fotoğrafı</th>
                  <th>Düzenle</th>
                </tr>
              </thead>

              <tbody>
                {shows.map((show) => (
                  <tr className="font-bold" key={show.showID}>
                    <td>{show.showName}</td>

                    <td>{show.description}</td>

                    <td className="place-items-center">
                      {show.imageKey != null && (
                        <img
                          className="w-full sm:max-w-64 h-auto "
                          src={`https://cocukakli.blob.core.windows.net/public-images/${show.imageKey}`}
                          alt="Gösteri Fotoğrafı"
                        />
                      )}
                    </td>
                    <td>
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            handleOpenEdit(show);
                          }}
                          className="bg-white p-1 rounded-md hover:bg-red-500 duration-200 transition-colors border border-black"
                        >
                          <svg
                            width="32px"
                            height="32px"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 3.99997H6C4.89543 3.99997 4 4.8954 4 5.99997V18C4 19.1045 4.89543 20 6 20H18C19.1046 20 20 19.1045 20 18V12M18.4142 8.41417L19.5 7.32842C20.281 6.54737 20.281 5.28104 19.5 4.5C18.7189 3.71895 17.4526 3.71895 16.6715 4.50001L15.5858 5.58575M18.4142 8.41417L12.3779 14.4505C12.0987 14.7297 11.7431 14.9201 11.356 14.9975L8.41422 15.5858L9.00257 12.6441C9.08001 12.2569 9.27032 11.9013 9.54951 11.6221L15.5858 5.58575M18.4142 8.41417L15.5858 5.58575"
                              stroke="#000000"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {dialogueOpen && (
        <DialogModal open={dialogueOpen} onClose={() => setDialogueOpen(false)}>
          {dialogueText}
          {editDialogueOpen && (
            <div
              className={`grid gap-2 w-[500px] ${isEditing ? "pointer-events-none blur-sm opacity-35" : ""}`}
            >
              <div>Gösteri İsmi:</div>
              <input
                className="input input-accent  w-full"
                value={editedShow?.showName ?? ""}
                onChange={(e) =>
                  setEditedShow((prev) =>
                    prev ? { ...prev, showName: e.target.value } : prev,
                  )
                }
              ></input>
              <div>Gösteri Açıklaması:</div>
              <textarea
                className="input input-accent w-full h-28"
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
                          setImageToDelete(editedShow?.imageKey ?? "");
                          setEditedShow((prev) =>
                            prev ? { ...prev, imageKey: null } : prev,
                          );
                        }}
                        className="btn btn-sm btn-circle btn-error border-2 border-black absolute -top-3 -left-3"
                      >
                        ✕
                      </button>
                      <img
                        className="rounded-3xl"
                        src={`https://cocukakli.blob.core.windows.net/public-images/${editedShow?.imageKey}`}
                        alt="Gösteri Fotoğrafı"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <FileDropzone
                  ref={dropzoneRef}
                  file={newImageFile}
                  onChange={(file) => setNewImageFile(file)}
                />
              )}

              <div className="flex justify-center mt-10">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    editShow();
                  }}
                >
                  Kaydet
                </button>
              </div>
            </div>
          )}
          {isEditing && (
            <span className="loading loading-spinner loading-lg absolute top-2/4"></span>
          )}
        </DialogModal>
      )}

      {alertOpen && (
        <SuccessAlert open={alertOpen} onClose={() => setAlertOpen(false)}>
          {alertText}
        </SuccessAlert>
      )}
    </>
  );
}
