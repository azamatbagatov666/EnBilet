"use client";

import { useState, useEffect, useRef } from "react";
import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import type { ShowType } from "@/src/models/ShowType";
import { useRouter } from "next/navigation";
import "@/src/app/account/account.css";
import DialogModal from "@/src/components/DialogModal";
import FileDropzone from "@/src/components/FileDropzone";

export default function shows() {
  const router = useRouter();

  const [showName, setShowName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState("");

  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [dialogueText, setDialogueText] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);

  const [shows, setShows] = useState<ShowType[]>([]);

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
    if (showName != "") {
      try {
        const res = await fetchWithAuth("/services/account/actions/addShow", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            showName: showName,
            description: description,
            imageKey: "imagePath"
          }),
        });
        if (res.status === 409) {
          setDialogueText(
            "Belirttiğiniz isimde bir gösteri zaten bulunuyor.",
          );
          setDialogueOpen(true);

          return;
        } else if (!res.ok) {
          throw new Error("Failed to add show");
        }

        setShowName("");
        setDescription("");
        setImagePath("");
        setDialogueText("Gösteri başarıyla eklendi.");
        setDialogueOpen(true);

        getShows();
      } catch (err) {
        setDialogueText("Bağlantı sorunu.");
        setDialogueOpen(true);
      }
    } else {
      setDialogueText("Lütfen gösteri adını girdiğinizden emin olun.");
      setDialogueOpen(true);
    }
  };

  useEffect(() => {
    if (dialogueOpen) {
      dialogRef.current?.focus();
    }
  }, [dialogueOpen]);

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
              onFile={(file) => {
                // upload to backend here
              }}
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
        <div className=" flex justify-center my-10">
          <table className="table table-auto w-6/12 table-zebra border-2 border-black dark:border-white">
            <colgroup>
              <col />
              <col />
              <col />
              <col className="w-4" />
            </colgroup>
            <thead>
              <tr className="bg-gray-300 font-bold text-lg text-black">
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

                  <td>{show.imageKey}</td>
                  <td>
                    <div className="flex justify-center">
                      <button
      
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

      <DialogModal open={dialogueOpen} onClose={() => setDialogueOpen(false)}>
        {dialogueText}
      </DialogModal>
    </>
  );
}
