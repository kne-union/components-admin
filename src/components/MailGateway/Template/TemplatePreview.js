import { createWithRemoteLoader } from '@kne/remote-loader';
import { useFetch } from '@kne/react-fetch';
import { Flex, Skeleton, Tag, Typography } from 'antd';
import { useIntl } from '@kne/react-intl';
import HtmlPreview from '@components/MessageManger/DetailContent/HtmlPreview';
import withLocale from '../withLocale';
import { TEMPLATE_VARIABLES } from '../MailEditor';
import style from '../style.module.scss';

export const SAMPLE_CONTEXT = {
  mail: {
    subject: '关于 Q4 采购合作的咨询',
    from: [{ name: '张伟', address: 'zhangwei@example.com' }],
    to: [{ name: '客服中心', address: 'service@leapin-ai.com' }],
    date: '2026-10-15T09:30:00+08:00'
  },
  account: { name: '客服中心', address: 'service@leapin-ai.com' }
};

export const VariableTips = withLocale(() => {
  const { formatMessage } = useIntl();
  return (
    <Flex vertical gap={4} className={style['template-variables']}>
      <Typography.Text type="secondary">{formatMessage({ id: 'TemplateVariablesTips' })}</Typography.Text>
      <Flex wrap gap={8}>
        {TEMPLATE_VARIABLES.map(item => (
          <Typography.Text key={item.name} copyable={{ text: `{{${item.name}}}` }}>
            <Tag>{`{{${item.name}}}`}</Tag>
            {formatMessage({ id: item.id })}
          </Typography.Text>
        ))}
      </Flex>
    </Flex>
  );
});

const TemplatePreview = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, template }) => {
    const [usePreset] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const { data, isComplete } = useFetch(
      Object.assign({}, apis.mailGateway.template.render, {
        data: { template: { subject: template?.subject || '', html: template?.html || '' }, data: SAMPLE_CONTEXT }
      })
    );
    if (!isComplete) {
      return <Skeleton active />;
    }
    return (
      <Flex vertical gap={12}>
        <Typography.Text type="secondary">{formatMessage({ id: 'PreviewSampleTips' })}</Typography.Text>
        <div>
          <span className={style['meta-label']}>{formatMessage({ id: 'Subject' })}</span>
          <Typography.Text strong>{data?.subject || formatMessage({ id: 'NoSubject' })}</Typography.Text>
        </div>
        <HtmlPreview html={data?.html || ''} />
      </Flex>
    );
  })
);

export default TemplatePreview;
