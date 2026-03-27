"use client";

import { useState } from "react";
import { uploadFile, uploadImage } from "@/api/upload";

type Props = {
  type?: "file" | "image";
  onUploaded?: (url: string) => void;
};

export default function UploadComponent({ type = "file", onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSelect = (f: File | null) => {
    setFile(f);
    setError("");
    if (!f) return;

    // preview image
    if (type === "image") {
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const uploadedUrl =
        type === "image" ? await uploadImage(file) : await uploadFile(file);

      setUrl(uploadedUrl);
      onUploaded?.(uploadedUrl);
    } catch (err) {
      console.error(err);
      setError("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      
      {/* Upload Box */}
      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary/40 rounded-xl cursor-pointer 
        bg-gray-50 dark:bg-[#0a0a0f] hover:border-primary/70 hover:bg-primary/5 
        transition-all text-center px-4">

        <input
          type="file"
          accept={type === "image" ? "image/*" : "*"}
          onChange={(e) => handleSelect(e.target.files?.[0] || null)}
          className="hidden"
        />

        {!preview ? (
          <>
            <p className="text-sm text-gray-500 dark:text-white/40">
              Click to upload {type}
            </p>
            <p className="text-xs text-primary mt-1">
              {type === "image" ? "PNG, JPG, WEBP" : "Any file"}
            </p>
          </>
        ) : (
          <img
            src={preview}
            alt="preview"
            className="h-full object-contain rounded-lg"
          />
        )}
      </label>

      {/* File name */}
      {file && (
        <p className="text-xs text-gray-500 dark:text-white/40 truncate">
          {file.name}
        </p>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full py-2.5 rounded-xl font-semibold text-black 
        bg-primary hover:bg-secondary transition-all 
        disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {/* Result */}
      {url && (
        <div className="p-3 rounded-xl bg-gray-100 dark:bg-[#13121a] text-sm break-all border border-primary/20">
          <p className="text-xs text-gray-500 dark:text-white/40 mb-1">
            Uploaded URL
          </p>
          <a
            href={url}
            target="_blank"
            className="text-primary underline"
          >
            {url}
          </a>

          {type === "image" && (
            <img
              src={url}
              alt="result"
              className="mt-3 rounded-lg max-h-40 object-cover w-full"
            />
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}