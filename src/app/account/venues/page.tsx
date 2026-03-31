"use client";

import { useState, useEffect, useRef } from "react";
import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import type { VenueType } from "@/src/models/VenueType";
import { useRouter } from "next/navigation";
import '@/src/app/account/account.css';
import DialogModal from "@/src/components/DialogModal";
import SuccessAlert from "@/src/components/SuccessAlert";




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
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [dialogueText, setDialogueText] = useState("");

    const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);



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
          setDialogueText("Seçtiğiniz şehirde belirttiğiniz isimde bir salon zaten bulunuyor.")
          setDialogueOpen(true)
 
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
        setDialogueText("Bağlantı sorunu.")
        setDialogueOpen(true)
      }
    }

    else {
          setDialogueText("Lütfen şehir, salon ismi ve adres bilgilerini eksiksiz olarak doldurduğunuzdan emin olun.")
          setDialogueOpen(true)

    }
  };

  useEffect(() => {
    getAllVenues();
  }, []);

  useEffect(() => {
  if (dialogueOpen) {
    dialogRef.current?.focus();
  }
}, [dialogueOpen]);

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
                <tr className="font-bold" key={venue.id}>
                  <td>{venue.city}</td>

                  <td>{venue.venue}</td>

                  <td>{venue.address}</td>
                  <td >
                    <div className="flex justify-center">
                    <button onClick={() => router.push(`/account/venues/designSeats/${venue.id}`)} className="bg-white p-1 rounded-md hover:bg-red-500 duration-200 transition-colors border border-black">
<svg width="32px" height="32px" viewBox="0 0 24 24" fill="none">
<path d="M12 3.99997H6C4.89543 3.99997 4 4.8954 4 5.99997V18C4 19.1045 4.89543 20 6 20H18C19.1046 20 20 19.1045 20 18V12M18.4142 8.41417L19.5 7.32842C20.281 6.54737 20.281 5.28104 19.5 4.5C18.7189 3.71895 17.4526 3.71895 16.6715 4.50001L15.5858 5.58575M18.4142 8.41417L12.3779 14.4505C12.0987 14.7297 11.7431 14.9201 11.356 14.9975L8.41422 15.5858L9.00257 12.6441C9.08001 12.2569 9.27032 11.9013 9.54951 11.6221L15.5858 5.58575M18.4142 8.41417L15.5858 5.58575" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

<DialogModal
  open={dialogueOpen}
  onClose={() => setDialogueOpen(false)}
>
  {dialogueText}
</DialogModal>

      {alertOpen && (
        <SuccessAlert open={alertOpen} onClose={() => setAlertOpen(false)}>
          {alertText}
        </SuccessAlert>
      )}
    </>
  );
}
