import { useState } from "react";
import type { SeatCell } from "@/src/models/seatMap/SeatCell";
import type { SeatRow } from "@/src/models/seatMap/SeatRow";
import type { SeatMap, stageLocation } from "@/src/models/seatMap/SeatMap";

function createSeat(label: string): SeatCell {
  return {
    id: crypto.randomUUID(),
    type: "seat",
    label,
    seatKind: "regular",
  };
}

export default function useSeatMapCreator() {
  const [seatMap, setSeatMap] = useState<SeatMap>({
    id: crypto.randomUUID(),
    name: "New Seat Map",
    venueId: 1,
    venueName: "Test Venue",
    blockId: 1,
    blockName: "General",
    rows: [],
    stageLocation: "up",
  });

  function updateStageLocation(location: stageLocation) {
    setSeatMap((prev) => ({
      ...prev,
      stageLocation: location,
    }));
  }

  /* ---------------- ROWS ---------------- */

  function getNextRowLabel(rows: SeatRow[]): string {
    const used = new Set(
      rows.filter((r) => r.type === "seated").map((r) => r.label),
    );

    for (let i = 0; i < 26; i++) {
      const label = String.fromCharCode(65 + i);
      if (!used.has(label)) return label;
    }

    // fallback if more than Z (optional)
    return `R${rows.length + 1}`;
  }

  function addSeatedRow(quantity: number) {
    setSeatMap((prev) => {
      const rowLabel = getNextRowLabel(prev.rows);

      const newRow: SeatRow = {
        id: crypto.randomUUID(),
        type: "seated",
        label: rowLabel,
        order: prev.rows.length,
        cells: Array.from({ length: quantity }).map((_, i) =>
          createSeat(String(i + 1)),
        ),
      };

      return {
        ...prev,
        rows: [...prev.rows, newRow],
      };
    });
  }
  function addEmptyRow() {
    setSeatMap((prev) => ({
      ...prev,
      rows: [
        ...prev.rows,
        {
          id: crypto.randomUUID(),
          type: "empty",
          label: "",
          order: prev.rows.length,
          cells: [],
        },
      ],
    }));
  }

  function deleteRow(rowId: string) {
    setSeatMap((prev) => ({
      ...prev,
      rows: prev.rows.filter((r) => r.id !== rowId),
    }));
  }

  function updateRowLabel(rowId: string, newLabel: string): boolean {
    let hasDuplicate = false;
    newLabel = newLabel.replace(/\s+/g, ' ').trim();
    setSeatMap((prev) => {
      const exists = prev.rows.some(
        (r) => r.label.trim().toLowerCase() === newLabel.trim().toLowerCase() && r.id.trim().toLowerCase() !== rowId.trim().toLowerCase(),
      );

      if (exists) {
        hasDuplicate = true
        return prev;}

      return {
        ...prev,
        rows: prev.rows.map((row) =>
          row.id === rowId ? { ...row, label: newLabel } : row,
        ),
      };
    });

    return hasDuplicate;
  }

  /* ---------------- CELLS ---------------- */

  function getNextSeatLabel(cells: SeatCell[]): string {
    const seatLabels = cells
      .filter((c) => c.type === "seat")
      .map((c) => Number(c.label))
      .filter((n) => !Number.isNaN(n));

    const max = seatLabels.length ? Math.max(...seatLabels) : 0;
    return String(max + 1);
  }

  function addCellToLeft(cellId: string) {
    setSeatMap((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => {
        const index = row.cells.findIndex((c) => c.id === cellId);
        if (index === -1) return row;

        const cells = [...row.cells];
        cells.splice(index, 0, {
          id: crypto.randomUUID(),
          type: "space",
        });

        return { ...row, cells };
      }),
    }));
  }

  function toggleCell(cellId: string) {
    setSeatMap((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => {
        const index = row.cells.findIndex((c) => c.id === cellId);
        if (index === -1) return row;

        const cell = row.cells[index];

        // seat → space
        if (cell.type === "seat") {
          const cells = [...row.cells];
          cells[index] = { id: cell.id, type: "space" };
          return { ...row, cells };
        }

        // space → seat
        const nextLabel = getNextSeatLabel(row.cells);
        const cells = [...row.cells];
        cells[index] = createSeat(nextLabel);

        return { ...row, cells };
      }),
    }));
  }

  function addCellToEnd(rowId: string) {
    setSeatMap((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => {
        if (row.id !== rowId) return row;

        const seatCount = row.cells.filter((c) => c.type === "seat").length;
        if (seatCount >= 50) return row;

        const newSeat = createSeat(getNextSeatLabel(row.cells));

        return {
          ...row,
          cells: [...row.cells, newSeat],
        };
      }),
    }));
  }

  function toggleHandicappedSeat(cellId: string) {
    setSeatMap((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => ({
        ...row,
        cells: row.cells.map((cell) => {
          if (cell.id !== cellId) return cell;
          if (cell.type !== "seat") return cell;

          return {
            ...cell,
            seatKind:
              cell.seatKind === "handicapped" ? "regular" : "handicapped",
          };
        }),
      })),
    }));
  }

  /* ---------------- DND ---------------- */

  function handleOnDragEnd(result: any) {
    if (!result.destination) return;

    setSeatMap((prev) => {
      const rows = Array.from(prev.rows);
      const [moved] = rows.splice(result.source.index, 1);
      rows.splice(result.destination.index, 0, moved);

      return {
        ...prev,
        rows: rows.map((r, i) => ({ ...r, order: i })),
      };
    });
  }

  function deleteTheCell(cellId: string) {
    setSeatMap((prev) => {
      const newRows = prev.rows.map((row) => ({
        ...row,
        cells: row.cells.filter((cell) => cell.id !== cellId),
      }));
      return {
        ...prev,
        rows: newRows,
      };
    });
  }

  function renumerateFromCell(
    cellId: string,
    step: number = 1,
    direction: string = "up",
  ): string {
    let error = "";

    setSeatMap((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => {
        const startIndex = row.cells.findIndex((c) => c.id === cellId);
        if (startIndex === -1) return row;

        const startLabel = row.cells[startIndex]?.label;
        const startNumber = Number(startLabel);

        //  non-numeric start
        if (!Number.isInteger(startNumber)) {
          error = "NON_NUMERIC_START";
          return row;
        }

        const usedNumbers = new Set<number>();

        // collect existing numbers BEFORE startIndex
        row.cells.forEach((cell, idx) => {
          if (cell.type === "seat" && idx < startIndex) {
            const n = Number(cell.label);
            if (Number.isInteger(n)) usedNumbers.add(n);
          }
        });

        let currentNumber = startNumber;

        const newCells = row.cells.map((cell, index) => {
          if (cell.type !== "seat" || index < startIndex) return cell;

          //  below 1
          if (currentNumber < 1) {
            error = "NUMBER_BELOW_ONE";
            return cell;
          }

          //  duplicate
          if (usedNumbers.has(currentNumber)) {
            error = "DUPLICATE_NUMBER";
            return cell;
          }

          usedNumbers.add(currentNumber);

          const updated = {
            ...cell,
            label: String(currentNumber),
          };

          currentNumber =
            direction === "up" ? currentNumber + step : currentNumber - step;

          return updated;
        });

        return error ? row : { ...row, cells: newCells };
      }),
    }));

    return error;
  }

  function saveMap() {
    console.log(seatMap);
  }

function updateSeatLabel(seatId: string, newLabel: string): boolean {
  newLabel = newLabel.replace(/\s+/g, ' ').trim();
  const normalized = newLabel.toLowerCase();
  let hasDuplicate = false;

  setSeatMap((prev) => {
    return {
      ...prev,
      rows: prev.rows.map((row) => {
        // Is this the row containing the seat?
        const seatIndex = row.cells.findIndex(
          (c) => c.id === seatId && c.type === "seat"
        );

        if (seatIndex === -1) return row; // not this row

        // ✅ check duplicates ONLY in this row
        hasDuplicate = row.cells.some(
          (cell) =>
            cell.type === "seat" &&
            cell.id !== seatId &&
            cell.label?.toLowerCase() === normalized
        );

        if (hasDuplicate) return row; // abort update for this row

        return {
          ...row,
          cells: row.cells.map((cell) =>
            cell.id === seatId && cell.type === "seat"
              ? { ...cell, label: newLabel }
              : cell
          ),
        };
      }),
    };
  });

  return !hasDuplicate;
}

  return {
    seatMap,
    rows: seatMap.rows,
    addSeatedRow,
    addEmptyRow,
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
  };
}
