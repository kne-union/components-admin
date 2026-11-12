import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo, useState } from 'react';
import { createGroupSelectInterceptor } from './groupFilterInterceptors';

const DEFAULT_OVERLAY_WIDTH = '800px';

const createGroupSelectFilterItem = Field =>
  createWithRemoteLoader({
    modules: ['components-core:Filter@withFieldItem']
  })(({ remoteModules, single, interceptor, valueKey = 'code', labelKey = 'name', overlayWidth = DEFAULT_OVERLAY_WIDTH, ...props }) => {
    const [withFieldItem] = remoteModules;
    // withFieldItem 每次调用都会返回一个新的组件类型，必须固定引用，
    // 否则父级重渲染会卸载重建整棵子树（重复请求 + 下拉 open 状态丢失）
    const Item = useMemo(() => withFieldItem(Field, { forcePopup: true }), [withFieldItem]);
    const itemInterceptor = useMemo(
      () => interceptor || createGroupSelectInterceptor({ single, valueKey, labelKey }),
      [interceptor, single, valueKey, labelKey]
    );
    // 显式受控 open：GroupSelect.Field 据此判断是否需要加载分组树
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
        interceptor={itemInterceptor}
      />
    );
  });

export default createGroupSelectFilterItem;
