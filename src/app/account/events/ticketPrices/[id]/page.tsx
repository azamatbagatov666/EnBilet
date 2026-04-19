"use client";

import DialogModal from "@/src/components/alerts/DialogModal";
import SuccessAlert from "@/src/components/alerts/SuccessAlert";
import { useEventSeats } from "./useEventSeats";
import type { seatState } from "@/src/models/seatMap/seatState";
import CellLegend from "@/src/components/seatMap/CellLegend";
import { debounce } from 'lodash';


import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import type { EventType } from "@/src/models/EventType";
import { SeatMapType } from "@/src/models/SeatMapType";
import { useState, useEffect, useRef } from "react";
import type { stageLocation } from "@/src/models/seatMap/SeatMap";
import Row from "@/src/components/seatMap/prices/Row";

import { use } from "react";
import { useRouter } from "next/navigation";

export default function ticketPrices({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [eventSeats, setEventSeats] = useState<Record<string, seatState>>({});

  const {
    setAllPrices,
    setRowPrice,
    setSeatPrice,
    toggleAll,
    toggleRow,
    toggleSeat,
    validatePrices,
  } = useEventSeats(eventSeats, setEventSeats);

  const [desiredPrice, setDesiredPrice] = useState("");

  const { id } = use(params);
  const router = useRouter();

  //-------------FETCH------------

  const [maps, setMaps] = useState<SeatMapType[]>([]);
  const [theEvent, setTheEvent] = useState<EventType>();

  //-------------FORM------------
  const [noMaps, setNoMaps] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);


  //------------MAPS-------------
  const [stageLocation, setStageLocation] = useState<stageLocation>("up");
  const [lockSeatMap, setLockSeatMap] = useState(false);
  const [seatMap, setSeatMap] = useState<any | null>(null);
  const [selectedMapName, setSelectedMapName] = useState("");

  //------------DIALOGUE&ALERTS---------

  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [editDialogueOpen, setEditDialogueOpen] = useState(false);
  const [dialogueText, setDialogueText] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    getEventInfo();
  }, []);

  useEffect(() => {
    if (theEvent?.venueID) {
      getMaps();
    }
  }, [theEvent]);

  useEffect(() => {

    if (theEvent?.mapID) {
      setSelectedMapId(String(theEvent.mapID));
    }
  }, [theEvent]);

  const getEventInfo = async () => {
    const res = await fetchWithAuth(
      `/services/account/get/getTheEvent?eventID=${id}`,
    );
    if (!res.ok) {
      router.push(`/account/events/`);
    }
    const data = await res.json();

    setTheEvent(data);
  };

  const handlePriceChange = (value: string) => {
    value = value.replace(",", ".");

    if (value === "") {
      setDesiredPrice("");
      return;
    }

    if (!/^\d*\.?\d*$/.test(value)) return;

    const [, decimals] = value.split(".");
    if (decimals && decimals.length > 2) return;

    setDesiredPrice(value);
  };

  const handleChangeAllPrices = () => {
    const price = Number(desiredPrice.replace(",", "."));

    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Lütfen geçerli bir fiyat giriniz.");
      return;
    }
    setAllPrices(Number(desiredPrice));
    setDesiredPrice("");
    setDialogueOpen(false);
  };

  const handleSavePrices =  debounce(async() => {
    const { valid, errors } = validatePrices();

    if (!valid) {
      setIsEditing(false);
      setDialogueText(errors.join("\n"));
      setDialogueOpen(true);
    } else {
      const seatsToSave = Object.values(eventSeats).filter(
        (seat) => seat.status === "available" || seat.status === "blocked",
      );

      const res = await fetchWithAuth("/services/account/actions/eventSeats/saveSeats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventID: id,
          mapID: Number(selectedMapId),
          Seats: seatsToSave,
        }),
      });

      if (res.ok) {

        setAlertText("Koltuklar başarıyla güncellendi.");
        setAlertOpen(true);

    getEventInfo();


      } else {
        setDialogueText("Koltuklar kaydedilirken bir hata oluştu.")
        setDialogueOpen(true)
      }


    }



    setIsEditing(false);
}, 2000);






  const getMaps = async () => {
    const res = await fetchWithAuth(
      `/services/account/get/getMaps?venueID=${theEvent?.venueID}`,
    );
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    if (data.length == 0) {
      setNoMaps(true);
    }
    setMaps(data);
  };

  useEffect(() => {
    if (!selectedMapId) return;

    const selected = maps.find((m) => m.mapID === Number(selectedMapId));

    if (!selected?.mapName || !selected?.layoutJS) {
      return;
    }
    setSelectedMapName(selected?.mapName);

    try {
      const parsed = JSON.parse(selected.layoutJS);

      setStageLocation(parsed.stageLocation);

      setSeatMap(parsed);

      const normalized: Record<string, any> = {};

      parsed.rows.forEach((row: any) => {
        row.cells.forEach((cell: any) => {
          if (cell.type === "seat") {
            normalized[cell.id] = {
              cellID: cell.id,
              price: 650.99,
              status: "available",
            };
          }
        });
      });

      setEventSeats(normalized);
    } catch (e) {
      console.error("Invalid seat map JSON");
    }
  }, [selectedMapId, maps]);

  useEffect(() => {
    if (!seatMap || !theEvent?.eventID) return;

    loadEventSeats();
  }, [seatMap]);

  const loadEventSeats = async () => {
    const res = await fetchWithAuth(
      `/services/account/actions/eventSeats/getEventSeats?eventID=${theEvent!.eventID}`,
    );

    if (!res.ok) return;

    const data = await res.json();
    if (data.length == 0) {
      return;
    }

    const hasSoldSeat = data.some((seat: any) => seat.status === "sold");
    setLockSeatMap(hasSoldSeat);

    if (theEvent?.mapID != Number(selectedMapId)) {
      return;
    }

    const savedSeats: seatState[] = data;

    const savedMap = Object.fromEntries(savedSeats.map((s) => [s.cellID, s]));

    const normalized: Record<string, seatState> = {};

    seatMap.rows.forEach((row: any) => {
      row.cells.forEach((cell: any) => {
        if (cell.type !== "seat") return;

        const saved = savedMap[cell.id];

        normalized[cell.id] = {
          cellID: cell.id,
          price: saved?.price ?? 0,
          status: saved?.status ?? "available",
        };
      });
    });

    setEventSeats(normalized);
  };

  const priceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dialogueOpen) return;

    priceInputRef.current?.focus();
  }, [dialogueOpen]);

  return (
    <>
      <div className="px-6">
        <div
          className="flex justify-center text-3xl font-bold "

        >
          <span className="bg-red-600 rounded-xl p-2 dark:text-white duration-150">
            Koltuk Fiyat ve Durumu Düzenle
          </span>
        </div>

        <div className="">
          <div className="flex gap-4 text-xl font-bold my-4">
            <span>
              Tarih: <span className="font-semibold">{theEvent?.date}</span>
            </span>
            <span>
              Gösteri:{" "}
              <span className="font-semibold">{theEvent?.showName}</span>
            </span>
            <span>
              Şehir: <span className="font-semibold">{theEvent?.city}</span>
            </span>
            <span>
              Salon:{" "}
              <span className="font-semibold">{theEvent?.venueName}</span>
            </span>
          </div>
        </div>

        <label htmlFor="">
          <span>Oturma Planı Seç:</span>
          <select
            className="select select-info ml-5"
            disabled={lockSeatMap || isEditing}
            value={selectedMapId ?? ""}
            onChange={(e) => setSelectedMapId(e.target.value)}
          >
            <option value="" disabled>
              Oturma Planı Seç
            </option>

            {maps.map((map) => (
              <option key={map.mapID} value={map.mapID}>
                {map.mapName}
              </option>
            ))}
          </select>
        </label>

        {lockSeatMap && (
          <div className="text-sm text-red-600 mt-1 font-semibold">
            Satılmış koltuklar olduğu için oturma planı değiştirilemez.
          </div>
        )}

        {seatMap && (<div>
{isEditing && <span className="loading loading-lg absolute left-1/2 top-1/2 z-50 loading-spinner !blur-0 !opacity-100 text-accent"></span>}

          <div
            className={` select-none ${isEditing ? "opacity-35 blur-sm pointer-events-none" : ""}`}
            onContextMenu={(e) => {
              e.preventDefault();
            }}
          >
            

            <div className="mt-4 font-bold">
              <span>Şu Anda Düzenlenen Oturma Planı:</span>
              <span className="ml-4">{selectedMapName}</span>
              
              </div>

            <div className="flex flex-wrap gap-6 mt-6 justify-center">
              <CellLegend variant="available" label="Müsait" />
              <CellLegend variant="blocked" label="Kapalı" />
              <CellLegend variant="reserved" label="Rezerve" />
              <CellLegend variant="sold" label="Satıldı" />
              <CellLegend variant="handicapped" label="Engelli" />
            </div>
            <div className="h-16 my-4  flex justify-center">
              {stageLocation == "up" && (
                <div
                  className="w-96  h-16 bg-red-800 text-white flex items-center justify-center
                [clip-path:polygon(0%_0%,100%_0%,80%_100%,20%_100%)]"
                >
                  SAHNE
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <div className="mt-10 flex flex-col items-left gap-4">
                {seatMap.rows
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((row: any) => (
                    <Row
                      key={row.id}
                      row={row}
                      eventSeats={eventSeats}
                      onSeatClick={toggleSeat}
                      toggleRow={toggleRow}
                      setRowPrice={setRowPrice}
                      setSeatPrice={setSeatPrice}
                    />
                  ))}
              </div>
            </div>

            <div className="h-16 my-8 flex justify-center">
              {stageLocation == "down" && (
                <div
                  className="w-96 h-16 bg-red-800 text-white flex items-center justify-center
                [clip-path:polygon(20%_0%,80%_0%,100%_100%,0%_100%)]"
                >
                  SAHNE
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setDialogueOpen(true);
                  setEditDialogueOpen(true);
                }}
                className="btn btn-primary "
              >
                Bütün Koltuklara Fiyat Gir
              </button>

              <button
                onClick={() => {
                  toggleAll();
                }}
                className="btn btn-secondary"
              >
                Bütün Koltukları Aç/Kapat
              </button>
              <button
                onClick={() => {
                  setIsEditing(true);
                  handleSavePrices();
                }}
                className="btn btn-success text-white"
              >
                Kaydet
              </button>
            </div>
          </div>
          </div>
        )}

        {noMaps && (
          <>
            <div className="h-[40vh] flex justify-center items-center text-3xl font-bold">
              <div className="text-center">
                <div className="">
                  Bu salon için oluşturulmuş bir oturma planı bulunamadı.
                </div>

                <div className="mt-11 text-xl">
                  Bu salon için hemen bir plan oluştur.
                </div>
                <button
                  onClick={() => {
                    router.push(
                      `/account/venues/designSeats/${theEvent?.venueID}`,
                    );
                  }}
                  className="btn btn-neutral"
                >
                  Oluştur
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <DialogModal
        open={dialogueOpen}
        onClose={() => {
          setDialogueOpen(false);
          setEditDialogueOpen(false);
          setDialogueText("");
          setFormError("");
          setDesiredPrice("");
        }}
      >
        {dialogueText}

        {editDialogueOpen && (
          <div className="flex justify-center">
            <div>
              <span>Lütfen koltuklar için bir fiyat belirleyin.</span>
              <div className="flex justify-center mt-4">
                <div className="flex gap-1 input input-accent h-9 w-32 !outline-none ">
                  <input
                    className="!outline-none w-20 text-right"
                    inputMode="decimal"
                    ref={priceInputRef}
                    placeholder="0,00"
                    value={desiredPrice.replace(".", ",")}
                    onChange={(e) =>
                      handlePriceChange(e.target.value.replace(",", "."))
                    }
                    onBlur={() => {
                      if (!desiredPrice) return;
                      setDesiredPrice(Number(desiredPrice).toFixed(2));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleChangeAllPrices();
                    }}
                  />
                  <span className=" self-center text-lg select-none">₺</span>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  className="btn btn-success text-white"
                  onClick={() => {
                    handleChangeAllPrices();
                  }}
                >
                  Kaydet
                </button>
              </div>
              <div className={" font-bold text-red-500 h-4 px-1"}>
                {formError}
              </div>
            </div>
          </div>
        )}
      </DialogModal>

            <SuccessAlert open={alertOpen} onClose={() => setAlertOpen(false)}>
              {alertText}
            </SuccessAlert>
    </>
  );
}
