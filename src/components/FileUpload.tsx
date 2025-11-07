import FileUploadIcon from "@mui/icons-material/FileUpload";
import { useRef, useState, type ChangeEvent } from "react";

interface FileUploadProps {
  label?: string;
  required?: boolean;
  maxSize?: number; // in MB
  acceptedFileTypes?: string;
  onFileChange?: (file: File | null) => void;
  initialFile?: File | null;
  placeholder?: string;
  errorText?: string;
}

export default function FileUpload({
  label = "Add File",
  required = false,
  maxSize = 2, // Default 2MB
  acceptedFileTypes = "image/*",
  onFileChange,
  initialFile = null,
  placeholder = "Add File",
  errorText = "",
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const file = files ? files[0] : null;
    const maxSizeInBytes = maxSize * 1024 * 1024;

    if (file && file.size <= maxSizeInBytes) {
      setSelectedFile(file);
      if (onFileChange) {
        onFileChange(file);
      }
    } else if (file) {
      alert(`File size exceeds ${maxSize}MB limit`);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (onFileChange) {
      onFileChange(null);
    }
  };

  return (
    <div className="flex flex-col">
      <span className="block text-sm text-[#707070] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div
        className="mt-1 flex flex-col items-center justify-center w-full h-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 bg-white"
        onClick={handleClick}
      >
        {!selectedFile ? (
          <>
            <div className="text-blue-500 mb-2">
              <FileUploadIcon className="h-6 w-6 mx-auto" />
            </div>
            <span className="text-sm text-gray-900 whitespace-nowrap">{placeholder}</span>
            <p className="text-xs text-gray-500">Max size: {maxSize}MB</p>
          </>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-900">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(0)} KB</p>
            <button onClick={handleRemoveFile} className="mt-2 text-xs text-red-500">
              Remove
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
        />
      </div>
      {errorText && <span className="text-xs text-red-500 mt-1 block">{errorText}</span>}
    </div>
  );
}
