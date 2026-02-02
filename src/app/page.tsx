"use client";

import { useState, useEffect } from "react";
import type { EventType } from "@/src/models/EventType";

export default function List() {
  const [events, setEvents] = useState<EventType[]>([]);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<number | "">("");
  const [venues, setVenues] = useState<Record<number, string>>({});
  const [cities, setCities] = useState([]);
  const [updatingIsPublic, setUpdatingIsPublic] = useState<Set<number>>(
    new Set(),
  );
  const [updatingTicketSale, setUpdatingTicketSale] = useState<Set<number>>(
    new Set(),
  );

  const [time, setTime] = useState("");
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const createEvent = async () => {
    if (selectedVenue != "" && time != "") {
      try {
        const res = await fetch("/services/account/actions/addEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        venueID: selectedVenue,
        date: time,
      }),
    });
        if (!res.ok) {
          throw new Error("Failed to add event");
        }


        setSelectedCity("");
        setSelectedVenue("");
        setVenues({});
        setTime("");
        alert("Etkinlik başarıyla eklendi.");

        getEvents();
      } catch (err) {
        alert("Bağlantı Sorunu.");
      }
    }
  };

  useEffect(() => {
    if (!selectedCity) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/services/account/get/getVenues?city=${selectedCity}`);
        const data: { id: number; venue: string }[] = await res.json();

        const venuesObject = Object.fromEntries(
          data.map((v: { id: number; venue: string }) => [v.id, v.venue]),
        );
        setVenues(venuesObject);

        const firstVenueId = Object.keys(venuesObject)[0];
        setSelectedVenue(firstVenueId ? Number(firstVenueId) : "");

        if (!res.ok) {
          throw new Error("Failed to fetch venues");
        }
      } catch (err) {
        alert("Bağlantı Sorunu.");
      }
    };

    fetchData();
  }, [selectedCity]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/services/account/get/getCities");
      const data = await res.json();
      setCities(data);
      getEvents();
    })();
  }, []);

  const getEvents = async () => {
    const res = await fetch("/services/account/get/getEvents");
    const data = await res.json();
    setEvents(data);
  };

  const updateBool = async (info: string, eventID: number, value: boolean) => {
    try {
      if (info == "ticketsale") {
        setUpdatingTicketSale((prev) => new Set(prev).add(eventID));
      } else {
        setUpdatingIsPublic((prev) => new Set(prev).add(eventID));
      }
        const response = await fetch("/services/account/actions/updateBool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventID, info, value }),
    });


      if (!response.ok) {
          throw new Error("Failed to update");

      }

      if (info == "ticketsale") {
        setUpdatingTicketSale((prev) => {
          const next = new Set(prev);
          next.delete(eventID);
          return next;
        });
      } else {
        setUpdatingIsPublic((prev) => {
          const next = new Set(prev);
          next.delete(eventID);
          return next;
        });
      }

      getEvents();
    } catch {
      alert("Bağlantı sorunu.");
    }
  };

  return (
    <>
      <div>
        <div className="mt-96 flex justify-center">
          <div className=" grid grid-cols-3 w-9/12">
            <div>Şehir Seçiniz:</div>
            <div>Salon Seçiniz:</div>
            <div>Tarih ve Saat Seçiniz:</div>
            <select
              className="border-solid border-2 border-grey-light w-56 "
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

            <select
              className="border-solid border-2 border-grey-light w-5/6 "
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(Number(e.target.value))}
            >
              {Object.entries(venues).map(([id, venue]) => (
                <option key={id} value={id}>
                  {venue}
                </option>
              ))}
            </select>

            <input
              className="border-solid border-2 border-grey-light w-40"
              value={time}
              type="datetime-local"
              min={today}
              onChange={(e) => setTime(e.target.value)}
            ></input>
          </div>
        </div>
        <div className="flex justify-center mt-10">
          <button className="btn btn-success  " onClick={() => createEvent()}>
            ETKİNLİK OLUŞTUR
          </button>
        </div>
      </div>
      <div>
        <div className=" flex justify-center my-10">
          <table className="table table-auto w-6/12 table-zebra">
            <thead>
              <tr className="bg-[#F2F2F2] font-bold text-lg">
                <th>Tarih</th>
                <th>Şehir</th>
                <th>Salon</th>
                <th>Satışa Açık</th>
                <th>Görünür</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.eventID}>
                  <td>{event.date}</td>

                  <td>{event.city}</td>
                  <td>{event.venue}</td>

                  <td
                    className={`text-center ${updatingTicketSale.has(event.eventID!) ? "bg-yellow-300" : ""}`}
                  >
                    <input
                      className="checkbox checkbox-success"
                      onChange={(e) =>
                        updateBool(
                          "ticketsale",
                          event.eventID!,
                          e.target.checked,
                        )
                      }
                      type="checkbox"
                      checked={event.ticketsale}
                    />
                    {updatingTicketSale.has(event.eventID!) && (
                      <span className="absolute ml-3 loading loading-spinner loading-md"></span>
                    )}
                  </td>

                  <td
                    className={`text-center ${updatingIsPublic.has(event.eventID!) ? "bg-yellow-300" : ""}`}
                  >
                    <input
                      className="checkbox checkbox-success"
                      onChange={(e) =>
                        updateBool("ispublic", event.eventID!, e.target.checked)
                      }
                      type="checkbox"
                      checked={event.ispublic}
                    />
                    {updatingIsPublic.has(event.eventID!) && (
                      <span className="absolute ml-3 loading loading-spinner loading-md"></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
