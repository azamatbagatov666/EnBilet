interface Props {
  label: string;
  variant:
    | "available"
    | "blocked"
    | "reserved"
    | "sold"
    | "handicapped";
}

export default function CellLegendItem({ label, variant }: Props) {
  const bgClass =
    variant === "available"
      ? "bg-gray-300 border-black"
      : variant === "blocked"
      ? "bg-gray-600 !border-gray-400 text-white line-through decoration-[1.5px]"
      : variant === "reserved"
      ? "bg-yellow-400 border-yellow-700"
      : variant === "sold"
      ? "bg-red-600 border-red-800 text-white"
      : variant === "handicapped"
      ? "bg-blue-500 border-blue-700 text-white"
      : "";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          w-10 h-10 rounded border-2 border-b-8
          flex items-center justify-center font-bold
          ${bgClass}
        `}
      >
        A1
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}