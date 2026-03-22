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

  function updateRowLabel(rowId: string, newLabel: string) {
    setSeatMap((prev) => {
      const exists = prev.rows.some(
        (r) => r.label === newLabel && r.id !== rowId,
      );

      if (exists) return prev;

      return {
        ...prev,
        rows: prev.rows.map((row) =>
          row.id === rowId ? { ...row, label: newLabel } : row,
        ),
      };
    });
  }


  /* ---------------- ROW MOVE ---------------- */


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
  setSeatMap(prev => ({
    ...prev,
    rows: prev.rows.map(row => ({
      ...row,
      cells: row.cells.map(cell => {
        if (cell.id !== cellId) return cell;
        if (cell.type !== "seat") return cell;

        return {
          ...cell,
          seatKind:
            cell.seatKind === "handicapped"
              ? "regular"
              : "handicapped",
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

  function renumerateFromCell(cellId: string, step: number = 1) {
    setSeatMap((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => {
        const startIndex = row.cells.findIndex((c) => c.id === cellId);
        if (startIndex === -1) return row;

        // Determine starting number
        let currentNumber = Number(row.cells[startIndex]?.label) || 1;

        const newCells = row.cells.map((cell, index) => {
          if (cell.type !== "seat") return cell;
          if (index < startIndex) return cell;

          const updated = {
            ...cell,
            label: String(currentNumber),
          };

          currentNumber += step;
          return updated;
        });

        return {
          ...row,
          cells: newCells,
        };
      }),
    }));
  }

  function saveMap() {
    console.log(seatMap);
  }

  function updateSeatLabel(seatId: string, newLabel: string) {
    setSeatMap((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => ({
        ...row,
        cells: row.cells.map((cell) =>
          cell.id === seatId && cell.type === "seat"
            ? { ...cell, label: newLabel }
            : cell,
        ),
      })),
    }));
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
