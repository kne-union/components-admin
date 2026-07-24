import { createWithRemoteLoader } from '@kne/remote-loader';
import merge from 'lodash/merge';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import { openProgressModal } from '../../runWithProgress';

const TRANSLATE_BATCH_SIZE = 50;
const MAX_BATCH_ROUNDS = 500;

const TranslateRemaining = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data, namespace, onSuccess, apis, options, ...props }) => {
    const [ConfirmButton, usePreset] = remoteModules;
    const { ajax } = usePreset();
    const { message, modal } = App.useApp();
    const { formatMessage } = useIntl();
    const remainCount = Math.max(0, (data?.defaultEntryCount || 0) - (data?.entryCount || 0));

    return (
      <ConfirmButton
        {...props}
        type="link"
        message={formatMessage(
          { id: 'ConfirmTranslateRemaining' },
          { name: data?.name || data?.code, count: remainCount }
        )}
        onClick={async () => {
          const progress = openProgressModal(modal, {
            title: formatMessage({ id: 'TranslateRemainingProgressTitle' }),
            content: formatMessage({ id: 'TranslateRemainingProgress' }, { current: 0, total: remainCount })
          });
          let createdTotal = 0;
          let doneCount = 0;
          try {
            for (let round = 0; round < MAX_BATCH_ROUNDS; round += 1) {
              const { data: resData } = await ajax(
                typeof apis.translateRemaining === 'function'
                  ? apis.translateRemaining({
                      data,
                      options,
                      namespace,
                      limit: TRANSLATE_BATCH_SIZE
                    })
                  : merge({}, apis.translateRemaining, {
                      data: Object.assign(
                        { id: data.id, limit: TRANSLATE_BATCH_SIZE },
                        namespace ? { namespace } : {}
                      )
                    })
              );
              if (resData.code !== 0) {
                return;
              }
              const batchCreated = resData?.data?.createdCount || 0;
              const remaining = resData?.data?.remainingCount ?? 0;
              createdTotal += batchCreated;
              doneCount += batchCreated;
              const total = Math.max(remainCount, doneCount + remaining, 1);
              progress.update({
                percent: (doneCount / total) * 100,
                content: formatMessage(
                  { id: 'TranslateRemainingProgress' },
                  { current: doneCount, total }
                )
              });
              if (remaining <= 0 || batchCreated === 0) {
                break;
              }
            }
            message.success(
              formatMessage({ id: 'TranslateRemainingSuccess' }, { count: createdTotal })
            );
            onSuccess && onSuccess();
          } finally {
            progress.close();
          }
        }}
      >
        {formatMessage({ id: 'TranslateRemaining' })}
      </ConfirmButton>
    );
  })
);

export default TranslateRemaining;
