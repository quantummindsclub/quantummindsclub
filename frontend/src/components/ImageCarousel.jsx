import { useState, useEffect, useRef } from 'react';

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slides, setSlides] = useState([]);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);
  const transitionRef = useRef(true);

  useEffect(() => {
    if (images.length > 0) {
      const lastSlide = images[images.length - 1];
      const firstSlide = images[0];
      const withClones = [lastSlide, ...images, firstSlide];
      setSlides(withClones);
      
      setCurrentIndex(1);
    }
  }, [images]);

  useEffect(() => {
    if (slides.length <= 1) return;
    
    const startAutoScroll = () => {
      intervalRef.current = setInterval(() => {
        goToNextSlide();
      }, 3000);
    };

    startAutoScroll();

    const carousel = carouselRef.current;
    const pauseAutoScroll = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const resumeAutoScroll = () => {
      pauseAutoScroll();
      startAutoScroll();
    };

    carousel?.addEventListener('mouseenter', pauseAutoScroll);
    carousel?.addEventListener('mouseleave', resumeAutoScroll);
    carousel?.addEventListener('touchstart', pauseAutoScroll);
    carousel?.addEventListener('touchend', resumeAutoScroll);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      carousel?.removeEventListener('mouseenter', pauseAutoScroll);
      carousel?.removeEventListener('mouseleave', resumeAutoScroll);
      carousel?.removeEventListener('touchstart', pauseAutoScroll);
      carousel?.removeEventListener('touchend', resumeAutoScroll);
    };
  }, [slides.length]);

  useEffect(() => {
    const handleTransitionEnd = () => {
      if (!transitionRef.current) return;
      
      if (currentIndex === 0) {
        transitionRef.current = false;
        setCurrentIndex(slides.length - 2);
      } else if (currentIndex === slides.length - 1) {
        transitionRef.current = false;
        setCurrentIndex(1);
      }
      
      setIsTransitioning(false);
    };

    const carousel = carouselRef.current?.querySelector('.carousel-track');
    carousel?.addEventListener('transitionend', handleTransitionEnd);

    return () => {
      carousel?.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [currentIndex, slides.length]);

  useEffect(() => {
    if (!transitionRef.current) {
      const timeoutId = setTimeout(() => {
        transitionRef.current = true;
      }, 10);
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex]);

  const goToNextSlide = () => {
    if (isTransitioning || slides.length <= 1) return;
    
    setIsTransitioning(true);
    transitionRef.current = true;
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  const goToPrevSlide = () => {
    if (isTransitioning || slides.length <= 1) return;
    
    setIsTransitioning(true);
    transitionRef.current = true;
    setCurrentIndex(prevIndex => prevIndex - 1);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index + 1 === currentIndex || slides.length <= 1) return;
    
    setIsTransitioning(true);
    transitionRef.current = true;
    setCurrentIndex(index + 1);
  };

  return (
    <div className="relative w-full" ref={carouselRef}>
      <div className="carousel-container overflow-hidden">
        <div 
          className={`carousel-track flex ${transitionRef.current ? 'transition-transform duration-500 ease-out' : ''}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="carousel-slide w-full flex-shrink-0">
              <div className="relative aspect-square">
                <img 
                  src={slide.src} 
                  alt={slide.alt} 
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <button 
          onClick={goToPrevSlide} 
          className="carousel-button z-10 bg-black/30 p-2 rounded-none text-white"
          disabled={isTransitioning}
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button 
          onClick={goToNextSlide} 
          className="carousel-button z-10 bg-black/30 p-2 rounded-none text-white"
          disabled={isTransitioning}
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      
      <div className="flex justify-center mt-4 gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 transition-colors ${
              (currentIndex === index + 1 || 
               (currentIndex === slides.length - 1 && index === 0) || 
               (currentIndex === 0 && index === images.length - 1)) 
                ? "bg-primary" 
                : "bg-muted-foreground/30"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            disabled={isTransitioning}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
