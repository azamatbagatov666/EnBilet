"use client";

import { useState, useEffect, useRef } from "react";
import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import DataTable from "@/src/components/DataTable";

import type { ShowType } from "@/src/models/ShowType";
import type { Column } from "@/src/models/dataTable/Column";
import DialogModal from "@/src/components/alerts/DialogModal";
import SuccessAlert from "@/src/components/alerts/SuccessAlert";
import EditSvg from "@/src/components/svg/EditSvg";
import GallerySvg from "@/src/components/svg/GallerySvg";
import { useRouter } from "next/navigation";

import SvgButton from "@/src/components/buttons/SvgButton";



import FormContainer from "@/src/components/forms/FormContainer";

export default function shows() {
  const router = useRouter();

  //Fetched
  const [shows, setShows] = useState<ShowType[]>([]);

  //ADD Show
  const [showName, setShowName] = useState("");
  const [description, setDescription] = useState("");




  //EditShow
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editedShow, setEditedShow] = useState<ShowType>();
  const [editDialogueOpen, setEditDialogueOpen] = useState(false);


  const [originalShow, setOriginalShow] = useState<ShowType | null>(null);

  //Alerts
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [dialogueText, setDialogueText] = useState("");
  const [alertText, setAlertText] = useState("");





  const showColumns: Column<ShowType>[] = [
    {
      key: "showName",
      label: "Gösteri İsmi",
      searchable: true,
      filterType: "multi",
      sortable: true,
    },
    {
      key: "description",
      label: "Gösteri Açıklaması",
      filterType: "none",
      overflow: true,
    },

        {
      key: "showID",
      label: "Galeri",
      filterType: "none",
      render: (row) => (
                <SvgButton onClick={() =>
                    router.push(`/account/shows/gallery/${row.showID}`)
                  }>
                  <GallerySvg/>
                </SvgButton>
      

      ),
    },

    {
      key: "showID",
      label: "Düzenle",
      filterType: "none",
      reactKey: "edit",
      render: (row) => (
        <SvgButton onClick={() =>
            handleOpenEdit(row)
          }>
          <EditSvg/>
        </SvgButton>
      ),
    },
  ];

  const handleOpenEdit = (showInfo: ShowType) => {
    setIsEditing(false);
    setEditedShow({ ...showInfo });
    setOriginalShow({ ...showInfo });
    setEditDialogueOpen(true);
    setDialogueOpen(true);
  };

  const getShows = async () => {
    try {
      const res = await fetchWithAuth("/services/account/get/getShows");

      const data = await res.json();
      setShows(data);
    } catch (err: any) {
      return;
    }
  };

  useEffect(() => {
    getShows();
  }, []);

  const createShow = async () => {
    if (!showName && !isAdding) {
      setDialogueText("Lütfen gösteri ismini girin.");
      return;
    }

    setIsAdding(true);

    try {
      const res = await fetchWithAuth("/services/account/actions/addShow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showName,
          description,
          horKey: null,
          verKey: null,
        }),
      });


     

      setShowName("");
      setDescription("");

      setAlertText("Gösteri başarıyla eklendi.");
      getShows();
    } catch (err: any) {
      setDialogueText(err.message || "Bağlantı sorunu.");
    } finally {
      setIsAdding(false);
    }
  };

  const hasShowChanged = (
    original: ShowType,
    updated: ShowType,

  ) => {
    if (original.showName !== updated.showName) return true;
    if (original.description !== updated.description) return true;





    return false;
  };

  const editShow = async () => {
    if (!editedShow || isEditing || editedShow?.showName == "" || !originalShow)
      return;

    if (
      !hasShowChanged(originalShow, editedShow)
    ) {
      setDialogueOpen(false);
      setEditDialogueOpen(false);
      setEditedShow(undefined);
      setOriginalShow(null);
      return;
    }

    setIsEditing(true);
    const updatedShow = {
      showID: editedShow.showID,
      showName: editedShow.showName,
      description: editedShow.description,
      horKey: editedShow.horKey,
      verKey: editedShow.verKey,
    };



    try {
      await fetchWithAuth("/services/account/actions/editShow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedShow),
      });



      setIsEditing(false);
      setDialogueOpen(false);
      setEditDialogueOpen(false);
      setEditedShow(undefined);
      getShows();

      setAlertText("Gösteri başarıyla düzenlendi.");
    } catch (err: any) {
      setEditDialogueOpen(false);
      setIsEditing(false);



      setDialogueText(err.message);

      return;
    } finally {
    }
  };

  return (
    <>
      <FormContainer title="Yeni Gösteri Ekle" inProgress={isAdding}>
        <span>Gösteri İsmi:</span>
        <input
          maxLength={200}
          className="input input-accent  w-full"
          value={showName}
          onChange={(e) => setShowName(e.target.value)}
        ></input>
        <span>Gösteri Açıklaması:</span>
        <textarea
          className="textarea textarea-accent w-full h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
     
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
            <span>Gösteri İsmi:</span>
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
            <span>Gösteri Açıklaması:</span>
            <textarea
              className="textarea textarea-accent w-full h-56"
              value={editedShow?.description ?? ""}
              onChange={(e) =>
                setEditedShow((prev) =>
                  prev ? { ...prev, description: e.target.value } : prev,
                )
              }
            ></textarea>

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

      <SuccessAlert
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        alertText={alertText}
      ></SuccessAlert>
    </>
  );
}
