import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { showTestResult } from './TestConnectionResult';

const pickButtonProps = ({ data, apis, onSuccess, options, getFormInner, fetchOptions, ...props }) => props;

export const TestConnectionButton = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, ...props }) => {
    const [LoadingButton, usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { modal } = App.useApp();
    const { formatMessage } = useIntl();
    return (
      <LoadingButton
        {...pickButtonProps(props)}
        onClick={async () => {
          const { data: resData } = await ajax(Object.assign({}, apis.mailGateway.account.testConnection, { data: { id: props.data.id } }));
          if (resData.code !== 0) {
            return;
          }
          showTestResult({ modal, formatMessage, result: resData.data });
        }}
      />
    );
  })
);

export const SyncButton = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, ...props }) => {
    const [LoadingButton, usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    return (
      <LoadingButton
        {...pickButtonProps(props)}
        onClick={async () => {
          const { data: resData } = await ajax(Object.assign({}, apis.mailGateway.account.sync, { urlParams: { id: props.data.id } }));
          if (resData.code !== 0) {
            return;
          }
          const result = resData.data || {};
          message.success(
            result.skipped
              ? formatMessage({ id: 'SyncSkipped' })
              : formatMessage({ id: result.hasMore ? 'SyncDoneHasMore' : 'SyncDone' }, { count: result.count || 0 })
          );
          props.onSuccess && props.onSuccess();
        }}
      />
    );
  })
);
