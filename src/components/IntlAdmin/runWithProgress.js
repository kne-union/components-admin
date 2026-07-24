import { Progress } from 'antd';
import React from 'react';

/**
 * 打开不可关闭的进度弹窗，返回 update / close。
 * @param {import('antd').ModalStaticFunctions} modal
 * @param {{ title: string, content?: string }} options
 */
export const openProgressModal = (modal, { title, content }) => {
  const instance = modal.info({
    title,
    content: (
      <div>
        {content ? <div style={{ marginBottom: 12 }}>{content}</div> : null}
        <Progress percent={0} status="active" />
      </div>
    ),
    icon: null,
    okButtonProps: { style: { display: 'none' } },
    closable: false,
    maskClosable: false,
    keyboard: false
  });

  return {
    update: ({ percent, content: nextContent, title: nextTitle } = {}) => {
      const safePercent = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
      instance.update({
        title: nextTitle != null ? nextTitle : title,
        content: (
          <div>
            {nextContent != null || content ? (
              <div style={{ marginBottom: 12 }}>{nextContent != null ? nextContent : content}</div>
            ) : null}
            <Progress percent={safePercent} status={safePercent >= 100 ? 'success' : 'active'} />
          </div>
        )
      });
    },
    close: () => {
      instance.destroy();
    }
  };
};
