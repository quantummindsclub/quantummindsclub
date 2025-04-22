import { useState, useEffect } from 'react';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Image, Upload, RefreshCw, ChevronLeft, InfoIcon } from 'lucide-react';
import GalleryGrid from '../components/gallery/GalleryGrid';
import GalleryUploadView from '../components/gallery/GalleryUploadView';
import { galleryApi } from '../lib/api';

const ManageGalleryPage = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [currentView, setCurrentView] = useState('grid'); 
  const { toast } = useToast();

  const loadImages = async (featuredOnly = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await galleryApi.fetchGalleryImages(featuredOnly);
      setImages(data);
    } catch (err) {
      setError(err.message || 'Failed to load gallery images');
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to load gallery images',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImages(showFeaturedOnly);
  }, [showFeaturedOnly]);

  const handleImageDeleted = (deletedId) => {
    setImages(images.filter(image => image.id !== deletedId));
  };

  const handleImageUpdated = (updatedId, updatedData) => {
    setImages(images.map(image => {
      if (image.id === updatedId) {
        return { ...image, featured: updatedData.featured };
      }
      return image;
    }));
  };

  const handleUploadSuccess = () => {
    setCurrentView('grid'); 
    loadImages(showFeaturedOnly);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setShowFeaturedOnly(value === 'featured');
  };

  return (
    <div className="space-y-6">
      {currentView === 'grid' ? (
        <>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gallery</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => loadImages(showFeaturedOnly)}
                variant="outline"
                size="sm"
                className="border-card-border"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setCurrentView('upload')}
                size="sm"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>

          <div className="relative w-full rounded-lg border p-4 bg-background text-foreground">
            <div className="flex items-start">
              <InfoIcon className="h-5 w-5 mr-3 mt-0.5 text-foreground shrink-0" />
              <div>
                <h5 className="mb-1 font-medium leading-none tracking-tight">Homepage Integration</h5>
                <div className="text-sm [&_p]:leading-relaxed">
                  Images marked as "Featured" will appear in the Visual Journey section on the homepage. 
                  Feature up to 6 images for best display results.
                </div>
              </div>
            </div>
          </div>

          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <TabsList className="border-b">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-10 text-destructive">
                  <p>{error}</p>
                  <Button
                    onClick={() => loadImages(false)}
                    variant="outline"
                    className="mt-4 border-card-border"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <GalleryGrid
                  images={images}
                  onImageDeleted={handleImageDeleted}
                  onImageUpdated={handleImageUpdated}
                />
              )}
            </TabsContent>
            
            <TabsContent value="featured" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-10 text-destructive">
                  <p>{error}</p>
                  <Button
                    onClick={() => loadImages(true)}
                    variant="outline"
                    className="mt-4 border-card-border"
                  >
                    Try Again
                  </Button>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-10">
                  <Image className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No featured images</h3>
                  <p className="text-muted-foreground mt-1">
                    You haven't featured any images yet. Feature images by clicking the star icon.
                  </p>
                </div>
              ) : (
                <GalleryGrid
                  images={images}
                  onImageDeleted={handleImageDeleted}
                  onImageUpdated={handleImageUpdated}
                />
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Upload an image</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('grid')}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Gallery
            </Button>
          </div>
          
          <GalleryUploadView onUploadSuccess={handleUploadSuccess} />
        </>
      )}
    </div>
  );
};

export default ManageGalleryPage;