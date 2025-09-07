import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import FileUploadZone from '@/components/FileUploadZone';
import { apiService, Property } from '@/services/api';
import { mediaUrl } from '@/lib/env';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

const PropertyMediaManager: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const p = await apiService.getProperty(id);
        setProperty(p);
        setImages(Array.isArray(p.images) ? p.images : []);
        setVideos(Array.isArray(p.videos) ? p.videos : []);
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to load property', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const existingImageFiles = useMemo(() => images.map((url) => ({
    url: mediaUrl(url),
    filename: url.split('/').pop() || 'image',
    type: 'image'
  })), [images]);

  const existingVideoFiles = useMemo(() => videos.map((url) => ({
    url: mediaUrl(url),
    filename: url.split('/').pop() || 'video',
    type: 'video'
  })), [videos]);

  const handleDirectUpload = async (files: File[], type: 'images' | 'videos') => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const res = await apiService.uploadFiles(files, (p) => setUploadProgress(p));
      const urls = res.files.map(f => f.url);
      if (type === 'images') {
        setImages((prev) => [...prev, ...urls]);
      } else {
        setVideos((prev) => [...prev, ...urls]);
      }
      toast({ title: 'Upload successful', description: `${files.length} file(s) uploaded.` });
    } catch (e) {
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 800);
    }
  };

  const removeMedia = (index: number, type: 'images' | 'videos') => {
    if (type === 'images') {
      setImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setVideos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!property || !id) return;
    try {
      setIsSaving(true);
      await apiService.updateProperty(id, {
        ...property,
        images,
        videos,
        // keep numeric fields as numbers
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: property.size,
        parking: property.parking,
        floor: property.floor,
        yearBuilt: property.yearBuilt ?? null,
      });
      toast({ title: 'Saved', description: 'Media updated for property.' });
      navigate('/dashboard');
    } catch (e) {
      toast({ title: 'Save failed', description: 'Unable to save media changes.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Loading property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Property not found.</p>
        <Link to="/dashboard" className="text-primary hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Media</h1>
          <p className="text-sm text-muted-foreground">{property.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:underline">Back</Link>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUploadZone
              accept="image/png,image/jpeg,image/webp"
              multiple
              maxSize={10}
              onDirectUpload={(files) => handleDirectUpload(files, 'images')}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              existingFiles={existingImageFiles}
              onRemoveFile={(index) => removeMedia(index, 'images')}
              title="Upload Images"
              description="PNG, JPG, WEBP up to 10MB"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Videos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUploadZone
              accept="video/mp4,video/quicktime,video/x-msvideo"
              multiple
              maxSize={50}
              onDirectUpload={(files) => handleDirectUpload(files, 'videos')}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              existingFiles={existingVideoFiles}
              onRemoveFile={(index) => removeMedia(index, 'videos')}
              title="Upload Videos"
              description="MP4, MOV, AVI up to 50MB"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyMediaManager;
