import React from 'react';

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="mt-3">
      {images.length === 1 ? (
        <div className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <img
            src={images[0]}
            alt="post"
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : images.length === 2 ? (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <img
                src={img}
                alt="post"
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      ) : images.length === 3 ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <img
              src={images[0]}
              alt="post"
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="grid grid-rows-2 gap-2">
            {images.slice(1).map((img, idx) => (
              <div
                key={idx}
                className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <img
                  src={img}
                  alt="post"
                  className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {images.slice(0, 4).map((img, idx) => (
            <div
              key={idx}
              className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <img
                src={img}
                alt="post"
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {idx === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-semibold">
                  +{images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
