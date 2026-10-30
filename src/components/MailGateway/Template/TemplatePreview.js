import { createWithRemoteLoader } from '@kne/remote-loader';
import { useFetch } from '@kne/react-fetch';
import { Empty, Flex, Skeleton, Typography } from 'antd';
import { useIntl } from '@kne/react-intl';
import { useIsMobile } from '@kne/responsive-utils';
import get from 'lodash/get';
import { MessageView } from '@components/MessageManger/DetailContent';
import sampleStyle from '@components/MessageManger/style.module.scss';
import withLocale from '../withLocale';
import { TEMPLATE_VARIABLES } from '../MailEditor';

export const SAMPLE_CONTEXT = {
  mail: {
    subject: '关于 Q4 采购合作的咨询',
    from: [{ name: '张伟', address: 'zhangwei@example.com' }],
    to: [{ name: '客服中心', address: 'service@leapin-ai.com' }],
    date: '2026-10-15T09:30:00+08:00'
  },
  account: { name: '客服中心', address: 'service@leapin-ai.com' }
};

// Liquid 的 .first 在 lodash get 里对应 [0]
const getSampleValue = name => get(SAMPLE_CONTEXT, name.replace(/\.first(?=\.|$)/g, '[0]'));

const SampleData = ({ formatMessage }) => (
  <div className={sampleStyle['sample-panel']}>
    <Typography.Text strong>{formatMessage({ id: 'SampleData' })}</Typography.Text>
    <div style={{ marginTop: 4 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {formatMessage({ id: 'PreviewSampleTips' })}
      </Typography.Text>
    </div>
    {TEMPLATE_VARIABLES.map(item => (
      <div key={item.name} className={sampleStyle['sample-item']}>
        <Flex justify="space-between" gap={8}>
          <span className={sampleStyle['meta-label']}>{formatMessage({ id: item.id })}</span>
          <Typography.Text type="secondary" style={{ fontSize: 12 }} ellipsis copyable={{ text: `{{ ${item.name} }}` }}>
            {`{{ ${item.name} }}`}
          </Typography.Text>
        </Flex>
        <div className={sampleStyle['sample-value']}>{String(getSampleValue(item.name) ?? '-')}</div>
      </div>
    ))}
  </div>
);

/**
 * 用服务端 render 接口按示例上下文渲染模版，与实际发送一致；使用 Modal 的 ColumnsLayout 分栏，需放在 bodyScroll={false} 的 Modal 内
 */
const TemplatePreview = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Modal@ColumnsLayout', 'components-core:Modal@ScrollRegion']
})(
  withLocale(({ remoteModules, template }) => {
    const [usePreset, ColumnsLayout, ScrollRegion] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const isMobile = useIsMobile();
    const { data, isComplete } = useFetch(
      Object.assign({}, apis.mailGateway.template.render, {
        data: { template: { subject: template?.subject || '', html: template?.html || '' }, data: SAMPLE_CONTEXT }
      })
    );

    const message = !isComplete ? (
      <Skeleton active />
    ) : data ? (
      <MessageView type={0} subject={data.subject || formatMessage({ id: 'NoSubject' })} html={data.html || ''} />
    ) : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
    const sample = <SampleData formatMessage={formatMessage} />;

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
