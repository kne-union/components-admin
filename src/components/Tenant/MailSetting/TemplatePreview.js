import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo } from 'react';
import { useFetch } from '@kne/react-fetch';
import { Empty, Skeleton } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import { MessageView } from '@components/MessageManger/DetailContent';
import { buildPreviewProps } from '@components/MessageManger/utils';
import { createRequest } from './utils';

/** 用租户侧 template-preview 接口渲染当前生效模版，变量取示例值，无示例值显示 [变量说明] */
const TemplatePreview = createWithRemoteLoader({
  modules: ['components-core:Modal@ScrollRegion']
})(
  withLocale(({ remoteModules, apis, tenantId, code, template }) => {
    const [ScrollRegion] = remoteModules;
    const { formatMessage } = useIntl();
    const props = useMemo(() => buildPreviewProps(template), [template]);
    const { data, isComplete } = useFetch(createRequest(apis.templatePreview, tenantId, { code, props }));

    return (
      <ScrollRegion inset>
        {!isComplete ? (
          <Skeleton active />
        ) : data ? (
          <MessageView type={0} subject={data.subject} html={data.html} text={data.text} />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'NoData' })} />
        )}
      </ScrollRegion>
    );
  })
);

export default TemplatePreview;
