interface Props {
  label: string;
  variant:
    | "available"
    | "blocked"
    | "reserved"
    | "sold"
    | "handicapped";
  quantity?: number;

}

  import HandiSvg from "@/src/components/svg/HandiSvg";


export default function CellLegendItem({ label, variant, quantity }: Props) {
  const bgClass =
    variant === "available"
      ? "bg-gray-300 border-black text-black"
      : variant === "blocked"
      ? "bg-gray-600 !border-gray-400 text-white line-through decoration-[1.5px]"
      : variant === "reserved"
      ? "bg-yellow-400 border-yellow-700 text-black"
      : variant === "sold"
      ? "bg-red-600 border-red-800 text-white"
      : variant === "handicapped"
      ? "bg-blue-500 border-blue-700 text-white"
      : "";

  return (
    <div className="flex justify-center">
    <div className="grid gap-2">
    <div className="flex items-center gap-2">
      <div
        className={`
          w-10 h-10 rounded border-2 border-b-8
          flex items-center justify-center font-bold
          ${bgClass}
        `}
      >
        A1
{variant == "handicapped" &&     <HandiSvg></HandiSvg>          
}
           

   
       
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
    {quantity != undefined && <div className="text-center flex justify-center"><div className={` rounded-box w-12 border ${bgClass} no-underline border-black`}>{quantity}</div></div>}
    
    </div>
    </div>
  );
}