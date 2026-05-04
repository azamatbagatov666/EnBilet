"use client";

import DialogModal from "@/src/components/alerts/DialogModal";
import { formatPrice } from "@/src/lib/formatPrice";
import { generateId } from "@/src/lib/generateId";
import SuccessAlert from "@/src/components/alerts/SuccessAlert";
import PriceInput from "@/src/components/forms/PriceInput";
import { useEventSeats } from "./useEventSeats";
import type { seatState } from "@/src/models/seatMap/seatState";
import CellLegend from "@/src/components/seatMap/CellLegend";
import { debounce } from "lodash";

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
  const [nonSeatedPrices, setNonSeatedPrices] = useState("");

  const { id } = use(params);
  const router = useRouter();

  //-------------FETCH------------

  const [maps, setMaps] = useState<SeatMapType[]>([]);
  const [theEvent, setTheEvent] = useState<EventType>();

  //-------------FORM------------
  const [noMaps, setNoMaps] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [mapCapacity, setMapCapacity] = useState(0);
  const [numberOfTickets, setNumberOfTickets] = useState(0);
  const [isSeated, setIsSeated] = useState(true);

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
  const [nonSeatedError, setNonSeatedError] = useState("");

  const immutableCount = Object.values(eventSeats).filter(
    (s) => s.status === "sold" || s.status === "reserved",
  ).length;

  const maxSelectable = Math.max(0, mapCapacity - immutableCount);

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

  const handleSavePrices = debounce(async () => {
    const { valid, errors } = validatePrices();

    if (!valid) {
      setIsEditing(false);
      setDialogueText(errors.join("\n"));
      setDialogueOpen(true);
    } else {
      const seatsToSave = Object.values(eventSeats).filter(
        (seat) => seat.status === "available" || seat.status === "blocked",
      );

      const res = await fetchWithAuth(
        "/services/account/actions/eventSeats/saveSeats",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventID: id,
            mapID: Number(selectedMapId),
            Seats: seatsToSave,
          }),
        },
      );

      if (res.ok) {
        setAlertText("Koltuklar başarıyla güncellendi.");
        setAlertOpen(true);

        getEventInfo();
      } else {
        setDialogueText("Koltuklar kaydedilirken bir hata oluştu.");
        setDialogueOpen(true);
      }
    }

    setIsEditing(false);
  }, 2000);

  const handleNonSeatedPrices = debounce(async () => {
    const price = Number(nonSeatedPrices.replace(",", "."));

    if (!Number.isFinite(price) || price <= 0) {
      setNonSeatedError("Lütfen geçerli bir fiyat giriniz.");
      setIsEditing(false);
      return;
    }



    setNonSeatedError("");

    let seatsToSave;

    if (Object.values(eventSeats).length == 0) {
      //create
      seatsToSave = Array.from({ length: mapCapacity }).map((_, index) => ({
        cellID: generateId(),
        price: price,
        status: index < numberOfTickets ? "available" : "blocked",
      }));
    } else {
      const seats = Object.values(eventSeats) as seatState[];

      const sold = seats.filter((s) => s.status === "sold");
      const reserved = seats.filter((s) => s.status === "reserved");
      const available = seats.filter((s) => s.status === "available");
      const blocked = seats.filter((s) => s.status === "blocked");

      const immutableCount = sold.length + reserved.length;
      const maxSelectable = mapCapacity - immutableCount;

      const targetAvailable = Math.min(numberOfTickets, maxSelectable);
      const currentAvailable = available.length;

      let newAvailable = [...available];
      let newBlocked = [...blocked];

      if (targetAvailable > currentAvailable) {
        const diff = targetAvailable - currentAvailable;

        const toOpen = newBlocked.slice(0, diff);

        newAvailable = [
          ...newAvailable,
          ...toOpen.map((s) => ({
            ...s,
            status: "available" as const,
            price,
          })),
        ];

        newBlocked = newBlocked.slice(diff);
      }

      if (targetAvailable < currentAvailable) {
        const diff = currentAvailable - targetAvailable;

        const toBlock = newAvailable.slice(0, diff);

        newBlocked = [
          ...newBlocked,
          ...toBlock.map((s) => ({
            ...s,
            status: "blocked" as const,
            price,
          })),
        ];

        newAvailable = newAvailable.slice(diff);
      }

      seatsToSave = [
        ...sold,
        ...reserved,
        ...newAvailable.map((s) => ({ ...s, price })),
        ...newBlocked.map((s) => ({ ...s, price })),
      ];
    }

    const res = await fetchWithAuth(
      "/services/account/actions/eventSeats/saveSeats",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventID: id,
          mapID: Number(selectedMapId),
          Seats: seatsToSave,
        }),
      },
    );

    if (res.ok) {
      setAlertText("Koltuklar başarıyla güncellendi.");
      setAlertOpen(true);

      getEventInfo();
    } else {
      setDialogueText("Koltuklar kaydedilirken bir hata oluştu.");
      setDialogueOpen(true);
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

    if (selected?.mapName) {
      setSelectedMapName(selected?.mapName);
    }



    if (selected?.isSeated == false && selected.maxCapacity) {
      setIsSeated(false);
          setNumberOfTickets(0);
    setNonSeatedPrices("0");
      setMapCapacity(selected.maxCapacity);
      loadNonSeated();
      return;
    }

    if (!selected?.layoutJS) {
      return;
    }
    setIsSeated(true);
    setMapCapacity(0);
    setNumberOfTickets(0);

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

  const loadNonSeated = async () => {
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

    setEventSeats(data);

    if (data.length > 0) {
      const firstAvailable = data.find((s: any) => s.status === "available");
      const firstBlocked = data.find((s: any) => s.status === "blocked");
      const firstReserved = data.find((s: any) => s.status === "reserved");
      const firstSold = data.find((s: any) => s.status === "sold");

      if (firstAvailable) {
      const thePrice = firstAvailable.price.toString();
      setNonSeatedPrices(formatPrice(thePrice));


      } else if (firstBlocked) {

      const thePrice = firstBlocked.price.toString();
      setNonSeatedPrices(formatPrice(thePrice));


      } else if (firstReserved) {

              const thePrice = firstReserved.price.toString();
      setNonSeatedPrices(formatPrice(thePrice));

      }
      else {

                      const thePrice = firstSold.price.toString();
      setNonSeatedPrices(formatPrice(thePrice));


      }


    }

    setNumberOfTickets(
      data.filter((s: any) => s.status === "available").length,
    );
  };

  return (
    <>
      <div className="px-6">
        <div className="">
          <div className="flex gap-4 text-xl font-bold my-4">
            <span>
              Tarih:{" "}
              <span className="font-semibold">
                {theEvent?.date}
              </span>
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

        <label>
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

        {(seatMap || !isSeated) && (
          <div>
            {isEditing && (
              <span className="loading loading-lg absolute left-1/2 top-1/2 z-50 loading-spinner !blur-0 !opacity-100 text-accent"></span>
            )}

            <div className="mt-4 font-bold">
              <span>Şu Anda Düzenlenen Oturma Planı:</span>
              <span className="ml-4">{selectedMapName}</span>
            </div>
            {isSeated ? (
              <div>
                         <div className="flex flex-wrap gap-6 my-6 justify-center">
                  <CellLegend
                    variant="available"
                    label="Müsait"
                    quantity={
                      Object.values(eventSeats).filter(
                        (seat) => seat.status === "available",
                      ).length
                    }
                  />
                  <CellLegend
                    variant="blocked"
                    label="Kapalı"
                    quantity={
                      Object.values(eventSeats).filter(
                        (seat) => seat.status === "blocked",
                      ).length
                    }
                  />

                  <CellLegend
                    variant="reserved"
                    label="Rezerve"
                    quantity={
                      Object.values(eventSeats).filter(
                        (seat) => seat.status === "reserved",
                      ).length
                    }
                  />

                  <CellLegend
                    variant="sold"
                    label="Satıldı"
                    quantity={
                      Object.values(eventSeats).filter(
                        (seat) => seat.status === "sold",
                      ).length
                    }
                  />
                </div>
                <div className="flex flex-col  items-left mt-2 ">
              <div
                className={`  ${isEditing ? "opacity-35 blur-sm pointer-events-none" : ""}`}
                onContextMenu={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="relative overflow-auto border-2 bg-transparent select-none">

                         <div data-theme="" className="px-5 bg-transparent">
                  <div className="min-w-max select-none">
       

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

              </div>
</div>
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
              </div>
            ) : (
              <div
                className={` my-4 ${isEditing ? "opacity-35 blur-sm pointer-events-none" : ""}`}
              >
                <div className="flex flex-wrap gap-6 my-6 justify-center">
                  <CellLegend
                    variant="available"
                    label="Müsait"
                    quantity={numberOfTickets}
                  />
                  <CellLegend
                    variant="blocked"
                    label="Kapalı"
                    quantity={
                      mapCapacity -
                      numberOfTickets -
                      Object.values(eventSeats).filter(
                        (seat) => seat.status === "reserved",
                      ).length -                 Object.values(eventSeats).filter(
                        (seat) => seat.status === "sold",
                      ).length
                    }
                  />

                  <CellLegend
                    variant="reserved"
                    label="Rezerve"
                    quantity={
                      Object.values(eventSeats).filter(
                        (seat) => seat.status === "reserved",
                      ).length
                    }
                  />

                  <CellLegend
                    variant="sold"
                    label="Satıldı"
                    quantity={
                      Object.values(eventSeats).filter(
                        (seat) => seat.status === "sold",
                      ).length
                    }
                  />
                </div>
                <div className="font-bold text-3xl">
                  Salon Kapasitesi: {mapCapacity}
                </div>
                <div className="flex gap-4 my-4 align-middle">
                  <span className="font-semibold place-self-center">
                    Satışa Çıkarmak İstenen Bilet Sayısı:
                  </span>

                  <input
                    type="number"
                    value={numberOfTickets}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (Number.isNaN(value)) return;

                      setNumberOfTickets(
                        Math.min(maxSelectable, Math.max(0, value)),
                      );
                    }}
                    max={maxSelectable}
                    min={0}
                    className="input input-secondary w-24"
                  />
                </div>

                <div className="flex gap-4 my-4 align-middle">
                  <span className="font-semibold place-self-center">
                    Bilet Fiyatı:
                  </span>
                  <PriceInput
                    value={nonSeatedPrices}
                    onChange={setNonSeatedPrices}
                  />
                </div>

                <div className="font-bold text-error">{nonSeatedError}</div>

                <button
                  className="btn btn-success mt-4 text-white"
                  onClick={() => {
                    setIsEditing(true);
                    handleNonSeatedPrices();
                  }}
                >
                  Kaydet
                </button>
              </div>
            )}
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
                <PriceInput
                  value={desiredPrice}
                  onChange={setDesiredPrice}
                  onEnter={handleChangeAllPrices}
                  autoFocus
                />
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
