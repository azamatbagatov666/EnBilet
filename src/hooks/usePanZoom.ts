import { useEffect, useRef, useState } from "react";

export function usePanZoom() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const panStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  function clamp(v: number, min: number, max: number) {
    return Math.min(max, Math.max(min, v));
  }

  function startPan(e: React.MouseEvent, blocked = false) {
    if (e.button !== 0 || blocked) return;

    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
  }

  function pan(e: React.MouseEvent, blocked = false) {
    if (!isPanning || blocked) return;

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

  function zoomAtPoint(x: number, y: number, newScale: number) {
    setOffset({
      x: x - ((x - offset.x) / scale) * newScale,
      y: y - ((y - offset.y) / scale) * newScale,
    });
    setScale(newScale);
  }

  function zoomIn() {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    zoomAtPoint(rect.width / 2, rect.height / 2, clamp(scale + 0.1, 0.3, 6));
  }

  function zoomOut() {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    zoomAtPoint(rect.width / 2, rect.height / 2, clamp(scale - 0.1, 0.3, 6));
  }

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomIntensity = 0.0015;
      const newScale = clamp(scale * (1 - e.deltaY * zoomIntensity), 0.3, 6);

      zoomAtPoint(mouseX, mouseY, newScale);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scale, offset]);

  return {
    wrapperRef,
    scale,
    offset,
    startPan,
    pan,
    endPan,
    zoomIn,
    zoomOut,
    reset: () => {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    },
  };
}