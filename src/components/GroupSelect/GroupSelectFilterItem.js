import { createWithRemoteLoader } from '@kne/remote-loader';
import { createGroupSelectInterceptor } from './groupFilterInterceptors';

const DEFAULT_OVERLAY_WIDTH = '800px';

const createGroupSelectFilterItem = Field =>
  createWithRemoteLoader({
    modules: ['components-core:Filter@withFieldItem']
  })(({ remoteModules, single, interceptor, valueKey = 'code', labelKey = 'name', overlayWidth = DEFAULT_OVERLAY_WIDTH, ...props }) => {
    const [withFieldItem] = remoteModules;
    const Item = withFieldItem(Field, { forcePopup: true });
    return (
      <Item
        {...props}
        single={single}
        valueKey={valueKey}
        labelKey={labelKey}
        overlayWidth={overlayWidth}
        interceptor={interceptor || createGroupSelectInterceptor({ single, valueKey, labelKey })}
      />
    );
  });

export default createGroupSelectFilterItem;
