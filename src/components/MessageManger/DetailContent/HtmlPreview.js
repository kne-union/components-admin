import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import createDOMPurify from 'dompurify';
import { useIsMobile } from '@kne/responsive-utils';
import getPreviewSize from './getPreviewSize';
import style from '../style.module.scss';

const getBaseStyle = padding =>
  `html{overflow-x:auto !important;overflow-y:hidden !important;}html,body{margin:0;}body{padding:${padding}px;word-break:break-word;overflow-wrap:anywhere;}img,video{max-width:100%;height:auto;}pre{white-space:pre-wrap;}`;

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
  const wrapRef = useRef(null);
  const iframeRef = useRef(null);
  // 内容自身需要的宽度（只在邮件内容/断点变化时测量一次），容器变宽变窄都据此判断是否要横向滚动
  const contentWidthRef = useRef(0);
  const isMobile = useIsMobile();
  const [size, setSize] = useState({ width: null, height: 300 });
  const safeHtml = useMemo(() => (html ? sanitizeHtml(html) : ''), [html]);

  const syncSize = useCallback(() => {
    const iframe = iframeRef.current;
    const wrap = wrapRef.current;
    const doc = iframe?.contentDocument;
    const containerWidth = wrap?.clientWidth || 0;
    if (!doc?.body || !containerWidth) {
      return;
    }
    // 图片等异步加载后正文可能变宽；只有确实溢出当前 iframe 时才记录，避免把 iframe 自身的宽度误当成内容宽度
    if (doc.body.scrollWidth > (iframe.clientWidth || 0) + 1) {
      contentWidthRef.current = Math.ceil(doc.body.scrollWidth);
    }
    const scrollbarHeight = Math.max((doc.defaultView?.innerHeight || 0) - doc.documentElement.clientHeight, 0);
    const next = getPreviewSize({
      containerWidth,
      contentWidth: contentWidthRef.current,
      bodyHeight: doc.body.getBoundingClientRect().height,
      scrollbarHeight
    });
    // 测量阶段把 iframe 临时收回到容器宽度，这里同步写回，避免两封宽度相同的邮件切换时 React 跳过渲染留下 100%
    iframe.style.width = `${next.width}px`;
    setSize(prev => (prev.width === next.width && prev.height === next.height ? prev : next));
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    const wrap = wrapRef.current;
    const doc = iframe?.contentDocument;
    if (!doc || !safeHtml) {
      return;
    }
    doc.open();
    doc.write(`<!DOCTYPE html>${safeHtml}`);
    doc.close();
    // 样式注入到 head 末尾：邮件正文自带的 <style> 常覆盖 html/body 的 overflow，导致宽元素被裁且没有横滚条
    const baseStyle = doc.createElement('style');
    baseStyle.textContent = getBaseStyle(isMobile ? 8 : 12);
    (doc.head || doc.documentElement).appendChild(baseStyle);
    // 先让 iframe 回到容器宽度，量出正文真实的自然宽度；撑开后 body.scrollWidth 会跟着 iframe 变，不能再当内容宽度用
    iframe.style.width = '100%';
    const containerWidth = wrap?.clientWidth || 0;
    const measured = Math.max(doc.body?.scrollWidth || 0, doc.documentElement?.scrollWidth || 0);
    contentWidthRef.current = measured > containerWidth + 1 ? Math.ceil(measured) : 0;
    syncSize();
    const Observer = window.ResizeObserver || doc.defaultView?.ResizeObserver;
    if (!Observer) {
      return;
    }
    const observer = new Observer(syncSize);
    observer.observe(wrap);
    if (doc.body) {
      observer.observe(doc.body);
    }
    return () => observer.disconnect();
  }, [safeHtml, isMobile, syncSize]);

  return (
    <div ref={wrapRef} className={style['html-preview']}>
      <iframe
        ref={iframeRef}
        onLoad={syncSize}
        style={Object.assign(
          {
            display: 'block',
            width: size.width === null ? '100%' : `${size.width}px`,
            height: size.height,
            boxSizing: 'border-box',
            border: 'none',
            background: '#fff'
          },
          bordered ? { border: '1px solid #d9d9d9', borderRadius: 6 } : {}
        )}
        title="HTML Preview"
        // 不给 allow-scripts / allow-forms / allow-top-navigation：正文脚本不执行、不能提交表单、不能把宿主页面导走；
        // allow-popups(-to-escape-sandbox) 只为让 target=_blank 的链接能在不受沙箱限制的新标签页打开
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
};

export default HtmlPreview;
