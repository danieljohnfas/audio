import React, { useEffect, useRef } from 'react';

export default function AdsterraAd({ adKey, format = 'iframe', height, width }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Clear any existing content to prevent duplicates during re-renders
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Creating an isolated iframe is the safest way to handle document.write in React
    const iframe = document.createElement('iframe');
    iframe.width = width;
    iframe.height = height;
    iframe.frameBorder = "0";
    iframe.scrolling = "no";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.style.margin = "0 auto";
    iframe.style.display = "block";
    
    containerRef.current.appendChild(iframe);

    // Inject the Adsterra configuration and script into the isolated iframe
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; overflow: hidden; background: transparent; }</style>
        </head>
        <body>
          <script>
            atOptions = {
              'key' : '${adKey}',
              'format' : '${format}',
              'height' : ${height},
              'width' : ${width},
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
        </body>
      </html>
    `);
    doc.close();

  }, [adKey, format, height, width]);

  return (
    <div 
      className="ad-container"
      ref={containerRef} 
      style={{ 
        width: '100%', 
        maxWidth: `${width}px`, 
        height: `${height}px`, 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'transparent',
        overflow: 'hidden'
      }} 
    />
  );
}
