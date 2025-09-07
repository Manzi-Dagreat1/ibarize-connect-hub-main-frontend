import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Video, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface FileUploadZoneProps {
  accept: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFilesChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDirectUpload?: (files: File[]) => void; // New prop for direct file handling
  uploadProgress?: number;
  isUploading?: boolean;
  existingFiles?: Array<{ url: string; filename: string; type?: string }>;
  onRemoveFile?: (index: number) => void;
  title: string;
  description: string;
  className?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  accept,
  multiple = true,
  maxSize = 50,
  onFilesChange,
  onDirectUpload,
  uploadProgress = 0,
  isUploading = false,
  existingFiles = [],
  onRemoveFile,
  title,
  description,
  className = ""
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];
    const maxSizeBytes = maxSize * 1024 * 1024;

    files.forEach(file => {
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name} is too large (max ${maxSize}MB)`);
      } else {
        valid.push(file);
      }
    });

    return { valid, errors };
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const { valid, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setError(null);
    
    // Use direct upload if available, otherwise create synthetic event
    if (onDirectUpload) {
      onDirectUpload(valid);
    } else if (onFilesChange) {
      // Create a synthetic event for the file input
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        valid.forEach(file => dt.items.add(file));
        fileInputRef.current.files = dt.files;
        
        const event = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', {
          writable: false,
          value: fileInputRef.current
        });
        
        onFilesChange(event as any);
      }
    }
  }, [maxSize, onFilesChange, onDirectUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      const { valid, errors } = validateFiles(fileArray);
      
      if (errors.length > 0) {
        setError(errors.join(', '));
        return;
      }
      
      setError(null);
      
      // Use direct upload if available, otherwise use onFilesChange
      if (onDirectUpload) {
        onDirectUpload(valid);
      } else if (onFilesChange) {
        onFilesChange(e);
      }
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="h-4 w-4" />;
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(ext || '')) {
      return <Video className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full ${dragActive ? 'bg-primary text-white' : 'bg-gray-100'}`}>
            <Upload className="h-8 w-8" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
            <p className="text-xs text-gray-500 mt-2">
              {multiple ? 'Select multiple files' : 'Select a file'} or drag and drop here
            </p>
            <p className="text-xs text-gray-400">Max file size: {maxSize}MB</p>
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm font-medium">Uploading...</p>
              {uploadProgress > 0 && <Progress value={uploadProgress} className="w-32" />}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Uploaded Files ({existingFiles.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {existingFiles.map((file, index) => {
              const isImage = file.type?.startsWith('image/') || file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              
              return (
                <div key={index} className="relative group">
                  {isImage ? (
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-100 rounded-md border flex items-center justify-center">
                      <Video className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  {onRemoveFile && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemoveFile(index)}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <p className="text-xs text-gray-600 mt-1 truncate" title={file.filename}>
                    {file.filename}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
