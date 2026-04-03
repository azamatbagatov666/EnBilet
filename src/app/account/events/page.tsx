"use client";

import { useState, useEffect } from "react";
import type { EventType } from "@/src/models/EventType";
import type { Column } from "@/src/models/dataTable/Column";
import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import DataTable from "@/src/components/DataTable";
import DialogModal from "@/src/components/alerts/DialogModal";
import SuccessAlert from "@/src/components/alerts/SuccessAlert";
import FormContainer from "@/src/components/forms/FormContainer";

export default function List() {
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

  const hasEventChanged = (original: EventType, updated: EventType) => {
    if (original.showID !== updated.showID) return true;
    if (original.venueID !== updated.venueID) return true;
    if (original.date !== updated.date) return true;
    if (original.ticketsale !== updated.ticketsale) return true;
    if (original.ispublic !== updated.ispublic) return true;

    return false;
  };

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
      ticketsale: editedEvent.ticketsale,
      ispublic: editedEvent.ispublic,
    };

    await fetchWithAuth("/services/account/actions/editEvent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEvent),
    });

    setIsEditing(false);
    setDialogueOpen(false);
    setEditDialogueOpen(false);
    setEditedEvent(undefined);
    getEvents();

    setAlertText("Etkinlik başarıyla düzenlendi.");
    setAlertOpen(true);
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
        if (res.status === 409) {
          setDialogueText(
            "Seçtiğiniz tarihte ve salonda bir etkinlik zaten bulunuyor.",
          );
          setDialogueOpen(true);
          return;
        } else if (!res.ok) {
          throw new Error("Failed to add event");
        }

        setSelectedCity("");
        setSelectedVenue("");
        setVenues({});
        setTime("");

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
  setter: React.Dispatch<React.SetStateAction<Record<number, string>>>
): Promise<Record<number, string>> => {
  const res = await fetchWithAuth(
    `/services/account/get/getVenues?city=${city}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch venues");
  }

  const data: { venueID: number; venueName: string }[] = await res.json();

  const venuesObject = Object.fromEntries(
    data.map((v) => [v.venueID, v.venueName])
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
      setEditVenues
    );

    const firstVenueId = Object.keys(venuesObject)[0];

    setEditedEvent((prev) =>
      prev && firstVenueId
        ? { ...prev, venueID: Number(firstVenueId) }
        : prev
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
  { key: "date", label: "Tarih", filterType:"date"},
  { key: "showName", label: "Gösteri", searchable: true, filterType: "multi" },
  { key: "city", label: "Şehir", searchable: true, filterType: "multi" },
  { key: "venueName", label: "Salon", searchable: true,filterType: "multi" },
  { key: "ticketsale", label: "Satışa Açık", filterType: "boolean" },
  { key: "ispublic", label: "Görünür", filterType: "boolean" },
  { key: "eventID", label: "Düzenle", filterType: "none", render:  (row) => (
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
          <button className="btn btn-success  " onClick={() => createEvent()}>
            ETKİNLİK OLUŞTUR
          </button>
        </div>
      </FormContainer>
      <div>
        <div className=" flex justify-center my-10">
          <table className="table table-auto w-6/12 table-zebra border-2 border-black dark:border-white">
            <thead>
              <tr className="bg-gray-300 font-bold text-lg text-black">
                <th>Tarih</th>
                <th>Gösteri</th>
                <th>Şehir</th>
                <th>Salon</th>
                <th>Satışa Açık</th>
                <th>Görünür</th>
                <th>Düzenle</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.eventID}>
                  <td>{event.date}</td>
                  <td>{event.showName}</td>

                  <td>{event.city}</td>
                  <td>{event.venueName}</td>

                  <td
                  >
                    <input
                      className="checkbox checkbox-success cursor-default"
                      readOnly
                      type="checkbox"
                      checked={event.ticketsale}
                    />

                  </td>

                  <td
                  >
                    <input
                      className="checkbox checkbox-success cursor-default"
                      readOnly
                      type="checkbox"
                      checked={event.ispublic}
                    />
     
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          handleOpenEdit(event);
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

      <DataTable data={events} columns={eventColumns} title="Etkinlikler" />

      <DialogModal open={dialogueOpen} onClose={() => setDialogueOpen(false)}>
        {dialogueText}
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
                    checked={editedEvent?.ticketsale ?? false}
                    onChange={(e) =>
                      setEditedEvent((prev) =>
                        prev ? { ...prev, ticketsale: e.target.checked } : prev,
                      )
                    }
                  />
                </div>
                <div>
                  <div>Görünür</div>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-success"
                    checked={editedEvent?.ispublic ?? false}
                    onChange={(e) =>
                      setEditedEvent((prev) =>
                        prev ? { ...prev, ispublic: e.target.checked } : prev,
                      )
                    }
                  />
                </div>
              </div>
              <div>Tarih ve Saat Seçiniz:</div>

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

              <div className="flex justify-center w-full mt-6">
                <button
                  className="btn btn-success  "
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
