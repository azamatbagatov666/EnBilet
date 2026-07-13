"use client";

import { useState, useEffect, useRef } from "react";
import type { EventType } from "@/src/models/EventType";
import type { Column } from "@/src/models/dataTable/Column";
import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import DataTable from "@/src/components/DataTable";
import DialogModal from "@/src/components/alerts/DialogModal";
import SuccessAlert from "@/src/components/alerts/SuccessAlert";
import FormContainer from "@/src/components/forms/FormContainer";
import SvgButton from "@/src/components/buttons/SvgButton";

import { useRouter } from "next/navigation";
import EditSvg from "@/src/components/svg/EditSvg";

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
  const [isAdding, setIsAdding] = useState(false);

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

  const hasEventChanged = (
    original: EventType,
    updated: EventType,

  ) => {
    const keysToCompare: (keyof EventType)[] = [
      "venueID",
      "showID",
      "date",
      "ticketSale",
      "isPublic",
    ];

    if (keysToCompare.some((key) => original[key] !== updated[key])) {
      return true;
    }

    return false;
  };

  const editEvent = async () => {
    if (!editedEvent || isEditing || !originalEvent) return;

    if (
      !hasEventChanged(
        originalEvent,
        editedEvent,

      )
    ) {
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



    try {
      await fetchWithAuth("/services/account/actions/editEvent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });

      setDialogueOpen(false);
      setEditedEvent(undefined);



      getEvents();

      setAlertText("Etkinlik başarıyla düzenlendi.");
    } catch (err: any) {


      setDialogueText(err.message);
    } finally {
      setEditDialogueOpen(false);
      setIsEditing(false);
    }
  };

  const createEvent = async () => {
    if (selectedVenue != "" && time != "" && !isAdding) {
      setIsAdding(true);

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




        clearForm();

        setAlertText("Etkinlik başarıyla eklendi.");

        getEvents();
      } catch (err: any) {
        setDialogueText(err.message);
      } finally {
        setIsAdding(false);
      }
    } else {
      setDialogueText(
        "Lütfen salon ve tarih bilgilerini eksiksiz olarak doldurduğunuzdan emin olun.",
      );
    }
  };

  const fetchVenuesByCity = async (
    city: string,
    setter: React.Dispatch<React.SetStateAction<Record<number, string>>>,
  ): Promise<Record<number, string>> => {
    try {
      const res = await fetchWithAuth(
        `/services/account/get/getVenues?city=${city}`,
      );

      const data: { venueID: number; venueName: string }[] = await res.json();

      const venuesObject = Object.fromEntries(
        data.map((v) => [v.venueID, v.venueName]),
      );

      setter(venuesObject);
      return venuesObject; // ✅ ALWAYS returns
    } catch (err: any) {
      throw new Error("Failed to fetch venues");
    }
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
    try {
      const res = await fetchWithAuth("/services/account/get/getShows");

      const data = await res.json();
      setShows(data);

      const showsObject = Object.fromEntries(
        data.map((v: { showID: number; showName: string }) => [
          v.showID,
          v.showName,
        ]),
      );
      setShows(showsObject);
    } catch (err: any) {
      return;
    }
  };

  const getCities = async () => {
    try {
      const res = await fetchWithAuth("/services/account/get/getCities");

      const data = await res.json();
      setCities(data);
      getEvents();
    } catch (err: any) {
      return;
    }
  };

  const getEvents = async () => {
    try {
      const res = await fetchWithAuth("/services/account/get/getEvents");

      const data = await res.json();
      setEvents(data);
    } catch (err: any) {
      return;
    }
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
    { key: "date", label: "Tarih", filterType: "date", sortable: true },

    {
      key: "showName",
      label: "Gösteri",
      searchable: true,
      sortable: true,
      filterType: "multi",
    },
    {
      key: "city",
      label: "Şehir",
      searchable: true,
      sortable: true,
      filterType: "multi",
    },
    {
      key: "venueName",
      label: "Salon",
      searchable: true,
      sortable: true,
      filterType: "multi",
    },

    {
      key: "ticketSale",
      label: "Satışa Açık",
      sortable: true,
      filterType: "boolean",
    },
    {
      key: "isPublic",
      label: "Görünür",
      filterType: "boolean",
      reactKey: "ticket-price",
      sortable: true,
    },
    {
      key: "soldTickets",
      label: "Satılan Biletler",
      searchable: false,
      filterType: "none",
      sortable: true,
    },

    {
      key: "eventID",
      label: "Bilet Durumu",
      filterType: "none",
      reactKey: "edit",
      render: (row) => (
        <SvgButton onClick={() =>
            router.push(`/account/events/ticketPrices/${row.eventID}`)
          }>
          <svg
            viewBox="0 0 24 24"
            className="size-6 sm:size-8 fill-black dark:fill-white"
          >
            <path d="m13.817 5.669 4.504 4.501-8.15 8.15-4.501-4.504zm-3.006 13.944 8.8-8.8c.166-.163.27-.389.27-.64s-.103-.477-.269-.64l-5.156-5.156c-.166-.158-.392-.255-.64-.255s-.474.097-.64.256l-8.8 8.8c-.166.163-.27.389-.27.64s.103.477.269.64l5.156 5.156c.166.158.392.255.64.255s.474-.097.64-.256zm12.663-9.073-12.918 12.933c-.332.326-.787.527-1.289.527s-.957-.201-1.289-.527l-1.794-1.793c.477-.492.77-1.164.77-1.905 0-1.513-1.227-2.74-2.74-2.74-.74 0-1.412.294-1.905.771l.001-.001-1.781-1.794c-.326-.332-.527-.787-.527-1.289s.201-.957.527-1.289l12.919-12.906c.332-.326.787-.527 1.289-.527s.957.201 1.289.527l1.781 1.781c-.515.499-.835 1.197-.835 1.969 0 1.513 1.227 2.74 2.74 2.74.773 0 1.471-.32 1.969-.835l.001-.001 1.794 1.781c.326.332.527.787.527 1.289s-.201.957-.527 1.289z"></path>
          </svg>
        </SvgButton>
      ),
    },
    {
      key: "eventID",
      label: "Düzenle",
      filterType: "none",
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
      <FormContainer title="Yeni Etkinlik Ekle" inProgress={isAdding}>
        <span>Gösteri Seçiniz:</span>
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
        <span>Şehir Seçiniz:</span>

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

        <span>Salon Seçiniz:</span>

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
        <span>Tarih ve Saat Seçiniz:</span>

        <input
          className="select select-accent w-48"
          value={time}
          type="datetime-local"
          min={today}
          onChange={(e) => setTime(e.target.value)}
        ></input>



        <div className="flex justify-center mt-6">
          <button
            className="btn btn-success text-white "
            onClick={() => createEvent()}
          >
            ETKİNLİK OLUŞTUR
          </button>
        </div>
      </FormContainer>
      <DataTable
        data={events}
        columns={eventColumns}
        onRefresh={getEvents}
        title="Etkinlikler"
      />

      <DialogModal
        open={dialogueOpen}
        dialogueText={dialogueText}
        disableClose={isEditing}
        onClose={() => {
          setDialogueOpen(false);
          setDialogueText("");
          setEditDialogueOpen(false);
        }}
      >
        {editDialogueOpen && (
          <>
            <div className={`grid gap-2 w-[500px]`}>
              <span>Gösteri Seçiniz:</span>
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
              <span>Şehir Seçiniz:</span>

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

              <span>Salon Seçiniz:</span>

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
                  <span className="block">Satışa Açık</span>
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
                  <span className="block">Görünür</span>
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
              <span>Tarih ve Saat Seçiniz:</span>
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

      <SuccessAlert
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        alertText={alertText}
      ></SuccessAlert>
    </>
  );
}
