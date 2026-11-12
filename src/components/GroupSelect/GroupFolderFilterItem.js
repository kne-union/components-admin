import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo, useState } from 'react';
import GroupFolderField from './GroupFolderField';
import { createGroupSelectInterceptor } from './groupFilterInterceptors';

const DEFAULT_OVERLAY_WIDTH = '280px';

const GroupFolderFilterItem = createWithRemoteLoader({
  modules: ['components-core:Filter@withFieldItem']
})(({
  remoteModules,
  single = true,
  interceptor,
  valueKey = 'code',
  labelKey = 'name',
  overlayWidth = DEFAULT_OVERLAY_WIDTH,
  showColor = true,
  ...props
}) => {
  const [withFieldItem] = remoteModules;
  // withFieldItem 每次调用都会返回一个新的组件类型。若在 render 中直接调用，父级每次重渲染
  // 都会让 React 卸载重建整棵子树：分组树 Fetch 重新挂载发请求、FilterItem 内部的 open
  // 被重置（已展开的下拉会被莫名关掉）。这里必须固定组件引用。
  const Item = useMemo(() => withFieldItem(GroupFolderField.Field, { forcePopup: true }), [withFieldItem]);
  const itemInterceptor = useMemo(
    () => interceptor || createGroupSelectInterceptor({ single, valueKey, labelKey }),
    [interceptor, single, valueKey, labelKey]
  );
  // 显式受控 open：GroupFolderField.Field 据此判断是否需要加载分组树
  const [open, setOpen] = useState(false);

  return (
    <Item
      {...props}
      open={open}
      onOpenChange={setOpen}
      single={single}
      valueKey={valueKey}
      labelKey={labelKey}
      overlayWidth={overlayWidth}
      showColor={showColor}
      interceptor={itemInterceptor}
    />
  );
});

export default GroupFolderFilterItem;
