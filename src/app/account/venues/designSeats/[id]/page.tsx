"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DialogModal from "@/src/components/alerts/DialogModal";
import SuccessAlert from "@/src/components/alerts/SuccessAlert";

import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import useSeatMapCreator from "@/src/hooks/useSeatMapCreator";
import type { VenueType } from "@/src/models/VenueType";
import Row from "@/src/components/seatMap/designer/Row";
import { SeatMapType } from "@/src/models/SeatMapType";
import { useState, useEffect, useRef } from "react";
import type { stageLocation } from "@/src/models/seatMap/SeatMap";

import { use } from "react";
import { useRouter } from "next/navigation";

export default function SeatMapCreatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {
    rows,
    addEmptyRow,
    addSeatedRow,
    deleteRow,
    toggleCell,
    handleOnDragEnd,
    addCellToEnd,
    saveMap,
    deleteTheCell,
    updateSeatLabel,
    updateRowLabel,
    renumerateFromCell,
    addCellToLeft,
    updateStageLocation,
    toggleHandicappedSeat,
    copyRow,
    loadSeatMap,
    clearMap,
    isMapEmpty,
  } = useSeatMapCreator();

  const { id } = use(params);
  const router = useRouter();

  //-------------FETCH------------

  const [maps, setMaps] = useState<SeatMapType[]>([]);
  const [theVenue, setTheVenue] = useState<VenueType>();

  //-------------FORM------------
  const [editType, setEditType] = useState<"create" | "edit" | null>(null);
  const [newMapName, setNewMapName] = useState("");
  var maxNum = 50;
  const [mapCapacity, setMapCapacity] = useState(maxNum);
  const [isSeated, setIsSeated] = useState(true);

  const [editingName, setEditingName] = useState("");

  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);

  const [numberOfSeats, SetNumberOfSeats] = useState<number>(12);
  const [stageLocation, setStageLocation] = useState<stageLocation>("up");

  //------------DIALOGUE&ALERTS---------

  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [editDialogueOpen, setEditDialogueOpen] = useState(false);
  const [dialogueText, setDialogueText] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");

  useEffect(() => {
    updateStageLocation(stageLocation);
  }, [stageLocation]);

  useEffect(() => {
    setStageLocation("up");
  }, [editType]);

  useEffect(() => {
    if (!selectedMapId) return;

    const selected = maps.find((m) => m.mapID === Number(selectedMapId));

    if (!selected || !selected.mapName) return;

    setEditingName(selected.mapName);

    if (selected && selected.isSeated && selected.layoutJS) {
      setIsSeated(true);

      try {
        const parsed = JSON.parse(selected.layoutJS);

        loadSeatMap(parsed); 
        setStageLocation(parsed.stageLocation ?? "up");
      } catch (err) {
      }
    } else if (selected.maxCapacity) {
      setIsSeated(false);
      setMapCapacity(selected.maxCapacity);
    }
  }, [selectedMapId]);

  useEffect(() => {
    (async () => {
      await getVenueInfo();
      getMaps();
    })();
  }, []);

  const getVenueInfo = async () => {
    try {
      const res = await fetchWithAuth(
        `/services/account/get/getTheVenue?venueID=${id}`,
      );

      const data = await res.json();

      setTheVenue(data);
    } catch (err: any) {
      router.push(`/account/venues/`);
    }
  };

  const hasUnsavedChanges = (type: "create" | "edit"): boolean => {
    if (type === "edit") {
      return !isMapEmpty() || newMapName.trim() !== "";
    }

    if (type === "create") {
      const selected = maps.find((m) => m.mapID === Number(selectedMapId));
      if (!selected) return false;

      if (editingName !== selected.mapName) return true;

      const result = saveMap();
      if (typeof result === "string") return true;

      return JSON.stringify(result) !== selected.layoutJS;
    }

    return false;
  };

  const handleEditType = (type: "create" | "edit") => {
    if (type === "edit") {
      if (hasUnsavedChanges("edit")) {
        openEditDialogue();
      } else {
        setEditType(type);
        setIsSeated(true);
        setMapCapacity(maxNum);
        return;
      }
    }

    if (type === "create") {
      if (selectedMapId === "" || selectedMapId === null) {
        setEditType(type);
        setIsSeated(true);
        setMapCapacity(maxNum);
        return;
      }

      if (!isSeated) {
        const selected = maps.find((m) => m.mapID === Number(selectedMapId));
        if (selected?.maxCapacity != mapCapacity) {
          openEditDialogue();
        } else {
          clearMap();
          setSelectedMapId("");
          setEditType(type);
          setIsSeated(true);
          setMapCapacity(maxNum);
          return;
        }
      }

      if (hasUnsavedChanges("create")) {
        openEditDialogue();
      } else {
        clearMap();
        setSelectedMapId("");
        setEditType(type);
        return;
      }
    }
  };

  const getMaps = async () => {
    try {
      const res = await fetchWithAuth(
        `/services/account/get/getMaps?venueID=${id}`,
      );
      const data = await res.json();
      setMaps(data);
    } catch (err: any) {
      return;
    }
  };

  const cleanUp = async () => {
    setDialogueOpen(false);
    setEditDialogueOpen(false);
    getMaps();
    clearMap();
    setEditType(null);
    setEditingName("");
    setNewMapName("");
    setStageLocation("up");
    setSelectedMapId("");
    setMapCapacity(maxNum);
    setIsSeated(true);
  };

  const resetForm = () => {
    setDialogueOpen(false);
    setEditDialogueOpen(false);
    clearMap();
    setEditingName("");
    setNewMapName("");
    setStageLocation("up");
    setSelectedMapId("");
    setMapCapacity(maxNum);
    setIsSeated(true);
  };

  const openEditDialogue = () => {
    setEditDialogueOpen(true);
    setDialogueOpen(true);

  };

  const handleSave = async () => {
    setDialogueOpen(false);
    setEditDialogueOpen(false);

    let layoutResult: any = null;

    if (isSeated) {
      const result = saveMap();

      if (typeof result === "string") {
        setDialogueText(result);
        return;
      }

      layoutResult = result;
    }

    if (editType === "create") {
      if (newMapName.trim() === "") {
        setDialogueText("Lütfen yeni oturma planına bir isim giriniz.");
        return;
      }

      try {
        await fetchWithAuth("/services/account/actions/addMap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mapName: newMapName,
            venueID: id,
            isSeated: isSeated,
            layoutJS: isSeated ? `${JSON.stringify(layoutResult)}` : null,
            maxCapacity: isSeated ? null : mapCapacity,
          }),
        });

        setAlertText("Oturma Planı başarıyla eklendi.");

        cleanUp();
        return true;
      } catch (err: any) {
        setDialogueText(err.message);
      }
    } else if (editType === "edit") {
      if (editingName.trim() == "") {
        setDialogueText("Düzenlenen isim boş olamaz.");
        return;
      }

      try {
        await fetchWithAuth("/services/account/actions/editMap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mapName: editingName,
            mapID: selectedMapId,
            isSeated: isSeated,
            layoutJS: isSeated ? `${JSON.stringify(layoutResult)}` : null,
            maxCapacity: isSeated ? null : mapCapacity,
          }),
        });

        setAlertText("Oturma Planı başarıyla düzenlendi.");
        cleanUp();

        return true;
      } catch (err: any) {
        setDialogueText(err.message);
      }
    }
  };

  const [menuVersion, setMenuVersion] = useState(0);

  return (
    <div className="px-2 md:px-6">
      <div className="">
        <div className="grid lg:flex gap-4 text-xl font-bold my-4">
          <span>
            Salon İsmi:{" "}
            <span className="font-semibold">{theVenue?.venueName}</span>
          </span>
          <span>
            Şehir: <span className="font-semibold">{theVenue?.city}</span>
          </span>
          <span>
            Adres: <span className="font-semibold">{theVenue?.address}</span>
          </span>
        </div>
      </div>

      <div className="flex md:w-max flex-col bg-base-300 px-1 md:p-4 rounded-box">
        <div className="flex">
          <label className="flex items-center align-middle gap-2 cursor-pointer">
            <input
              className="radio radio-info radio-sm"
              type="radio"
              checked={editType === "edit"}
              onChange={() => handleEditType("edit")}
            />
            Oturma Planını düzenle:
          </label>

          <div className="bg-base-300 rounded-box  h-20 px-4 place-items-center flex justify-end">
            {" "}
            <div className="flex ">
              <select
                disabled={editType !== "edit"}
                className="select select-info "
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
            </div>
          </div>
        </div>
        <div className="divider">veya</div>
        <div className="flex">
          <label className="flex items-center align-middle gap-2 cursor-pointer">
            <input
              className="radio radio-info radio-sm"
              type="radio"
              checked={editType === "create"}
              onChange={() => handleEditType("create")}
            />
            Yeni Plan Oluştur:
          </label>
          <div className=" bg-base-300 rounded-box  h-24 px-4 place-items-center flex justify-end">
            <div className="grid align-middle items-center gap-2 ">
              <input
                maxLength={50}
                disabled={editType !== "create"}
                value={newMapName}
                onChange={(e) => setNewMapName(e.target.value)}
                type="text"
                placeholder="Planın İsmi"
                className="input input-info"
              />
              <span className="font-normal text-xs md:w-48 md:h-0">
                "Küçük Sahne", "Ana Sahne" gibi
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${editType === null || (editType === "edit" && (selectedMapId === "" || selectedMapId === null)) ? "0 blur-sm opacity-35  pointer-events-none select-none" : ""}`}
      >
        {editType === "create" && (
          <div className="grid sm:flex gap-4 align-middle my-4">
            <span className="font-bold text-sm sm:text-lg">
              Sabit ve numaralı bir oturma düzeni mevcut mu?
            </span>
            <div className="flex justify-left align-middle self-center gap-2 ">
              <span>Hayır</span>
              <input
                type="checkbox"
                checked={isSeated === true}
                onChange={(e) => {
                  setIsSeated(e.target.checked ? true : false);
                }}
                className="toggle bg-primary border-primary text-white"
              />
              <span>Evet</span>
            </div>
          </div>
        )}

        <div className="mt-2 sm:mt-0">
          <div className="font-bold text-3xl sm:h-12 sm:my-4 grid gap-2 sm:flex items-center ">
            <span className=""> {"Plan İsmi: "}</span>

            {editType === "create" ? (
              <span className="font-semibold sm:px-2 sm:ml-2 max-w-full min-h-9 break-all">
                {" "}
                {newMapName}
              </span>
            ) : editType === "edit" && selectedMapId ? (
              <>
                <div className="flex items-center">
                  <input
                    maxLength={50}
                    type="text"
                    className="input input-accent leading-[48px] text-3xl sm:px-2 w-64 sm:ml-2"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                  />

                  <div className="">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="size-9  ml-2 stroke-black dark:stroke-white"
                    >
                      <path
                        d="M4 20.0001H20M4 20.0001V16.0001L12 8.00012M4 20.0001L8 20.0001L16 12.0001M12 8.00012L14.8686 5.13146L14.8704 5.12976C15.2652 4.73488 15.463 4.53709 15.691 4.46301C15.8919 4.39775 16.1082 4.39775 16.3091 4.46301C16.5369 4.53704 16.7345 4.7346 17.1288 5.12892L18.8686 6.86872C19.2646 7.26474 19.4627 7.46284 19.5369 7.69117C19.6022 7.89201 19.6021 8.10835 19.5369 8.3092C19.4628 8.53736 19.265 8.73516 18.8695 9.13061L18.8686 9.13146L16 12.0001M12 8.00012L16 12.0001"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
          <div className="font-bold mt-4 sm:mt-0">
            {isSeated ? "Numaralı Salon Düzeni" : "Numarasız Salon Düzeni"}
          </div>
        </div>

        {isSeated ? (
          <div className="">
            <div className="flex gap-4 align-middle my-2">
              <span className="font-bold text-sm sm:text-lg">
                Sahne pozisyonu:
              </span>
              <div className="flex justify-left align-middle self-center gap-2 ">
                <span>Yukarıda</span>
                <input
                  type="checkbox"
                  checked={stageLocation === "down"}
                  onChange={(e) =>
                    setStageLocation(e.target.checked ? "down" : "up")
                  }
                  className="toggle border-orange-500 bg-orange-400 hover:bg-orange-700 text-black"
                />
                <span>Aşağıda</span>
              </div>
            </div>

            <div
              onContextMenu={(e) => {
                e.preventDefault();
              }}
              className="flex flex-col  items-left mt-2  "
            >
              <div className="relative overflow-auto border-2 bg-transparent">
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
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                      <Droppable droppableId="rows" direction="vertical">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {rows.map((row, index) => (
                              <Draggable
                                key={row.id}
                                draggableId={row.id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    className="flex"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                  >
                                    <Row
                                      row={row}
                                      index={index}
                                      dragHandleProps={provided.dragHandleProps}
                                      toggleCell={toggleCell}
                                      deleteRow={deleteRow}
                                      addCellToEnd={addCellToEnd}
                                      deleteTheCell={deleteTheCell}
                                      updateSeatLabel={updateSeatLabel}
                                      updateRowLabel={updateRowLabel}
                                      renumerateFromCell={renumerateFromCell}
                                      addCellToLeft={addCellToLeft}
                                      toggleHandicappedSeat={
                                        toggleHandicappedSeat
                                      }
                                      copyRow={copyRow}
                                      totalRows={rows.length}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    <div className="h-16 my-4 flex justify-center">
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
            </div>

            <div className="font-semibold flex gap-4">
              <span>
                Toplam koltuklu sıra:{" "}
                {rows.filter((r) => r.type === "seated").length}
              </span>

              <span>
                Toplam koltuk:{" "}
                {rows.reduce(
                  (sum, r) =>
                    r.type === "seated"
                      ? sum + r.cells.filter((c) => c.type === "seat").length
                      : sum,
                  0,
                )}
              </span>
            </div>

            <div className="mt-4 grid justify-center sm:justify-start text-center sm:flex gap-2">
              <div className="flex group bg-primary duration-200 rounded-md">
                <div className=" px-2 rounded-l-md flex  items-center ">
                  <input
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addSeatedRow(numberOfSeats);
                    }}
                    type="number"
                    value={numberOfSeats}
                    onChange={(e) => SetNumberOfSeats(+e.target.value)}
                    max={maxNum}
                    min={1}
                    className="w-10 h-6 pl-1 bg-white text-black rounded-md"
                  />
                </div>
                <button
                  onClick={() => addSeatedRow(numberOfSeats)}
                  className="btn btn-primary rounded-l-none outline-none border-0 shadow-none translate-0"
                >
                  + Koltuklu Sıra
                </button>
              </div>
              <div>
                <button onClick={addEmptyRow} className="btn btn-secondary">
                  + Boş Sıra
                </button>
              </div>
              <div>
                <button
                  onClick={handleSave}
                  className="btn btn-success text-white"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex gap-4 my-4 align-middle">
              <span className="font-semibold place-self-center">
                Salon Kapasitesi:
              </span>

              <input
                type="number"
                value={mapCapacity}
                onChange={(e) => {
                  const value = Number(e.target.value);

                  if (Number.isNaN(value)) return;

                  setMapCapacity(Math.min(10000, Math.max(1, value)));
                }}
                max={10000}
                min={1}
                className="input input-secondary w-24"
              />
            </div>
            <div className="flex justify-center sm:block">
              <button
                onClick={handleSave}
                className="btn btn-success mt-4 text-white"
              >
                Kaydet
              </button>
            </div>
          </div>
        )}
      </div>

      <DialogModal
        open={dialogueOpen}
        dialogueText={dialogueText}
        onClose={() => {
          setDialogueOpen(false);
          setDialogueText("");
        }}
      >
        <div className="text-left">
  

          {editDialogueOpen && (
            <>
               <span
            className={`${editDialogueOpen ? "text-red-500" : "whitespace-break-spaces"} `}
          >
            Yaptığınız değişiklikleri kaydetmek istiyor musunuz?
          </span>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => {
                    (async () => {
                      const res = await handleSave();
                      if (res) {
                        setEditType(editType ? "edit" : "create");
                      }
                    })();
                  }}
                  className="btn btn-success text-white"
                >
                  Evet
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setEditType(editType === "edit" ? "create" : "edit");
                  }}
                  className="btn btn-error"
                >
                  Hayır
                </button>
                <button
                  onClick={() => {
                    setDialogueOpen(false);
                  }}
                  className="btn btn-warning"
                >
                  İptal
                </button>
              </div>
            </>
          )}
        </div>
      </DialogModal>

      <SuccessAlert open={alertOpen} onClose={() => setAlertOpen(false)} alertText={alertText}>
      </SuccessAlert>
    </div>
  );
}
