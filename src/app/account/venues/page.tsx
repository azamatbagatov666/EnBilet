"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import type { VenueType } from "@/src/models/VenueType";
import { useRouter } from "next/navigation";


export default function venues() {
    const router = useRouter();

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
  const [selectedCity, setSelectedCity] = useState("");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");

  const [venues, setVenues] = useState<VenueType[]>([]);

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
            venue: venueName,
            city: selectedCity,
            address: address,
          }),
        });
        if (res.status === 409) {
          alert(
            "Seçtiğiniz şehirde belirttiğiniz isimde bir salon zaten bulunuyor.",
          );
          return;
        } else if (!res.ok) {
          throw new Error("Failed to add venue");
        }

        setSelectedCity("");
        setVenueName("");
        setAddress("");
        alert("Salon başarıyla eklendi.");

        getAllVenues();
      } catch (err) {
        alert("Bağlantı Sorunu.");
      }
    }
  };

  useEffect(() => {
    getAllVenues();
  }, []);

  return (
    <>
      <div>
        <div className="mt-96 flex justify-center">
          <div className=" grid grid-cols-3 w-9/12">
            <div>Şehir Seçiniz:</div>
            <div>Salon İsmi:</div>
            <div>Salonun Adresi:</div>
            <select
              className="select select-accent w-56 "
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

            <input
              className="input input-accent w-5/6 "
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
            ></input>

            <input
              className="input input-accent w-5/6 "
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            ></input>
          </div>
        </div>
        <div className="flex justify-center mt-10">
          <button className="btn btn-success  " onClick={() => createVenue()}>
            SALON EKLE
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
                <th>Şehir</th>
                <th>Salon</th>
                <th>Adres</th>
                <th>Koltuk Düzeni</th>
              </tr>
            </thead>

            <tbody>
              {venues.map((venue) => (
                <tr key={venue.id}>
                  <td>{venue.city}</td>

                  <td>{venue.venue}</td>

                  <td>{venue.address}</td>
                  <td className="flex justify-center">
                    <button onClick={() => router.push(`/account/venues/designSeats/${venue.id}`)} className="bg-white p-1 rounded-md">
                      <img draggable={false}
                        src={`/account/images/edit.png`}
                        alt="Düzenle Butonu"
                        className="size-8"
                      />
                    </button>
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
