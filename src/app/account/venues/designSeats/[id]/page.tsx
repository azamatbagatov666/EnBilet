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
    copyRow,
  } = useSeatMapCreator();

  const [numberOfSeats, SetNumberOfSeats] = useState<number>(12);
  const [stageLocation, setStageLocation] = useState<stageLocation>("up");

  useEffect(() => {
    updateStageLocation(stageLocation);
  }, [stageLocation]);


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

      <div 
      onContextMenu={(e) => {
            e.preventDefault();
          }}
      className="flex flex-col  items-left mt-2  ">
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
