type Props = {
className?: string;
clearFile?: () => void;
preview:string | null;
outsource?:boolean
};

export default function ImagePreview({ className = "", clearFile, preview,outsource=false }: Props) {
  return (
    <div className="flex justify-left px-2 my-4">
      <div className={` bg-gray-500   relative p-1 ${className}`}>
        <div>
          <button
            onClick={clearFile}
            className="btn btn-sm btn-circle btn-error border-2 border-black absolute -top-3 -left-3"
          >
            ✕
          </button>
          <img
            src={outsource ? `https://cocukakli.blob.core.windows.net/public-images/${preview!}` : preview!}
            
            className="rounded-3xl max-w-[300px]"
            alt="Önizleme"
          />
        </div>
      </div>
    </div>
  );
}
