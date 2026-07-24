import { createWithRemoteLoader } from '@kne/remote-loader';
import GroupFolderField from './GroupFolderField';
import { createGroupSelectInterceptor } from './groupFilterInterceptors';

const DEFAULT_OVERLAY_WIDTH = '280px';

const GroupFolderFilterItem = createWithRemoteLoader({
  modules: ['components-core:Filter@withFieldItem']
})(({ remoteModules, single = true, interceptor, valueKey = 'code', labelKey = 'name', overlayWidth = DEFAULT_OVERLAY_WIDTH, showColor = true, ...props }) => {
  const [withFieldItem] = remoteModules;
  const Item = withFieldItem(GroupFolderField.Field, { forcePopup: true });
  return (
    <Item
      {...props}
      single={single}
      valueKey={valueKey}
      labelKey={labelKey}
      overlayWidth={overlayWidth}
      showColor={showColor}
      interceptor={interceptor || createGroupSelectInterceptor({ single, valueKey, labelKey })}
    />
  );
});

export default GroupFolderFilterItem;
