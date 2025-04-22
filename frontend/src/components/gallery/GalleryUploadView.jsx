import { useState } from 'react';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Upload, Loader2, ImageIcon } from 'lucide-react';
import { galleryApi } from '../../lib/api';

const GalleryUploadView = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an image to upload",
      });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('featured', featured);
      await galleryApi.uploadToGallery(formData);
      toast({
        title: "Upload successful",
        description: "The image has been added to the gallery",
      });
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Could not upload file. Try again later.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const dragOverHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const dropHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setPreviewUrl(URL.createObjectURL(droppedFile));
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file",
        });
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] py-8">
      <Card className="w-full max-w-lg shadow-lg border-card-border">
        <CardHeader>
          <CardTitle>Upload Image to Gallery</CardTitle>
          <CardDescription>Fill out the details and upload an image to the gallery.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload Section */}
            <div>
              <Label className="mb-2 block font-medium">Image</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center w-full flex flex-col items-center justify-center bg-muted/40 transition-colors ${previewUrl ? 'border-primary/40 bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/40 hover:bg-primary/5'}`}
                onDragOver={dragOverHandler}
                onDrop={dropHandler}
                style={{ minHeight: 180 }}
              >
                {previewUrl ? (
                  <div className="w-full flex flex-col items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-[180px] max-w-full object-contain mb-4 rounded"
                    />
                    <p className="text-sm text-muted-foreground">{file?.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Drag & drop an image or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports JPG, PNG, GIF up to 5MB
                    </p>
                  </div>
                )}
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file').click()}
                  className="mt-4"
                  disabled={isUploading}
                  type="button"
                >
                  Choose File
                </Button>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-card-border mt-1"
                  placeholder="Image title (optional)"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-card-border resize-none mt-1"
                  rows={4}
                  placeholder="Image description (optional)"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
                <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
                  Feature this image
                </Label>
              </div>
            </div>

            {/* Upload Button Section */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isUploading || !file}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload to Gallery
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryUploadView;
