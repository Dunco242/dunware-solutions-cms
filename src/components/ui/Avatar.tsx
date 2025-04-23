import React from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-700 font-medium`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling!.style.display = 'flex';
          }}
        />
      ) : null}
      <div 
        className={`absolute inset-0 flex items-center justify-center ${src ? 'hidden' : ''}`}
      >
        {getInitials(alt)}
      </div>
    </div>
  );
};

export default Avatar;