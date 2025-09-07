import React, { useState, useRef, useCallback } from 'react';

interface UploadFormProps {
  onUploadSuccess: (files: any[]) => void;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL;
const UploadForm: React.FC<UploadFormProps> = ({ onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleFiles = (files: FileList) => {
    const validFiles: File[] = [];
    const previews: string[] = [];
    let hasError = false;

    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        setError('Only images and videos are allowed.');
        hasError = true;
        return;
      }
      if (file.size > maxFileSize) {
        setError('File size must be less than 50MB.');
        hasError = true;
        return;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    });

    if (!hasError) {
      setError(null);
      setSelectedFiles(validFiles);
      setPreviewUrls(previews);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const onUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select files to upload.');
      return;
    }
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = await response.json();
      onUploadSuccess(data.files);
      setSelectedFiles([]);
      setPreviewUrls([]);
      setError(null);
    } catch (err) {
      setError('Upload failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div
        className="border-4 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-gray-500">Drag and drop images or videos here, or click to select files</p>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          ref={fileInputRef}
          onChange={onFileChange}
        />
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {previewUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {previewUrls.map((url, idx) => {
            const file = selectedFiles[idx];
            if (file.type.startsWith('image/')) {
              return <img key={idx} src={url} alt="preview" className="w-full h-32 object-cover rounded" />;
            } else if (file.type.startsWith('video/')) {
              return (
                <video key={idx} src={url} className="w-full h-32 rounded" controls />
              );
            }
            return null;
          })}
        </div>
      )}
      <button
        onClick={onUpload}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={selectedFiles.length === 0}
      >
        Upload
      </button>
    </div>
  );
};

export default UploadForm;
