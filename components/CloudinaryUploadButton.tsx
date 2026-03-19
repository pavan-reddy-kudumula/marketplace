'use client';

import { ReactNode } from 'react';
import { CldUploadWidget } from 'next-cloudinary';

interface CloudinaryUploadButtonProps {
  onUpload: (url: string) => void;
  multiple?: boolean;
  disabled?: boolean;
  className: string;
  children: ReactNode;
}

export default function CloudinaryUploadButton({
  onUpload,
  multiple = false,
  disabled = false,
  className,
  children,
}: CloudinaryUploadButtonProps) {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{ multiple }}
      onSuccess={(result) => {
        const info = result.info;
        if (info && typeof info === 'object' && 'secure_url' in info) {
          onUpload((info as { secure_url: string }).secure_url);
        }
      }}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => open()}
          disabled={disabled}
          className={className}
        >
          {children}
        </button>
      )}
    </CldUploadWidget>
  );
}