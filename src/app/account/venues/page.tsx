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
import EditSvg from "@/src/components/svg/EditSvg";
import SvgButton from "@/src/components/buttons/SvgButton";



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
  const [isAdding, setIsAdding] = useState(false);

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
    try {
      const res = await fetchWithAuth("/services/account/get/getAllVenues");

      const data = await res.json();
      setVenues(data);
    } catch (err: any) {
      return;
    }
  };

  const createVenue = async () => {
    if (selectedCity != "" && venueName != "" && address != "" && !isAdding) {
      setIsAdding(true);

      try {
        await fetchWithAuth("/services/account/actions/addVenue", {
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

        setSelectedCity("");
        setVenueName("");
        setAddress("");
        setIsAdding(false);

        setAlertText("Salon başarıyla eklendi.");

        getAllVenues();
      } catch (err: any) {
        setDialogueText(err.message);
      } finally {
        setIsAdding(false);
      }
    } else {
      setDialogueText(
        "Lütfen şehir, salon ismi ve adres bilgilerini eksiksiz olarak doldurduğunuzdan emin olun.",
      );

      setIsAdding(false);
    }
  };

  const hasVenueChanged = (original: VenueType, updated: VenueType) =>
    Object.keys(original).some(
      (key) =>
        original[key as keyof VenueType] !== updated[key as keyof VenueType],
    );

  const editVenue = async () => {
    if (
      !editedVenue ||
      isEditing ||
      editedVenue?.venueName == "" ||
      !originalVenue
    )
      return;

    if (!hasVenueChanged(originalVenue, editedVenue)) {
      setDialogueOpen(false);
      setEditDialogueOpen(false);
      setEditedVenue(undefined);
      setOriginalVenue(null);
      return;
    }

    setIsEditing(true);

    try {
      await fetchWithAuth("/services/account/actions/editVenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedVenue),
      });

      setDialogueOpen(false);
      setEditDialogueOpen(false);
      setEditedVenue(undefined);

      getAllVenues();

      setAlertText("Salon başarıyla düzenlendi.");
    } catch (err: any) {
      setDialogueText(err.message);
    } finally {
      setEditDialogueOpen(false);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    getAllVenues();
  }, []);

  const venueColumns: Column<VenueType>[] = [
    {
      key: "city",
      label: "Şehir",
      searchable: true,
      filterType: "multi",
      sortable: true,
    },
    {
      key: "venueName",
      label: "Salon",
      searchable: true,
      filterType: "multi",
      sortable: true,
    },

    { key: "address", label: "Adres", searchable: true, filterType: "none" },
    {
      key: "venueID",
      label: "Oturma Planı",
      filterType: "none",
      reactKey: "venue-plan",
      render: (row) => (
        <SvgButton onClick={() =>
            router.push(`/account/venues/designSeats/${row.venueID}`)
          }>
          <svg
            viewBox="0 0 512 512"
            className="fill-black dark:fill-white size-6 sm:size-8"
          >
            <path d="M490.667,170.667H448c-11.782,0-21.333,9.551-21.333,21.333s9.551,21.333,21.333,21.333h21.333V320h-21.74 c-2.857-22.522-21.029-40.261-43.757-42.436L389.148,78.092C386.637,34.284,349.242,0,304.256,0h-96.512 c-44.986,0-82.381,34.284-84.914,78.437l-14.667,199.127c-22.728,2.175-40.9,19.914-43.757,42.436h-21.74V213.333H64 c11.782,0,21.333-9.551,21.333-21.333S75.782,170.667,64,170.667H21.333C9.551,170.667,0,180.218,0,192v149.333 c0,11.782,9.551,21.333,21.333,21.333H64V384c0,11.782,9.551,21.333,21.333,21.333h21.333v85.333 c0,11.782,9.551,21.333,21.333,21.333h64c11.782,0,21.333-9.551,21.333-21.333v-85.333h85.333v85.333 c0,11.782,9.551,21.333,21.333,21.333h64c11.782,0,21.333-9.551,21.333-21.333v-85.333h21.333 c11.782,0,21.333-9.551,21.333-21.333v-21.333h42.667c11.782,0,21.333-9.551,21.333-21.333V192 C512,180.218,502.449,170.667,490.667,170.667z M165.404,81.225c1.244-21.64,19.698-38.559,42.34-38.559h96.512 c22.642,0,41.096,16.918,42.318,38.214l14.464,196.453H150.962L165.404,81.225z M170.667,469.333h-21.333v-64h21.333V469.333z M362.667,469.333h-21.333v-64h21.333V469.333z M405.333,362.667H384h-64H192h-64h-21.333v-36.459 c0-3.429,2.779-6.208,6.208-6.208H128h256h15.125c3.429,0,6.208,2.779,6.208,6.208V362.667z"></path>{" "}
          </svg>
        </SvgButton>

      ),
    },
    {
      key: "venueID",
      label: "Düzenle",
      filterType: "none",
      reactKey: "venue-edit",
      render: (row) => (
        <SvgButton onClick={() =>
            handleOpenEdit(row)
          }>
          <EditSvg/>
        </SvgButton>
      ),
    },
  ];

  return (
    <>
      <FormContainer title="Yeni Salon Ekle" inProgress={isAdding}>
        <span>Şehir Seçiniz:</span>
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
        <span>Salon İsmi:</span>

        <input
          className="input input-accent w-full"
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
          maxLength={200}
        ></input>
        <span>Salonun Adresi:</span>

        <input
          className="input input-accent w-full"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          maxLength={500}
        ></input>
        <div className="flex justify-center mt-4">
          <button
            className="btn btn-success  text-white"
            onClick={() => createVenue()}
          >
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
          setDialogueText("");
        }}
        disableClose={isEditing}
        dialogueText={dialogueText}
      >
        {editDialogueOpen && (
          <>
            <div className={`grid gap-2 w-[500px]`}>
              <span>Şehir Seçiniz:</span>
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
              <span>Salon İsmi:</span>

              <input
                maxLength={200}
                className={`input input-accent ${
                  editedVenue?.venueName == ""
                    ? "border-red-500! border-4 outline-red-500!"
                    : ""
                }`}
                value={editedVenue?.venueName ?? ""}
                onChange={(e) =>
                  setEditedVenue((prev) =>
                    prev ? { ...prev, venueName: e.target.value } : prev,
                  )
                }
              ></input>
              <span>Salonun Adresi:</span>

              <input
                maxLength={500}
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
                  className="btn btn-success text-white "
                  onClick={() => editVenue()}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </>
        )}
      </DialogModal>

      <SuccessAlert open={alertOpen} onClose={() => setAlertOpen(false)} alertText={alertText}>
      </SuccessAlert>
    </>
  );
}
