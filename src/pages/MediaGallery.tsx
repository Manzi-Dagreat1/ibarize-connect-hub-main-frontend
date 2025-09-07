import React, { useState, useEffect } from 'react';
import UploadForm from '../components/UploadForm';

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL;
const MediaGallery: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFiles = async (pageNum = 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/files?page=${pageNum}&limit=12`);
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      setFiles(data.files);
      setTotalPages(data.pagination.totalPages);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUploadSuccess = (uploadedFiles: MediaFile[]) => {
    setFiles(prev => [...uploadedFiles, ...prev]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Media Gallery</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Files</h2>
        <UploadForm onUploadSuccess={handleUploadSuccess} />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Gallery</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {files.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {files.map((file) => (
                <div key={file.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {file.mimetype.startsWith('image/') ? (
                      <img
                        src={`${API_BASE_URL+file.url}`}
                        alt={file.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : file.mimetype.startsWith('video/') ? (
                      <video
                        src={`${API_BASE_URL+file.url}`}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <div className="text-gray-500 text-center">
                        <p>Unsupported file type</p>
                        <p className="text-sm">{file.mimetype}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-sm truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => fetchFiles(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-blue-600 text-white rounded">
                    {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchFiles(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MediaGallery;
