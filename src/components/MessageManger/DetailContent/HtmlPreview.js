import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import createDOMPurify from 'dompurify';
import { useIsMobile } from '@kne/responsive-utils';

const getBaseStyle = padding =>
  `<style>html{overflow-x:auto;overflow-y:hidden;}html,body{margin:0;}body{padding:${padding}px;word-break:break-word;overflow-wrap:anywhere;}img,video{max-width:100%;height:auto;}pre{white-space:pre-wrap;}</style>`;

// 独立实例，hook 不影响宿主里其它 DOMPurify 使用方
const purify = createDOMPurify(window);

// 链接一律新标签页打开；页内锚点（#xxx）保留在预览内滚动
purify.addHook('afterSanitizeAttributes', node => {
  if (!['A', 'AREA'].includes(node.nodeName) || !node.hasAttribute('href')) {
    return;
  }
  if ((node.getAttribute('href') || '').trim().startsWith('#')) {
    node.removeAttribute('target');
    return;
  }
  node.setAttribute('target', '_blank');
  node.setAttribute('rel', 'noopener noreferrer');
});

const sanitizeHtml = html =>
  purify.sanitize(html, {
    WHOLE_DOCUMENT: true,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['form', 'input', 'button', 'textarea', 'select', 'option', 'base', 'meta', 'link', 'iframe', 'frame', 'frameset', 'object', 'embed']
  });

const HtmlPreview = ({ html, bordered = true }) => {
  const iframeRef = useRef(null);
  const isMobile = useIsMobile();
  const [iframeHeight, setIframeHeight] = useState(300);
  const safeHtml = useMemo(() => (html ? sanitizeHtml(html) : ''), [html]);

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
    if (!doc || !safeHtml) {
      return;
    }
    doc.open();
    doc.write(`<!DOCTYPE html>${getBaseStyle(isMobile ? 8 : 12)}${safeHtml}`);
    doc.close();
    updateHeight();
    const Observer = doc.defaultView?.ResizeObserver;
    if (!Observer || !doc.body) {
      return;
    }
    const observer = new Observer(updateHeight);
    observer.observe(doc.body);
    return () => observer.disconnect();
  }, [safeHtml, isMobile, updateHeight]);

  return (
    <iframe
      ref={iframeRef}
      onLoad={updateHeight}
      style={Object.assign(
        { display: 'block', width: '100%', height: iframeHeight, border: 'none', background: '#fff' },
        bordered ? { border: '1px solid #d9d9d9', borderRadius: 6 } : {}
      )}
      title="HTML Preview"
      // 不给 allow-scripts / allow-forms / allow-top-navigation：正文脚本不执行、不能提交表单、不能把宿主页面导走；
      // allow-popups(-to-escape-sandbox) 只为让 target=_blank 的链接能在不受沙箱限制的新标签页打开
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
    />
  );
};

export default HtmlPreview;
