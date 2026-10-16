import { useRef, useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@kne/responsive-utils';

const getBaseStyle = padding =>
  `<style>html{overflow-x:auto;overflow-y:hidden;}html,body{margin:0;}body{padding:${padding}px;word-break:break-word;overflow-wrap:anywhere;}img,video{max-width:100%;height:auto;}pre{white-space:pre-wrap;}</style>`;

const HtmlPreview = ({ html }) => {
  const iframeRef = useRef(null);
  const isMobile = useIsMobile();
  const [iframeHeight, setIframeHeight] = useState(300);

  const updateHeight = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.body) {
      return;
    }
    const scrollbarHeight = (doc.defaultView?.innerHeight || 0) - doc.documentElement.clientHeight;
    setIframeHeight(Math.max(Math.ceil(doc.body.getBoundingClientRect().height + Math.max(scrollbarHeight, 0)), 60));
  }, []);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !html) {
      return;
    }
    doc.open();
    doc.write(`<!DOCTYPE html>${getBaseStyle(isMobile ? 8 : 12)}${html}`);
    doc.close();
    updateHeight();
    const Observer = doc.defaultView?.ResizeObserver;
    if (!Observer || !doc.body) {
      return;
    }
    const observer = new Observer(updateHeight);
    observer.observe(doc.body);
    return () => observer.disconnect();
  }, [html, isMobile, updateHeight]);

  return (
    <iframe
      ref={iframeRef}
      onLoad={updateHeight}
      style={{ display: 'block', width: '100%', height: iframeHeight, border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff' }}
      title="HTML Preview"
      sandbox="allow-same-origin"
    />
  );
};

export default HtmlPreview;
