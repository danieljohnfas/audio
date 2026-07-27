import { useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import classNames from 'classnames';

export default function Dropzone({ onDrop, isProcessing }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isProcessing) setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (isProcessing) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      onDrop(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file && !isProcessing) {
      onDrop(file);
    }
  };

  return (
    <div
      className={classNames('dropzone flex-col items-center justify-center', {
        'active': isDragActive,
      })}
      style={{ opacity: isProcessing ? 0.6 : 1, pointerEvents: isProcessing ? 'none' : 'auto' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="audio/*"
        style={{ display: 'none' }}
      />
      
      {isProcessing ? (
        <>
          <Loader2 size={48} className="mb-4 text-accent" style={{ animation: 'spin 2s linear infinite' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Processing audio file...</h3>
          <p className="text-secondary mt-2">Extracting artwork and generating spectrogram</p>
        </>
      ) : (
        <>
          <UploadCloud size={48} className={classNames('mb-4', isDragActive ? 'text-white' : 'text-accent')} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {isDragActive ? 'Drop the file here' : 'Click or drag an audio file here'}
          </h3>
          <p className={classNames('mt-2', isDragActive ? 'text-white' : 'text-secondary')}>
            Supports MP3, FLAC, M4A and more
          </p>
        </>
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .text-accent { color: var(--accent-color); }
      `}</style>
    </div>
  );
}
