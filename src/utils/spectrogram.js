export function generateSpectrogram(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
        const arrayBuffer = e.target.result;
        
        // Decode the audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Set up OfflineAudioContext to process the whole file as fast as possible
        const offlineCtx = new OfflineAudioContext(1, audioBuffer.length, audioBuffer.sampleRate);
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        
        const analyser = offlineCtx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0;
        
        // Create a ScriptProcessorNode to capture FFT data
        // We need a chunk size to process. Let's use 4096.
        const processor = offlineCtx.createScriptProcessor(4096, 1, 1);
        
        source.connect(analyser);
        analyser.connect(processor);
        processor.connect(offlineCtx.destination);
        
        const frequencies = new Uint8Array(analyser.frequencyBinCount);
        const spectrogramData = [];
        
        processor.onaudioprocess = () => {
          analyser.getByteFrequencyData(frequencies);
          // Store a copy of the frequencies array
          spectrogramData.push(new Uint8Array(frequencies));
        };
        
        source.start(0);
        await offlineCtx.startRendering();
        
        // Now draw to a canvas
        const width = spectrogramData.length;
        const height = analyser.frequencyBinCount;
        
        if (width === 0 || height === 0) {
          throw new Error('Could not generate spectrogram data.');
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        // Limit height to a reasonable number to avoid huge canvases
        const displayHeight = Math.min(height, 512); 
        canvas.height = displayHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Create ImageData to draw pixels efficiently
        const imgData = ctx.createImageData(width, displayHeight);
        
        for (let x = 0; x < width; x++) {
          const colData = spectrogramData[x];
          for (let y = 0; y < displayHeight; y++) {
            // Web Audio API frequencies go from low to high. Canvas y=0 is top.
            // So we invert the y axis to put low frequencies at the bottom.
            const freqVal = colData[y];
            const i = ((displayHeight - 1 - y) * width + x) * 4;
            
            // Map freqVal (0-255) to a color (e.g. heatmap)
            // Using a simple blue-purple-pink-white gradient
            const r = freqVal;
            const g = Math.max(0, freqVal - 100);
            const b = Math.min(255, freqVal + 50);
            
            imgData.data[i] = r;
            imgData.data[i + 1] = g;
            imgData.data[i + 2] = b;
            imgData.data[i + 3] = 255; // Alpha
          }
        }
        
        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
        
      } catch (err) {
        console.error('Error generating spectrogram:', err);
        reject(err);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
