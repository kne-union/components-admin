import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';
import { useFetch } from '@kne/react-fetch';
import { Empty, Flex, Skeleton, Typography } from 'antd';
import { useIntl } from '@kne/react-intl';
import { useIsMobile } from '@kne/responsive-utils';
import classnames from 'classnames';
import get from 'lodash/get';
import withLocale from './withLocale';
import { MessageView } from './DetailContent';
import { buildExampleProps, buildPreviewProps, getTemplateVariables } from './utils';
import style from './style.module.scss';

const SampleData = ({ variables, props, formatMessage }) => {
  const exampleProps = buildExampleProps(variables);
  return (
    <div className={style['sample-panel']}>
      <Typography.Text strong>{formatMessage({ id: 'SampleData' })}</Typography.Text>
      <div style={{ marginTop: 4 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {formatMessage({ id: 'PreviewSampleTips' })}
        </Typography.Text>
      </div>
      {variables.length > 0 ? (
        variables.map(item => {
          const hasExample = get(exampleProps, item.name) != null;
          const value = get(props, item.name);
          return (
            <div key={item.name} className={style['sample-item']}>
              <Flex justify="space-between" gap={8}>
                <span className={style['meta-label']}>{item.label || item.name}</span>
                <Typography.Text type="secondary" style={{ fontSize: 12 }} ellipsis>{`{{ ${item.name} }}`}</Typography.Text>
              </Flex>
              <div className={classnames(style['sample-value'], { [style['sample-value-empty']]: !hasExample })}>
                {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-')}
              </div>
            </div>
          );
        })
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'NoData' })} />
      )}
    </div>
  );
};

/**
 * 用服务端 render 接口渲染已保存模板（变量取示例值，无示例值显示 [变量说明]），与实际发送结果一致。
 * 使用 Modal 的 ColumnsLayout 分栏，需放在 bodyScroll={false} 的 Modal 内
 */
const TemplatePreview = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Modal@ColumnsLayout', 'components-core:Modal@ScrollRegion']
})(
  withLocale(({ remoteModules, template }) => {
    const [usePreset, ColumnsLayout, ScrollRegion] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const isMobile = useIsMobile();
    const variables = useMemo(() => getTemplateVariables(template), [template]);
    const previewProps = useMemo(() => buildPreviewProps(template), [template]);
    const { data, isComplete } = useFetch(
      Object.assign({}, apis.messageManger.templates.render, { data: { templateId: String(template.id), props: previewProps } })
    );

    const message = !isComplete ? (
      <Skeleton active />
    ) : data ? (
      <MessageView type={data.type} subject={data.subject} html={data.html} text={data.text} />
    ) : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'NoData' })} />
    );
    const sample = <SampleData variables={variables} props={data?.props || previewProps} formatMessage={formatMessage} />;

    if (isMobile) {
      return (
        <ScrollRegion inset>
          <Flex vertical gap={16}>
            {message}
            {sample}
          </Flex>
        </ScrollRegion>
      );
    }

    return (
      <ColumnsLayout widths={['1fr', '300px']}>
        <ScrollRegion inset>{message}</ScrollRegion>
        <ScrollRegion inset>{sample}</ScrollRegion>
      </ColumnsLayout>
    );
  })
);

export default TemplatePreview;
