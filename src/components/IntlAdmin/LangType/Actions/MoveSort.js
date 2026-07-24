import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import merge from 'lodash/merge';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';

const MoveSort = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data, direction, onSuccess, apis, options, children, ...props }) => {
    const [usePreset] = remoteModules;
    const { ajax } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    const isUp = direction === 'up';

    return (
      <Button
        {...props}
        type="link"
        onClick={async () => {
          if (!apis?.move) {
            return;
          }
          const { data: resData } = await ajax(
            typeof apis.move === 'function'
              ? apis.move({ data, direction, options })
              : merge({}, apis.move, {
                  data: { id: data.id, direction }
                })
          );
          if (resData.code !== 0) {
            return;
          }
          if (resData?.data?.moved === false) {
            message.warning(formatMessage({ id: isUp ? 'MoveUpEdge' : 'MoveDownEdge' }));
            return;
          }
          message.success(formatMessage({ id: isUp ? 'MoveUpSuccess' : 'MoveDownSuccess' }));
          onSuccess && onSuccess();
        }}
      >
        {children || formatMessage({ id: isUp ? 'MoveUp' : 'MoveDown' })}
      </Button>
    );
  })
);

export default MoveSort;
