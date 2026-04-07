"use client";

import { useState, useEffect, useRef } from "react";
import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import DataTable from "@/src/components/DataTable";
import type { Column } from "@/src/models/dataTable/Column";
import type { VenueType } from "@/src/models/VenueType";
import { useRouter } from "next/navigation";
import DialogModal from "@/src/components/alerts/DialogModal";
import SuccessAlert from "@/src/components/alerts/SuccessAlert";
import FormContainer from "@/src/components/forms/FormContainer";

export default function venues() {
  const router = useRouter();

  //Constant
  const cities = [
    "Adana",
    "Adıyaman",
    "Afyonkarahisar",
    "Ağrı",
    "Aksaray",
    "Amasya",
    "Ankara",
    "Antalya",
    "Ardahan",
    "Artvin",
    "Aydın",
    "Balıkesir",
    "Bartın",
    "Batman",
    "Bayburt",
    "Bilecik",
    "Bingöl",
    "Bitlis",
    "Bolu",
    "Burdur",
    "Bursa",
    "Çanakkale",
    "Çankırı",
    "Çorum",
    "Denizli",
    "Diyarbakır",
    "Düzce",
    "Edirne",
    "Elazığ",
    "Erzincan",
    "Erzurum",
    "Eskişehir",
    "Gaziantep",
    "Giresun",
    "Gümüşhane",
    "Hakkari",
    "Hatay",
    "Iğdır",
    "Isparta",
    "İstanbul Anadolu",
    "İstanbul Avrupa",
    "İzmir",
    "Kahramanmaraş",
    "Karabük",
    "Karaman",
    "Kars",
    "Kastamonu",
    "Kayseri",
    "Kırıkkale",
    "Kırklareli",
    "Kırşehir",
    "Kilis",
    "Kocaeli",
    "Konya",
    "Kütahya",
    "Malatya",
    "Manisa",
    "Mardin",
    "Mersin",
    "Muğla",
    "Muş",
    "Nevşehir",
    "Niğde",
    "Ordu",
    "Osmaniye",
    "Rize",
    "Sakarya",
    "Samsun",
    "Siirt",
    "Sinop",
    "Sivas",
    "Şanlıurfa",
    "Şırnak",
    "Tekirdağ",
    "Tokat",
    "Trabzon",
    "Tunceli",
    "Uşak",
    "Van",
    "Yalova",
    "Yozgat",
    "Zonguldak",
  ];

  //ToAdd
  const [selectedCity, setSelectedCity] = useState("");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");

  //ToEdit
  const [isEditing, setIsEditing] = useState(false);
  const [editedVenue, setEditedVenue] = useState<VenueType>();
  const [editDialogueOpen, setEditDialogueOpen] = useState(false);
  const [originalVenue, setOriginalVenue] = useState<VenueType | null>(null);

  //Alerts
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [dialogueText, setDialogueText] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");

  //Refs
  const dialogRef = useRef<HTMLDialogElement>(null);

  //Fetched
  const [venues, setVenues] = useState<VenueType[]>([]);

  const handleOpenEdit = (venueInfo: VenueType) => {
    setIsEditing(false);
        setEditedVenue({ ...venueInfo }); 
    setOriginalVenue({ ...venueInfo }); 
    setEditDialogueOpen(true);
    setDialogueOpen(true);
  };

  const getAllVenues = async () => {
    const res = await fetchWithAuth("/services/account/get/getAllVenues");
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setVenues(data);
  };

  const createVenue = async () => {
    if (selectedCity != "" && venueName != "" && address != "") {
      try {
        const res = await fetchWithAuth("/services/account/actions/addVenue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            venueName: venueName,
            city: selectedCity,
            address: address,
          }),
        });
        if (res.status === 409) {
          setDialogueText(
            "Seçtiğiniz şehirde belirttiğiniz isimde bir salon zaten bulunuyor.",
          );
          setDialogueOpen(true);

          return;
        } else if (!res.ok) {
          throw new Error("Failed to add venue");
        }

        setSelectedCity("");
        setVenueName("");
        setAddress("");
        setAlertText("Salon başarıyla eklendi.");
        setAlertOpen(true);

        getAllVenues();
      } catch (err) {
        setDialogueText("Bağlantı sorunu.");
        setDialogueOpen(true);
      }
    } else {
      setDialogueText(
        "Lütfen şehir, salon ismi ve adres bilgilerini eksiksiz olarak doldurduğunuzdan emin olun.",
      );
      setDialogueOpen(true);
    }
  };

const hasVenueChanged = (
  original: VenueType,
  updated: VenueType,
) =>
  Object.keys(original).some(
    (key) =>
      original[key as keyof VenueType] !==
      updated[key as keyof VenueType],
  );

  const editVenue = async () => {
    if (!editedVenue || isEditing || editedVenue?.venueName == "" || !originalVenue ) return;

        if (
    !hasVenueChanged(
      originalVenue,
      editedVenue,
    )
  ) {
    setDialogueOpen(false);
    setEditDialogueOpen(false);
    setEditedVenue(undefined);
    setOriginalVenue(null);
    return;
  }

    setIsEditing(true);
    let updatedVenue = { ...editedVenue };

    await fetchWithAuth("/services/account/actions/editVenue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedVenue),
    });

    setIsEditing(false);
    setDialogueOpen(false);
    setEditDialogueOpen(false);
    setEditedVenue(undefined);
    getAllVenues();

    setAlertText("Salon başarıyla düzenlendi.");
    setAlertOpen(true);
  };

  useEffect(() => {
    getAllVenues();
  }, []);

  useEffect(() => {
    if (dialogueOpen) {
      dialogRef.current?.focus();
    }
  }, [dialogueOpen]);


  const venueColumns: Column<VenueType>[] = [
    { key: "city", label: "Şehir", searchable: true, filterType: "multi" },
    { key: "venueName", label: "Salon", searchable: true, filterType: "multi" },

    { key: "address", label: "Adres", searchable: true, filterType: "none" },
    { key: "venueID", label: "Oturma Planı", filterType: "none",   reactKey: "venue-plan",
render:  (row) => (
                      <button
                        onClick={() =>
                          router.push(
                            `/account/venues/designSeats/${row.venueID}`,
                          )
                        }
                        className="bg-white p-1 rounded-md hover:bg-red-500 duration-200 transition-colors border border-black"
                      >
                        <svg
                          fill="#000000"
                          height="32px"
                          width="32px"
                          viewBox="0 0 512 512"
                        >
                          <path d="M490.667,170.667H448c-11.782,0-21.333,9.551-21.333,21.333s9.551,21.333,21.333,21.333h21.333V320h-21.74 c-2.857-22.522-21.029-40.261-43.757-42.436L389.148,78.092C386.637,34.284,349.242,0,304.256,0h-96.512 c-44.986,0-82.381,34.284-84.914,78.437l-14.667,199.127c-22.728,2.175-40.9,19.914-43.757,42.436h-21.74V213.333H64 c11.782,0,21.333-9.551,21.333-21.333S75.782,170.667,64,170.667H21.333C9.551,170.667,0,180.218,0,192v149.333 c0,11.782,9.551,21.333,21.333,21.333H64V384c0,11.782,9.551,21.333,21.333,21.333h21.333v85.333 c0,11.782,9.551,21.333,21.333,21.333h64c11.782,0,21.333-9.551,21.333-21.333v-85.333h85.333v85.333 c0,11.782,9.551,21.333,21.333,21.333h64c11.782,0,21.333-9.551,21.333-21.333v-85.333h21.333 c11.782,0,21.333-9.551,21.333-21.333v-21.333h42.667c11.782,0,21.333-9.551,21.333-21.333V192 C512,180.218,502.449,170.667,490.667,170.667z M165.404,81.225c1.244-21.64,19.698-38.559,42.34-38.559h96.512 c22.642,0,41.096,16.918,42.318,38.214l14.464,196.453H150.962L165.404,81.225z M170.667,469.333h-21.333v-64h21.333V469.333z M362.667,469.333h-21.333v-64h21.333V469.333z M405.333,362.667H384h-64H192h-64h-21.333v-36.459 c0-3.429,2.779-6.208,6.208-6.208H128h256h15.125c3.429,0,6.208,2.779,6.208,6.208V362.667z"></path>{" "}
                        </svg>
                      </button>

      ),  },
    { key: "venueID", label: "Düzenle", filterType: "none",   reactKey: "venue-edit",
 render:  (row) => (
                            <button
                        onClick={() => {
                          handleOpenEdit(row);
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

      ), },
  ];

  return (
    <>
      <FormContainer title="Yeni Salon Ekle">
        <div>Şehir Seçiniz:</div>
        <select
          className="select select-accent w-full"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="" disabled>
            Şehir seçiniz.
          </option>

          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <div>Salon İsmi:</div>

        <input
          className="input input-accent w-full"
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
        ></input>
        <div>Salonun Adresi:</div>

        <input
          className="input input-accent w-full"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        ></input>
        <div className="flex justify-center mt-4">
          <button className="btn btn-success  " onClick={() => createVenue()}>
            SALON EKLE
          </button>
        </div>
      </FormContainer>

      <DataTable data={venues} columns={venueColumns} title="Salonlar" />




      <DialogModal
        open={dialogueOpen}
        onClose={() => {
          setDialogueOpen(false);
          setEditDialogueOpen(false);
        }}
        disableClose={isEditing}
      >
        {dialogueText}
        {editDialogueOpen && (
          <>
            <div className={`grid gap-2 w-[500px]`}>
              <div>Şehir Seçiniz:</div>
              <select
                className="select select-accent   "
                value={editedVenue?.city ?? ""}
                onChange={(e) =>
                  setEditedVenue((prev) =>
                    prev ? { ...prev, city: e.target.value } : prev,
                  )
                }
              >
                <option value="" disabled>
                  Şehir seçiniz.
                </option>

                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <div>Salon İsmi:</div>

              <input
                className={`input input-accent ${
                  editedVenue?.venueName == ""
                    ? "!border-red-500 border-4 !outline-red-500"
                    : ""
                }`}
                value={editedVenue?.venueName ?? ""}
                onChange={(e) =>
                  setEditedVenue((prev) =>
                    prev ? { ...prev, venueName: e.target.value } : prev,
                  )
                }
              ></input>
              <div>Salonun Adresi:</div>

              <input
                className="input input-accent  "
                value={editedVenue?.address ?? ""}
                onChange={(e) =>
                  setEditedVenue((prev) =>
                    prev ? { ...prev, address: e.target.value } : prev,
                  )
                }
              ></input>
              <div className="flex justify-center mt-4">
                <button
                  className="btn btn-success  "
                  onClick={() => editVenue()}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </>
        )}
      </DialogModal>

      <SuccessAlert open={alertOpen} onClose={() => setAlertOpen(false)}>
        {alertText}
      </SuccessAlert>
    </>
  );
}
