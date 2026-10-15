import { createContext, useContext } from 'react';
import { TablePageRender } from '@components/BizUnit';
import Menu from './Menu';

const PageRenderContext = createContext(null);

export const PageRenderProvider = PageRenderContext.Provider;

export const usePageRender = () => useContext(PageRenderContext);

/**
 * BizUnit 列表页外层：默认是 components-core Layout 页面并带模块菜单；
 * 宿主传了 renderPage（如 @kne/system-layout 的 Page）时，标题与导航由宿主承载，表格不再套 Layout 页面
 */
export const useBizUnitPage = ({ title, baseUrl, pageProps }) => {
  const renderPage = usePageRender();
  if (!renderPage) {
    return { page: Object.assign({ title, menu: <Menu baseUrl={baseUrl} /> }, pageProps) };
  }
  return {
    children: renderProps => renderPage({ title, children: <TablePageRender {...renderProps} withPage={false} /> })
  };
};
