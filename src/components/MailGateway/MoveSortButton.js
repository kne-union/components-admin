import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';

const MoveSortButton = createWithRemoteLoader({
  modules: ['components-core:LoadingButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data, apis, onSuccess, options, getFormInner, fetchOptions, direction, listRef, sortApi, ...props }) => {
    const [LoadingButton, usePreset] = remoteModules;
    const { ajax } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    return (
      <LoadingButton
        {...props}
        onClick={async () => {
          const ids = listRef.current.map(item => item.id);
          const index = ids.findIndex(id => String(id) === String(data.id));
          const target = direction === 'up' ? index - 1 : index + 1;
          if (index < 0 || target < 0 || target >= ids.length) {
            return;
          }
          [ids[index], ids[target]] = [ids[target], ids[index]];
          const { data: resData } = await ajax(Object.assign({}, sortApi, { data: { ids } }));
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'OperationSuccess' }));
          onSuccess && onSuccess();
        }}
      />
    );
  })
);

export const getMoveSortActions = ({ props, listRef, sortApi, formatMessage }) => [
  { ...props, buttonComponent: MoveSortButton, direction: 'up', listRef, sortApi, children: formatMessage({ id: 'MoveUp' }) },
  { ...props, buttonComponent: MoveSortButton, direction: 'down', listRef, sortApi, children: formatMessage({ id: 'MoveDown' }) }
];

export default MoveSortButton;
