import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { Button, Flex, Result, Spin } from 'antd';
import { useIntl } from '@kne/react-intl';
import { filterOpenApiDocByScopes } from './openApiScopes';
import withLocale from './withLocale';
import style from './style.module.scss';

const parseSwaggerPayload = data => (data?.paths ? data : data?.data?.paths ? data.data : data);

/** 弹窗内：拉取 /open-api.json，用 PostCat OpenApiView 展示（按密钥 scopes 裁剪） */
const ScopesOpenApiView = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-thirdparty:PostCat@OpenApiView']
})(
  withLocale(({ remoteModules, scopes }) => {
    const [usePreset, OpenApiView] = remoteModules;
    const { ajax, apis } = usePreset();
    const { formatMessage } = useIntl();
    const list = Array.isArray(scopes) ? scopes : [];

    return (
      <Fetch
        loader={async () => {
          const { data } = await ajax(Object.assign({}, apis.signature.openApiDoc));
          return parseSwaggerPayload(data);
        }}
        loading={<Spin className={style['scopes-view-loading']} />}
        error={<Result status="error" title={formatMessage({ id: 'ScopesDocLoadFailed' })} />}
        render={({ data: doc }) => {
          if (!doc?.paths) {
            return <Result status="warning" title={formatMessage({ id: 'ScopesDocLoadFailed' })} />;
          }
          const filtered = filterOpenApiDocByScopes(doc, list);
          if (!Object.keys(filtered.paths || {}).length) {
            return <Result status="info" title={formatMessage({ id: 'ScopesEmptyDoc' })} />;
          }
          return (
            <OpenApiView
              className={style['scopes-openapi']}
              data={filtered}
              tryIt={false}
              apiActionsOpen={false}
              caseActionsOpen={false}
              height={520}
              bordered={false}
            />
          );
        }}
      />
    );
  })
);

const ViewScopes = createWithRemoteLoader({
  modules: ['components-core:Modal@useModal']
})(
  withLocale(({ remoteModules, scopes }) => {
    const [useModal] = remoteModules;
    const modal = useModal();
    const { formatMessage } = useIntl();
    const list = Array.isArray(scopes) ? scopes : [];
    const isAll = list.length === 0;
    const summary = isAll ? formatMessage({ id: 'ScopesAll' }) : formatMessage({ id: 'ScopesCount' }, { count: list.length });

    return (
      <Flex align="center" gap={4} wrap="wrap">
        <span>{summary}</span>
        <Button
          type="link"
          size="small"
          style={{ padding: 0, height: 'auto' }}
          onClick={() => {
            modal({
              title: isAll ? formatMessage({ id: 'ViewScopesAll' }) : formatMessage({ id: 'ViewScopes' }),
              size: 'large',
              footer: null,
              children: <ScopesOpenApiView scopes={list} />
            });
          }}
        >
          {formatMessage({ id: 'View' })}
        </Button>
      </Flex>
    );
  })
);

export default ViewScopes;
