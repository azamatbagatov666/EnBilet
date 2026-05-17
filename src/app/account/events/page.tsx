"use client";

import { useState, useEffect } from "react";
import type { EventType } from "@/src/models/EventType";
import type { Column } from "@/src/models/dataTable/Column";
import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import DataTable from "@/src/components/DataTable";
import DialogModal from "@/src/components/alerts/DialogModal";
import SuccessAlert from "@/src/components/alerts/SuccessAlert";
import FormContainer from "@/src/components/forms/FormContainer";
import { useRouter } from "next/navigation";

export default function List() {
  const router = useRouter();

  //fetched
  const [events, setEvents] = useState<EventType[]>([]);
  const [shows, setShows] = useState<Record<number, string>>({});
  const [venues, setVenues] = useState<Record<number, string>>({});
  const [cities, setCities] = useState([]);

  //add
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedShow, setSelectedShow] = useState<number | "">("");
  const [selectedVenue, setSelectedVenue] = useState<number | "">("");
  const [time, setTime] = useState("");
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  //alerts
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [dialogueText, setDialogueText] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");

  //ToEdit
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<EventType>();
  const [editDialogueOpen, setEditDialogueOpen] = useState(false);
  const [originalEvent, setOriginalEvent] = useState<EventType | null>(null);
  const [editVenues, setEditVenues] = useState<Record<number, string>>({});

  const handleOpenEdit = (eventInfo: EventType) => {
    setIsEditing(false);
    setEditedEvent({ ...eventInfo });
    setOriginalEvent({ ...eventInfo });
    setEditDialogueOpen(true);
    setDialogueOpen(true);
  };

  const hasEventChanged = (original: EventType, updated: EventType) =>
    Object.keys(original).some(
      (key) =>
        original[key as keyof EventType] !== updated[key as keyof EventType],
    );

  const editEvent = async () => {
    if (!editedEvent || isEditing || !originalEvent) return;

    if (!hasEventChanged(originalEvent, editedEvent)) {
      setDialogueOpen(false);
      setEditDialogueOpen(false);
      setEditedEvent(undefined);
      setOriginalEvent(null);
      return;
    }

    setIsEditing(true);
    const updatedEvent = {
      eventID: editedEvent.eventID,
      showID: editedEvent.showID,
      venueID: editedEvent.venueID,
      date: toDateTimeLocal(editedEvent.date),
      ticketSale: editedEvent.ticketSale,
      isPublic: editedEvent.isPublic,
    };

    const res = await fetchWithAuth("/services/account/actions/editEvent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEvent),
    });

    if (res.ok) {
          setIsEditing(false);
    setDialogueOpen(false);
    setEditDialogueOpen(false);
    setEditedEvent(undefined);
    getEvents();

    setAlertText("Etkinlik başarıyla düzenlendi.");
    setAlertOpen(true);


    } else {

  const { message } = await res.json();

    setIsEditing(false);
    setEditDialogueOpen(false);
    setEditedEvent(undefined);


  setDialogueText(message);
  setDialogueOpen(true)

    }


  };

  const createEvent = async () => {
    if (selectedVenue != "" && time != "") {
      try {
        const res = await fetchWithAuth("/services/account/actions/addEvent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            venueID: selectedVenue,
            showID: selectedShow,
            date: time,
          }),
        });
        if (!res.ok) {
  const { message } = await res.json();
  setDialogueText(message);
  setDialogueOpen(true)
  return
}

        clearForm();

        setAlertText("Etkinlik başarıyla eklendi.");
        setAlertOpen(true);

        getEvents();
      } catch (err) {
        setDialogueText("Bağlantı sorunu.");
        setDialogueOpen(true);
      }
    }
  };

  const fetchVenuesByCity = async (
    city: string,
    setter: React.Dispatch<React.SetStateAction<Record<number, string>>>,
  ): Promise<Record<number, string>> => {
    const res = await fetchWithAuth(
      `/services/account/get/getVenues?city=${city}`,
    );

    if (!res.ok) {
      throw new Error("Failed to fetch venues");
    }

    const data: { venueID: number; venueName: string }[] = await res.json();

    const venuesObject = Object.fromEntries(
      data.map((v) => [v.venueID, v.venueName]),
    );

    setter(venuesObject);
    return venuesObject; // ✅ ALWAYS returns
  };

  useEffect(() => {
    if (!selectedCity) return;

    (async () => {
      const venuesObject = await fetchVenuesByCity(selectedCity, setVenues);

      const firstVenueId = Object.keys(venuesObject)[0];
      setSelectedVenue(firstVenueId ? Number(firstVenueId) : "");
    })();
  }, [selectedCity]);

  useEffect(() => {
    if (!editedEvent?.city) return;

    (async () => {
      const venuesObject = await fetchVenuesByCity(
        editedEvent.city,
        setEditVenues,
      );

      const firstVenueId = Object.keys(venuesObject)[0];

      setEditedEvent((prev) =>
        prev && firstVenueId
          ? { ...prev, venueID: Number(firstVenueId) }
          : prev,
      );
    })();
  }, [editedEvent?.city]);

  useEffect(() => {
    (async () => {
      getShows();
      getCities();
    })();
  }, []);

  const getShows = async () => {
    const res = await fetchWithAuth("/services/account/get/getShows");
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setShows(data);

    const showsObject = Object.fromEntries(
      data.map((v: { showID: number; showName: string }) => [
        v.showID,
        v.showName,
      ]),
    );
    setShows(showsObject);
  };

  const getCities = async () => {
    const res = await fetchWithAuth("/services/account/get/getCities");
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setCities(data);
    getEvents();
  };

  const getEvents = async () => {
    const res = await fetchWithAuth("/services/account/get/getEvents");
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setEvents(data);
  };

  const clearForm = () => {
    setSelectedCity("");
    setSelectedShow("");
    setSelectedVenue("");
    setVenues({});
    setTime("");
  };

  const toDateTimeLocal = (value?: string) => {
    if (!value) return "";

    // Already datetime-local format
    if (value.includes("T")) {
      return value.slice(0, 16);
    }

    // dd-MM-yyyy HH:mm
    if (value.includes(" ")) {
      const [datePart, timePart] = value.split(" ");
      if (!datePart || !timePart) return "";

      const [day, month, year] = datePart.split("-");
      if (!day || !month || !year) return "";

      return `${year}-${month}-${day}T${timePart}`;
    }

    return "";
  };

  const eventColumns: Column<EventType>[] = [
    { key: "date", label: "Tarih", filterType: "date" },
    {
      key: "showName",
      label: "Gösteri",
      searchable: true,
      filterType: "multi",
    },
    { key: "city", label: "Şehir", searchable: true, filterType: "multi" },
    { key: "venueName", label: "Salon", searchable: true, filterType: "multi" },
    { key: "ticketSale", label: "Satışa Açık", filterType: "boolean" },
    {
      key: "isPublic",
      label: "Görünür",
      filterType: "boolean",
      reactKey: "ticket-price",
    },
    { key: "soldTickets", label: "Satılan Biletler", searchable: false, filterType: "none" },

    {
      key: "eventID",
      label: "Bilet Durumu",
      filterType: "none",
      reactKey: "edit",
      render: (row) => (
        <button
          onClick={() =>
            router.push(`/account/events/ticketPrices/${row.eventID}`)
          }
          className="bg-white dark:bg-zinc-700 p-1 rounded-md hover:bg-red-500! duration-200 transition-colors border border-black"
        >
          <svg  viewBox="0 0 24 24" className="size-6 sm:size-8 fill-black dark:fill-white">
            <path d="m13.817 5.669 4.504 4.501-8.15 8.15-4.501-4.504zm-3.006 13.944 8.8-8.8c.166-.163.27-.389.27-.64s-.103-.477-.269-.64l-5.156-5.156c-.166-.158-.392-.255-.64-.255s-.474.097-.64.256l-8.8 8.8c-.166.163-.27.389-.27.64s.103.477.269.64l5.156 5.156c.166.158.392.255.64.255s.474-.097.64-.256zm12.663-9.073-12.918 12.933c-.332.326-.787.527-1.289.527s-.957-.201-1.289-.527l-1.794-1.793c.477-.492.77-1.164.77-1.905 0-1.513-1.227-2.74-2.74-2.74-.74 0-1.412.294-1.905.771l.001-.001-1.781-1.794c-.326-.332-.527-.787-.527-1.289s.201-.957.527-1.289l12.919-12.906c.332-.326.787-.527 1.289-.527s.957.201 1.289.527l1.781 1.781c-.515.499-.835 1.197-.835 1.969 0 1.513 1.227 2.74 2.74 2.74.773 0 1.471-.32 1.969-.835l.001-.001 1.794 1.781c.326.332.527.787.527 1.289s-.201.957-.527 1.289z"></path>
          </svg>
        </button>
      ),
    },
    {
      key: "eventID",
      label: "Düzenle",
      filterType: "none",
      render: (row) => (
        <button
          onClick={() => {
            handleOpenEdit(row);
          }}
          className="bg-white  dark:bg-zinc-700 p-1 rounded-md hover:bg-red-500! duration-200 transition-colors border border-black"
        >
          <svg  viewBox="0 0 24 24" className=" stroke-black dark:stroke-white  fill-transparent size-6 sm:size-8">
            <path
              d="M12 3.99997H6C4.89543 3.99997 4 4.8954 4 5.99997V18C4 19.1045 4.89543 20 6 20H18C19.1046 20 20 19.1045 20 18V12M18.4142 8.41417L19.5 7.32842C20.281 6.54737 20.281 5.28104 19.5 4.5C18.7189 3.71895 17.4526 3.71895 16.6715 4.50001L15.5858 5.58575M18.4142 8.41417L12.3779 14.4505C12.0987 14.7297 11.7431 14.9201 11.356 14.9975L8.41422 15.5858L9.00257 12.6441C9.08001 12.2569 9.27032 11.9013 9.54951 11.6221L15.5858 5.58575M18.4142 8.41417L15.5858 5.58575"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ),
    },
  ];
  return (
    <>
      <FormContainer title="Yeni Etkinlik Ekle">
        <div>Gösteri Seçiniz:</div>
        <select
          className="select select-accent w-full "
          value={selectedShow}
          onChange={(e) => setSelectedShow(Number(e.target.value))}
        >
          <option value="" disabled>
            Gösteri seçiniz.
          </option>

          {Object.entries(shows).map(([showID, showName]) => (
            <option key={showID} value={showID}>
              {showName}
            </option>
          ))}
        </select>
        <div>Şehir Seçiniz:</div>

        <select
          className="select select-accent w-full "
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

        <div>Salon Seçiniz:</div>

        <select
          className="select select-accent w-full "
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(Number(e.target.value))}
          disabled={selectedCity == ""}
        >
          {Object.entries(venues).map(([venueID, venueName]) => (
            <option key={venueID} value={venueID}>
              {venueName}
            </option>
          ))}
        </select>
        <div>Tarih ve Saat Seçiniz:</div>

        <input
          className="select select-accent w-48"
          value={time}
          type="datetime-local"
          min={today}
          onChange={(e) => setTime(e.target.value)}
        ></input>

        <div className="flex justify-center mt-6">
          <button className="btn btn-success text-white " onClick={() => createEvent()}>
            ETKİNLİK OLUŞTUR
          </button>
        </div>
      </FormContainer>
      <DataTable data={events} columns={eventColumns} title="Etkinlikler" />

      <DialogModal open={dialogueOpen} dialogueText={dialogueText} onClose={() => {setDialogueOpen(false); setDialogueText("")}}>
        {editDialogueOpen && (
          <>
            <div className={`grid gap-2 w-[500px]`}>
              <div>Gösteri Seçiniz:</div>
              <select
                className="select select-accent w-full"
                value={editedEvent?.showID ?? ""}
                onChange={(e) =>
                  setEditedEvent((prev) =>
                    prev ? { ...prev, showID: Number(e.target.value) } : prev,
                  )
                }
              >
                <option value="" disabled>
                  Gösteri seçiniz.
                </option>
                {Object.entries(shows).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <div>Şehir Seçiniz:</div>

              <select
                className="select select-accent w-full "
                value={editedEvent?.city ?? ""}
                onChange={(e) =>
                  setEditedEvent((prev) =>
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

              <div>Salon Seçiniz:</div>

              <select
                className="select select-accent w-full"
                value={editedEvent?.venueID ?? ""}
                onChange={(e) =>
                  setEditedEvent((prev) =>
                    prev ? { ...prev, venueID: Number(e.target.value) } : prev,
                  )
                }
              >
                {Object.entries(editVenues).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="flex justify-center gap-16">
                <div>
                  <div>Satışa Açık</div>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-success"
                    checked={editedEvent?.ticketSale ?? false}
                    onChange={(e) =>
                      setEditedEvent((prev) =>
                        prev ? { ...prev, ticketSale: e.target.checked } : prev,
                      )
                    }
                  />
                </div>
                <div>
                  <div>Görünür</div>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-success"
                    checked={editedEvent?.isPublic ?? false}
                    onChange={(e) =>
                      setEditedEvent((prev) =>
                        prev ? { ...prev, isPublic: e.target.checked } : prev,
                      )
                    }
                  />
                </div>
              </div>
              <div>Tarih ve Saat Seçiniz:</div>
<div className="flex justify-center">
              <input
                className="select select-accent w-52"
                type="datetime-local"
                min={today}
                value={toDateTimeLocal(editedEvent?.date)}
                onChange={(e) =>
                  setEditedEvent((prev) =>
                    prev ? { ...prev, date: e.target.value } : prev,
                  )
                }
              ></input>
              </div>

              <div className="flex justify-center w-full mt-6">
                <button
                  className="btn btn-success  text-white"
                  onClick={() => editEvent()}
                >
                  KAYDET
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
