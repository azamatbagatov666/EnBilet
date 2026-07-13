"use client";
import { useState } from "react";
import FileDropzone from "@/src/components/image/FileDropzone";
import ImagePreview from "@/src/components/image/ImagePreview";

type ImageFileWithThumb = {
  original: File;
  thumbnail: File;
};

type ImageFileWithoutThumb = {
  original: File;
};

type ImageFile = ImageFileWithThumb | ImageFileWithoutThumb | null;

export type ImageCategoryConfig<K extends string> = {
  key: K;
  title: string;
  description?: string;
  uploadPath: string;
  withThumbs?: boolean;
  maxSizeMB?: number;
  currentPath?: string | null;
};

type ImageCollectionProps<K extends string> = {
  entityId: string;
  config: readonly ImageCategoryConfig<K>[];
  value?: Partial<Record<K, ImageFile>>;
  onChange?: (data: Partial<Record<K, ImageFile>>) => void;
  clearFile: (imageKey: string) => Promise<void> | void;

};

export default function ImageCollection<K extends string>({
  config,
  value,
  onChange,
  clearFile,
}: ImageCollectionProps<K>) {
  const [images, setImages] = useState<Partial<Record<K, ImageFile>>>(
    value ?? {},
  );

function updateImage(key: K, file: ImageFile) {
  const next = {
    ...images,
    [key]: file,
  };

  setImages(next);
  onChange?.(next);
}

  return (
    <div className="space-y-6">
      {config.map((category) => (
        <section key={category.key} className="space-y-2">
          <h3 className="text-lg font-semibold">{category.title}</h3>

          {category.description && (
            <p className="text-sm text-gray-500">{category.description}</p>
          )}

          {category.withThumbs ? (
            <>
              {category.currentPath ? (
                <ImagePreview
                  outsource={true}
                  preview={category.currentPath}
                  clearFile={() => clearFile(category.key)}
                />
              ) : (
                <FileDropzone
                  withThumbs={true}
                  file={(images[category.key] as ImageFileWithThumb) ?? null}
                  MAX_SIZE_MB={category.maxSizeMB}
                  onChange={(file) => updateImage(category.key, file)}
                />
              )}
            </>
          ) : (
            <>
              {category.currentPath ? (
                <ImagePreview
                  outsource={true}
                  preview={category.currentPath}
                  clearFile={() => clearFile(category.key)}
                />
              ) : (
                <FileDropzone
                  withThumbs={false}
                  file={(images[category.key] as ImageFileWithoutThumb) ?? null}
                  MAX_SIZE_MB={category.maxSizeMB}
                  onChange={(file) => updateImage(category.key, file)}
                />
              )}
            </>
          )}
        </section>
      ))}
    </div>
  );
}
