"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DialogModal from "@/src/components/alerts/DialogModal";
import SuccessAlert from "@/src/components/alerts/SuccessAlert";

import { fetchWithAuth } from "@/src/lib/fetchWithAuth";
import useSeatMapCreator from "@/src/hooks/useSeatMapCreator";
import type { VenueType } from "@/src/models/VenueType";
import Row from "@/src/components/seatMap/Row";
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

    if (!selected || !selected.layoutJS || !selected.mapName) return;

    setEditingName(selected.mapName);
    try {
      const parsed = JSON.parse(selected.layoutJS);

      loadSeatMap(parsed); // 👈 BOOM
      setStageLocation(parsed.stageLocation ?? "up");
    } catch (err) {
      console.error("Invalid seat map JSON", err);
    }
  }, [selectedMapId]);

  useEffect(() => {
    (async () => {
      await getVenueInfo();
      getMaps();
    })();
  }, []);

  const getVenueInfo = async () => {
    const res = await fetchWithAuth(
      `/services/account/get/getTheVenue?venueID=${id}`,
    );
    if (!res.ok) {
      router.push(`/account/venues/`);
    }
    const data = await res.json();

    setTheVenue(data);
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
        return;
      }
    }

    if (type === "create") {

      if (selectedMapId === "" || selectedMapId === null) {
        setEditType(type);
        return;
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
    const res = await fetchWithAuth(
      `/services/account/get/getMaps?venueID=${id}`,
    );
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setMaps(data);
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
  };

  const resetForm = () => {
    setDialogueOpen(false);
    setEditDialogueOpen(false);
    clearMap();
    setEditingName("");
    setNewMapName("");
    setStageLocation("up");
    setSelectedMapId("");
  };

  const openEditDialogue = () => {
    setDialogueText("Yaptığınız değişiklikleri kaydetmek istiyor musunuz?");
    setEditDialogueOpen(true);
    setDialogueOpen(true);
  };

  const handleSave = async () => {
    setDialogueOpen(false);
    setEditDialogueOpen(false);
    const result = saveMap();

    if (typeof result == "string") {
      setDialogueText(result);
      setDialogueOpen(true);
      return;
    }

    if (editType === "create" && typeof result == "object") {
      if (newMapName.trim() == "") {
        setDialogueText("Lütfen yeni oturma planına bir isim giriniz.");
        setDialogueOpen(true);
        return;
      }
      const res = await fetchWithAuth("/services/account/actions/addMap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mapName: newMapName,
          venueID: id,
          layoutJS: JSON.stringify(result),
        }),
      });

      if (res.ok) {
        setAlertText("Oturma Planı başarıyla eklendi.");
        setAlertOpen(true);

        cleanUp();
        return true;

      }
    } else if (editType === "edit" && typeof result == "object") {
      if (editingName.trim() == "") {
        setDialogueText("Düzenlenen isim boş olamaz.");
        setDialogueOpen(true);
        return;
      }

      const res = await fetchWithAuth("/services/account/actions/editMap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mapName: editingName,
          mapID: selectedMapId,
          layoutJS: JSON.stringify(result),
        }),
      });

      if (res.ok) {
        setAlertText("Oturma Planı başarıyla düzenlendi.");
        setAlertOpen(true);

        cleanUp();

        return true;
      }
    }
  };

  const [menuVersion, setMenuVersion] = useState(0);

  return (
    <div className="px-6">
      <div className="flex justify-center text-3xl font-bold ">
        <span className="bg-red-600 rounded-xl p-2 dark:text-white duration-150">
          Oturma Planı Oluştur
        </span>
      </div>

      <div className="flex gap-4">
        <div className="text-xl font-bold mb-4">
          Salon Adı:{" "}
          <span className="font-semibold">{theVenue?.venueName}</span>{" "}
        </div>
        <div className="text-xl font-bold mb-4">
          Şehir: <span className="font-semibold">{theVenue?.city}</span>
        </div>
        <div className="text-xl font-bold mb-4">
          Adres: <span className="font-semibold">{theVenue?.address}</span>
        </div>
      </div>

      <div className="flex w-max flex-col bg-base-300 p-4 rounded-box">
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
          <div className=" bg-base-300 rounded-box  h-20 px-4 place-items-center flex justify-end">
            <div className="grid align-middle items-center gap-2 ">
              <input
                disabled={editType !== "create"}
                value={newMapName}
                onChange={(e) => setNewMapName(e.target.value)}
                type="text"
                placeholder="Planın Adı"
                className="input input-info"
              />
                  <span className="font-normal text-xs w-48 h-0">"Küçük Sahne", "Ana Sahne" gibi</span>

            </div>
          </div>
        </div>
      </div>

      <div
        className={`${editType === null || (editType === "edit" && (selectedMapId === "" || selectedMapId === null)) ? "0 blur-sm opacity-35  pointer-events-none select-none" : ""}`}
      >
        <div>
          <div className="font-bold text-3xl h-12 my-4 flex items-center ">
            {"Plan Adı: "}
            {editType === "create" ? (
              <span className=" px-2 ml-2"> {newMapName}</span>
            ) : editType === "edit" && selectedMapId ? (
              <>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="input input-accent leading-[48px] text-3xl px-2 w-64 ml-2"
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
        </div>

        <div className="flex gap-4 align-middle mt-2">
          <span className="font-bold text-lg">Sahne pozisyonu:</span>
          <div className="flex justify-left align-middle self-center gap-2 ">
            <span>Yukarıda</span>
            <input
              type="checkbox"
              checked={stageLocation === "down"}
              onChange={(e) =>
                setStageLocation(e.target.checked ? "down" : "up")
              }
              className="toggle border-orange-500 bg-orange-400 hover:bg-orange-700"
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
                      <div ref={provided.innerRef} {...provided.droppableProps}>
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
                                  toggleHandicappedSeat={toggleHandicappedSeat}
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

        <div className="mt-4 flex gap-2">
          <div className="flex group bg-[#4a00ff] hover:bg-[#3f00e7] dark:bg-[#7480ff] dark:hover:bg-[#646ee4] duration-200 rounded-md ">
            <div className=" px-2 rounded-l-md flex  items-center ">
              <input
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSeatedRow(numberOfSeats);
                }}
                type="number"
                value={numberOfSeats}
                onChange={(e) => SetNumberOfSeats(+e.target.value)}
                max={50}
                min={1}
                className="w-10 h-6 pl-1 bg-white text-black rounded-md "
              />
            </div>
            <button
              onClick={() => addSeatedRow(numberOfSeats)}
              className="btn btn-primary rounded-l-none outline-none border-0"
            >
              + Koltuklu Sıra
            </button>
          </div>
          <button onClick={addEmptyRow} className="btn btn-secondary">
            + Boş Sıra
          </button>
          <button onClick={handleSave} className="btn btn-success text-white">
            Kaydet
          </button>
        </div>
      </div>

      <DialogModal
        open={dialogueOpen}
        onClose={() => {
          setDialogueOpen(false);
          setEditDialogueOpen(false);
        }}
      >
        <div className="text-left">
          <span
            className={`${editDialogueOpen ? "text-red-500" : "whitespace-break-spaces"} `}
          >
            {dialogueText}
          </span>

          {editDialogueOpen && (
            <>
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
                  className="btn btn-success"
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
                    setEditDialogueOpen(false);
                    
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

      <SuccessAlert open={alertOpen} onClose={() => setAlertOpen(false)}>
        {alertText}
      </SuccessAlert>
    </div>
  );
}
