import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/use-toast';
import { Button } from '../../components/ui/button';
import { Trash2, Star, Copy, ExternalLink } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
} from '../../components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { apiDelete, apiPut } from '../../lib/api';

const GalleryGrid = ({ images, onImageDeleted, onImageUpdated }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeImageId, setActiveImageId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const { toast } = useToast();

  // Toggle active image id to show/hide buttons
  const toggleImageActive = (id, e) => {
    e.stopPropagation();
    
    if (activeImageId === id) {
      setActiveImageId(null);
    } else {
      setActiveImageId(id);
    }
  };

  // Close active image when clicking outside
  const handleDocumentClick = () => {
    if (activeImageId !== null) {
      setActiveImageId(null);
    }
  };

  // Add document-level click handler
  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [activeImageId]);

  // Handle button clicks without closing the active image
  const handleButtonClick = (e, callback) => {
    e.stopPropagation();
    callback();
  };

  // Show delete confirmation dialog
  const showDeleteDialog = (image, e) => {
    e.stopPropagation();
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  // Perform actual deletion
  const handleDelete = async () => {
    if (!imageToDelete) return;
    
    const id = imageToDelete.id;
    setDeletingId(id);
    
    try {
      const response = await apiDelete(`/api/gallery/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
      toast({
        title: "Image deleted",
        description: "The image has been removed from your gallery",
      });
      if (onImageDeleted) onImageDeleted(id);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: error.message || "Could not delete image. Try again later.",
      });
    } finally {
      setDeletingId(null);
      setImageToDelete(null);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        toast({
          title: "URL copied",
          description: "The image URL has been copied to your clipboard",
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Could not copy URL to clipboard",
        });
      });
  };

  const handleToggleFeatured = async (id, featured) => {
    setUpdatingId(id);
    try {
      const response = await apiPut(`/api/gallery/featured/${id}`, { featured: !featured });
      if (!response.ok) {
        throw new Error('Failed to update featured status');
      }
      const result = await response.json();
      toast({
        title: featured ? "Image unfeatured" : "Image featured",
        description: `The image has been ${featured ? 'unfeatured' : 'featured'} successfully`,
      });
      if (onImageUpdated) onImageUpdated(id, result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Could not update image. Try again later.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No images found in the gallery.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card 
            key={image.id} 
            className="overflow-hidden border-card-border h-full flex flex-col"
          >
            <div 
              className="relative rounded-md overflow-hidden bg-card aspect-square cursor-pointer"
              onClick={(e) => toggleImageActive(image.id, e)}
            >
              <img 
                src={image.url} 
                alt={image.title || 'Gallery image'} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
              
              {/* Overlay appears when image is active */}
              <div 
                className={`absolute inset-0 bg-black/40 transition-opacity duration-200
                  ${activeImageId === image.id ? 'opacity-100' : 'opacity-0'}`}
              />
              
              {/* Action buttons appear when image is active */}
              <div 
                className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-200 z-10
                  ${activeImageId === image.id ? 'opacity-100' : 'opacity-0'}`}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={(e) => handleButtonClick(e, () => handleCopyUrl(image.url))}
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full shadow-md"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy URL</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={(e) => handleButtonClick(e, () => window.open(image.url, '_blank'))}
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full shadow-md"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open Image</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={(e) => handleButtonClick(e, () => handleToggleFeatured(image.id, image.featured))}
                        size="icon"
                        variant={image.featured ? "default" : "secondary"}
                        className="h-8 w-8 rounded-full shadow-md"
                        disabled={updatingId === image.id}
                      >
                        <Star className={`h-4 w-4 ${image.featured ? 'fill-current' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{image.featured ? 'Unfeature Image' : 'Feature Image'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={(e) => showDeleteDialog(image, e)}
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 rounded-full shadow-md"
                        disabled={deletingId === image.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Image</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {/* <CardContent className="p-3 flex-grow">
              {image.title && (
                <h3 className="font-medium text-sm truncate">
                  {image.title}
                </h3>
              )}
              {image.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {image.description}
                </p>
              )}
            </CardContent> */}
            
            <CardFooter className="px-3 py-2 border-t border-card-border flex justify-between">
              <div className="text-xs text-muted-foreground">
                {new Date(image.created_at).toLocaleDateString()}
              </div>
              {image.featured && (
                <div className="flex items-center text-xs">
                  <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the image
              {imageToDelete?.title && <span> "{imageToDelete.title}"</span>} from your gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GalleryGrid;
