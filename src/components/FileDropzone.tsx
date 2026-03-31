"use client";
import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";

export type FileDropzoneRef = {
  cleanUp: () => void;
};

const FileDropzone = forwardRef<FileDropzoneRef, {
  file: File | null;
  onChange: (file: File | null) => void;
}>(({ file, onChange }, ref) => {
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const MAX_SIZE_MB = 5;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const [error, setError] = useState("");

 function cleanUp() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setIsDragging(false);
    setPreview(null);
    setError("");
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

    useImperativeHandle(ref, () => ({
    cleanUp,
  }));

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave() {
    setIsDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const check = validate(file);
      console.log(check);
      if (!check) {
        return;
      }
    }
    if (!file) return;

    onChange(file);
    setPreview(URL.createObjectURL(file));
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const check = validate(file);
      console.log(check);

      if (!check) {
        return;
      }
    }
    if (!file) return;

    onChange(file);
    setPreview(URL.createObjectURL(file));
  }

  function validate(file: File): boolean {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Sadece JPG, PNG, GIF veya WEBP dosyaları kabul edilir.");
      return false;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Dosya boyutu ${MAX_SIZE_MB}MB'dan büyük olamaz.`);
      return false;
    }

    return true;
  }

  function clearFile() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError("");

    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  useEffect(() => {
  return () => {
    if (preview) URL.revokeObjectURL(preview);
  };
}, [preview]);

  return (
    <>
      <div className="select-none">
        {preview == null ? (
          <div>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`
        flex flex-col items-center justify-center text-center min-w-8 min-h-40 max-w-[500px]
        h-72 border-4 border-dashed rounded-xl 
        transition-colors gap-4  text-white border-slate-300 
        ${isDragging ? "bg-blue-700" : "bg-blue-500"}
      `}
            >
              <svg className="size-12" viewBox="0 0 16 16" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16 0H4V12H16V0ZM9 6L11 8L14 5V10H6V9L9 6ZM9 3C9 3.55228 8.55228 4 8 4C7.44772 4 7 3.55228 7 3C7 2.44772 7.44772 2 8 2C8.55228 2 9 2.44772 9 3Z"
                  fill="white"
                ></path>
                <path d="M0 4V16H12V14H2V4H0Z" fill="white"></path>
              </svg>
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp, image/gif"
                hidden
                ref={inputRef}
                onChange={onFileChange}
              />
              <div className="text-lg ">
                {" "}
                Fotoğrafınızı bu alana sürükleyip bırakabilirsiniz{" "}
              </div>
              <div className="text-lg "> veya </div>
              <div className="grid gap-1">
                <button
                  data-theme="light"
                  className="btn "
                  onClick={() => inputRef.current?.click()}
                >
                  Dosya Seçin
                </button>
                <div className="text-xs text-center">
                  En fazla {MAX_SIZE_MB}MB
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-2 text-red-500 font-bold">
              {error}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className=" bg-gray-500   relative p-1 rounded-3xl">
              <div>
                <button
                  onClick={() => clearFile()}
                  className="btn btn-sm btn-circle btn-error border-2 border-black absolute -top-3 -left-3"
                >
                  ✕
                </button>
                <img src={preview!} className="rounded-3xl" alt="Önizleme" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
})

export default FileDropzone;
