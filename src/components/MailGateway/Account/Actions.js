import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { showTestResult } from './TestConnectionResult';

const pickButtonProps = ({ data, apis, onSuccess, options, getFormInner, fetchOptions, ...props }) => props;

export const TestConnectionButton = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Global@usePreset', 'components-core:Modal@useConfirmModal']
})(
  withLocale(({ remoteModules, ...props }) => {
    const [LoadingButton, usePreset, useConfirmModal] = remoteModules;
    const { ajax, apis } = usePreset();
    const confirmModal = useConfirmModal();
    const { formatMessage } = useIntl();
    return (
      <LoadingButton
        {...pickButtonProps(props)}
        onClick={async () => {
          const { data: resData } = await ajax(Object.assign({}, apis.mailGateway.account.testConnection, { data: { id: props.data.id } }));
          if (resData.code !== 0) {
            return;
          }
          showTestResult({ confirmModal, formatMessage, result: resData.data });
        }}
      />
    );
  })
);

export const SetDefaultButton = createWithRemoteLoader({
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
          const { data: resData } = await ajax(Object.assign({}, apis.mailGateway.account.setDefault, { urlParams: { id: props.data.id } }));
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'SetDefaultSuccess' }));
          props.onSuccess && props.onSuccess();
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

const SyncHistoryFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(
  withLocale(({ remoteModules }) => {
    const [FormInfo] = remoteModules;
    const { RadioGroup, InputNumber } = FormInfo.fields;
    const { formData } = FormInfo.useFormContext();
    const { formatMessage } = useIntl();
    return (
      <FormInfo
        column={1}
        list={[
          <RadioGroup
            name="mode"
            label={formatMessage({ id: 'SyncHistoryMode' })}
            rule="REQ"
            options={[
              { label: formatMessage({ id: 'SyncHistoryAll' }), value: 'all' },
              { label: formatMessage({ id: 'SyncHistoryLimit' }), value: 'limit' }
            ]}
          />,
          formData?.mode === 'limit' ? (
            <InputNumber name="limit" label={formatMessage({ id: 'SyncHistoryMaxCount' })} rule="REQ" min={1} max={100000} />
          ) : null
        ].filter(Boolean)}
      />
    );
  })
);

export const SyncHistoryButton = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, ...props }) => {
    const [FormInfo, usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const formModal = FormInfo.useFormModal();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    const history = props.data?.syncState?.history;
    const running = history?.status === 'running';
    return (
      <Button
        {...pickButtonProps(props)}
        disabled={running || props.disabled}
        onClick={() => {
          formModal({
            title: formatMessage({ id: 'SyncHistory' }),
            size: 'small',
            okText: formatMessage({ id: 'SyncHistoryStart' }),
            formProps: {
              data: { mode: 'all', limit: 200 },
              onSubmit: async formData => {
                const limit = formData.mode === 'all' ? 0 : Number(formData.limit) || 0;
                if (formData.mode === 'limit' && limit <= 0) {
                  message.warning(formatMessage({ id: 'SyncHistoryLimitRequired' }));
                  return false;
                }
                const { data: resData } = await ajax(
                  Object.assign({}, apis.mailGateway.account.syncHistory, {
                    urlParams: { id: props.data.id },
                    data: { limit }
                  })
                );
                if (resData.code !== 0) {
                  return false;
                }
                const result = resData.data || {};
                message.success(
                  result.skipped
                    ? formatMessage({ id: 'SyncHistorySkipped' })
                    : formatMessage(
                        { id: 'SyncHistoryStarted' },
                        {
                          mode: result.history?.limit
                            ? formatMessage({ id: 'SyncHistoryLimitCount' }, { count: result.history.limit })
                            : formatMessage({ id: 'SyncHistoryAll' })
                        }
                      )
                );
                props.onSuccess && props.onSuccess();
              }
            },
            children: <SyncHistoryFormInner />
          });
        }}
      >
        {running ? formatMessage({ id: 'SyncHistoryRunning' }, { fetched: history?.fetched || 0 }) : props.children}
      </Button>
    );
  })
);
