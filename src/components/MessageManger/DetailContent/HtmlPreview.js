import { useRef, useState, useEffect, useCallback } from 'react';

const HtmlPreview = ({ html }) => {
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState(300);

  const handleLoad = useCallback(() => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc?.body) {
        const height = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight, 200);
        setIframeHeight(height);
      }
    } catch (e) {
      // cross-origin fallback
    }
  }, []);

  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(`<style>html,body{margin:0;padding:12px;overflow:hidden;}</style>${html}`);
      doc.close();
      handleLoad();
    }
  }, [html, handleLoad]);

  return (
    <iframe
      ref={iframeRef}
      onLoad={handleLoad}
      style={{ width: '100%', height: iframeHeight, border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff' }}
      title="HTML Preview"
      sandbox="allow-same-origin"
    />
  );
};

export default HtmlPreview;
