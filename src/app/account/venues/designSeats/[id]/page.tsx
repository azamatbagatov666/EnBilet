"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import useSeatMapCreator from "@/src/hooks/useSeatMapCreator";
import Row from "@/src/components/seatMap/Row";
import { useState, useEffect, useRef } from "react";
import type { stageLocation } from "@/src/models/seatMap/SeatMap";

export default function SeatMapCreatorPage() {
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
    moveRowDown,
    moveRowUp,
  } = useSeatMapCreator();

  const [numberOfSeats, SetNumberOfSeats] = useState<number>(12);
  const [stageLocation, setStageLocation] = useState<stageLocation>("up");

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function clamp(v: number, min: number, max: number) {
    return Math.min(max, Math.max(min, v));
  }

  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  function onMouseDown(e: React.MouseEvent) {
    // Left click only
    if (e.button !== 0) return;

    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isPanning) return;

    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;

    setOffset({
      x: offsetStart.current.x + dx,
      y: offsetStart.current.y + dy,
    });
  }

  function endPan() {
    setIsPanning(false);
  }

  function zoomAtCursor(e: WheelEvent) {
    if (!wrapperRef.current) return;

    const zoomIntensity = 0.0015;
    const scaleDelta = 1 - e.deltaY * zoomIntensity;

    const newScale = clamp(scale * scaleDelta, 0.50, 2.66);

    const rect = wrapperRef.current.getBoundingClientRect();

    // Mouse position in wrapper space
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse position to CONTENT space
    const contentX = (mouseX - offset.x) / scale;
    const contentY = (mouseY - offset.y) / scale;

    // Recalculate offset so content point stays under cursor
    const newOffsetX = mouseX - contentX * newScale;
    const newOffsetY = mouseY - contentY * newScale;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
    console.log(scale)
  }
  useEffect(() => {
    closeAllMenus();
    const el = wrapperRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAtCursor(e);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scale, offset]);

  useEffect(() => {
    updateStageLocation(stageLocation);
  }, [stageLocation]);

  function zoomToPoint(targetX: number, targetY: number, newScale: number) {
    setOffset({
      x: targetX - ((targetX - offset.x) / scale) * newScale,
      y: targetY - ((targetY - offset.y) / scale) * newScale,
    });
    setScale(newScale);
  }

  function zoomIn() {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newScale = clamp(scale + 0.1, 0.3, 6);
    zoomToPoint(centerX, centerY, newScale);
  }

  function zoomOut() {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newScale = clamp(scale - 0.1, 0.3, 6);
    zoomToPoint(centerX, centerY, newScale);
  }

  const closeAllMenus = () => setMenuVersion((prev) => prev + 1);

  const [menuVersion, setMenuVersion] = useState(0);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Seat Map Creator</h1>
      <span className="font-bold text-lg">Sahne pozisyonu:</span>
      <div className="flex justify-left gap-2 mt-2">
        <span>Yukarıda</span>
        <input
          type="checkbox"
          checked={stageLocation === "down"}
          onChange={(e) => setStageLocation(e.target.checked ? "down" : "up")}
          className="toggle border-orange-500 bg-orange-400 hover:bg-orange-700"
        />
        <span>Aşağıda</span>
      </div>

      <div className="flex flex-col items-left mt-2  bg-[repeating-linear-gradient(45deg,_#e1e1e1_0,_#e1e1e1_1px,_transparent_0,_transparent_50%)] dark:bg-[repeating-linear-gradient(45deg,_#374151_0,_#374151_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed">
        <div
          ref={wrapperRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endPan}
          onMouseLeave={endPan}
          className="relative overflow-hidden border-2 bg-transparent cursor-grab"
        >
          <div
            data-theme=""
            className="px-5 bg-transparent"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: "0 0",
              transition: "transform 0.05s linear",
            }}
            onContextMenu={(e) => {
              e.preventDefault();
            }}
          >
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
                                menuVersion={menuVersion}
                                moveRowDown={moveRowDown}
                                moveRowUp={moveRowUp}
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
      <div className="join flex justify-center ">
        <button
          className="join-item btn rounded-tl-none !border-black  dark:!border-[#e5e7eb]"
          onClick={(e) => {
            zoomOut();
          }}
        >
          <svg width="35px" height="35px" viewBox="0 0 24 24" fill="none">
            <path
              d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20.9992 21L14.9492 14.95"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 10H14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          className="join-item btn   !border-black dark:!border-[#e5e7eb]"
          onClick={(e) => {
            setScale(1);
            setOffset({ x: 0, y: 0 });
          }}
        >
          <svg
            fill="currentColor"
            width="35px"
            height="35px"
            viewBox="0 0 32 32"
            id="icon"
          >
            <path
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="0.5"
              stroke="currentColor"
              d="M21.4479,20A10.856,10.856,0,0,0,24,13,11,11,0,1,0,13,24a10.856,10.856,0,0,0,7-2.5521L27.5859,29,29,27.5859ZM13,22a9,9,0,1,1,9-9A9.01,9.01,0,0,1,13,22Z"
            />
            <path
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="0.5"
              stroke="currentColor"
              d="M10,12H8V10a2.0023,2.0023,0,0,1,2-2h2v2H10Z"
            />
            <path
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="0.5"
              stroke="currentColor"
              d="M18,12H16V10H14V8h2a2.0023,2.0023,0,0,1,2,2Z"
            />
            <path
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="0.5"
              stroke="currentColor"
              d="M12,18H10a2.0023,2.0023,0,0,1-2-2V14h2v2h2Z"
            />
            <path
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="0.5"
              stroke="currentColor"
              d="M16,18H14V16h2V14h2v2A2.0023,2.0023,0,0,1,16,18Z"
            />
          </svg>
        </button>
        <button
          className="join-item btn rounded-tr-none !border-black  dark:!border-[#e5e7eb]"
          onClick={(e) => {
            zoomIn();
          }}
        >
          <svg width="35px" height="35px" viewBox="0 0 24 24" fill="none">
            <path
              d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20.9992 21L14.9492 14.95"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 10H14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 6V14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
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
              className="w-10 h-6  bg-white text-black rounded-md "
              name=""
              id=""
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
        <button onClick={saveMap} className="btn btn-success text-white">
          Kaydet
        </button>
      </div>
    </div>
  );
}
