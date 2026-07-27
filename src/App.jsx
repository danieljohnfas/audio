import { useState, useEffect } from 'react';
import { Sun, Moon, Music } from 'lucide-react';
import Dropzone from './components/Dropzone';
import ExtractionResult from './components/ExtractionResult';
import { extractCoverArt } from './utils/audioParser';
import { generateSpectrogram } from './utils/spectrogram';

function App() {
  const [theme, setTheme] = useState('light');
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);
  const [spectrogramUrl, setSpectrogramUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleFileDrop = async (droppedFile) => {
    if (!droppedFile.type.startsWith('audio/')) {
      setError('Please drop a valid audio file (e.g. mp3, flac, m4a).');
      return;
    }
    
    setFile(droppedFile);
    setError(null);
    setIsProcessing(true);
    setCoverUrl(null);
    setSpectrogramUrl(null);
    setMetadata(null);

    try {
      // Extract cover art and metadata
      const { coverUrl, tags } = await extractCoverArt(droppedFile);
      setCoverUrl(coverUrl);
      setMetadata(tags);

      // Generate spectrogram
      const specUrl = await generateSpectrogram(droppedFile);
      setSpectrogramUrl(specUrl);

    } catch (err) {
      setError(err.message || 'An error occurred during extraction.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-container flex-col items-center">
      <header className="flex justify-between items-center w-full mb-8">
        <div className="flex items-center gap-4">
          <Music size={32} className="text-gradient" />
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: '800' }}>
            AudioRap
          </h1>
        </div>
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </header>

      <main className="w-full max-w-3xl flex-col gap-8">
        <div className="glass-card mb-8">
          <h2 className="mb-4 text-center">Extract Magic from Your Music</h2>
          <p className="text-secondary text-center mb-8">
            Instantly extract hidden cover art and visualize spectrograms from your audio files.
            Everything happens securely on your device.
          </p>
          
          <Dropzone onDrop={handleFileDrop} isProcessing={isProcessing} />
          
          {error && (
             <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}>
               {error}
             </div>
          )}
        </div>

        {(coverUrl || spectrogramUrl || isProcessing) && (
          <div className="glass-card">
            <ExtractionResult 
              coverUrl={coverUrl} 
              spectrogramUrl={spectrogramUrl} 
              metadata={metadata}
              isProcessing={isProcessing}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
