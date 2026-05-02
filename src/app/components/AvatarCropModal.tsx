import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "motion/react";

interface Props {
  src: string;
  onConfirm: (cropped: string) => void;
  onCancel: () => void;
}

const SIZE = 240;
const EXPORT_SIZE = 320;

export function AvatarCropModal({ src, onConfirm, onCancel }: Props) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setReady(true);
    };
    img.src = src;
  }, [src]);

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    const r = SIZE / 2;
    ctx.clearRect(0, 0, SIZE, SIZE);
    const baseScale = SIZE / Math.min(img.width, img.height);
    const scale = baseScale * zoom;
    const w = img.width * scale;
    const h = img.height * scale;
    const x = r - w / 2 + offset.x;
    const y = r - h / 2 + offset.y;
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }, [zoom, offset]);

  useEffect(() => {
    if (ready) drawPreview();
  }, [ready, drawPreview]);

  const getXY = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getXY(e);
    dragStart.current = { x, y, ox: offset.x, oy: offset.y };
    dragging.current = true;
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current || !dragStart.current) return;
    const { x, y } = getXY(e);
    setOffset({
      x: dragStart.current.ox + x - dragStart.current.x,
      y: dragStart.current.oy + y - dragStart.current.y,
    });
  };

  const onPointerUp = () => {
    dragging.current = false;
    dragStart.current = null;
  };

  const handleConfirm = () => {
    const canvas = document.createElement("canvas");
    canvas.width = EXPORT_SIZE;
    canvas.height = EXPORT_SIZE;
    const ctx = canvas.getContext("2d")!;
    const img = imgRef.current!;
    const r = EXPORT_SIZE / 2;
    const factor = EXPORT_SIZE / SIZE;
    const baseScale = SIZE / Math.min(img.width, img.height);
    const scale = baseScale * zoom * factor;
    const w = img.width * scale;
    const h = img.height * scale;
    const x = r - w / 2 + offset.x * factor;
    const y = r - h / 2 + offset.y * factor;
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
    onConfirm(canvas.toDataURL("image/jpeg", 0.85));
  };

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center gap-5 px-6 w-full">
        <p className="text-white font-bold text-base tracking-wide">Adjust your photo</p>
        <p className="text-white/50 text-xs -mt-3">Drag to reposition · Slider to zoom</p>

        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="rounded-full"
            style={{
              cursor: dragging.current ? "grabbing" : "grab",
              touchAction: "none",
              display: "block",
              background: "#111",
            }}
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
          />
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: "0 0 0 3px #256DE9, 0 0 0 6px rgba(37,109,233,0.25)" }}
          />
        </div>

        <div className="flex items-center gap-3 w-full max-w-[240px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
            <path d="M11 8v6M8 11h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 20l-2.5-2.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: "#256DE9" }}
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
            <path d="M11 8v6M8 11h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 20l-2.5-2.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex gap-3 w-full max-w-[240px]">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold"
            style={{ background: "#256DE9" }}
          >
            Save Photo
          </button>
        </div>
      </div>
    </motion.div>
  );
}
