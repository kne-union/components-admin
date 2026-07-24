import { createWithRemoteLoader } from '@kne/remote-loader';
import { useCallback, useEffect, useMemo, useState } from 'react';
import merge from 'lodash/merge';
import BizUnit from '@components/BizUnit';
import getColumns from './getColumns';
import FormInner from './FormInner';
import SetDefault from './Actions/SetDefault';
import TranslateRemaining from './Actions/TranslateRemaining';
import MoveSort from './Actions/MoveSort';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';

const getNamespaceFromFilter = filterValue => {
  const entry = (Array.isArray(filterValue) ? filterValue : []).find(item => item?.name === 'namespace');
  return entry?.value?.value || '';
};

const LangType = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, menu, pageProps = {} }) => {
    const [usePreset] = remoteModules;
    const { apis, ajax } = usePreset();
    const { formatMessage } = useIntl();
    const [namespaceList, setNamespaceList] = useState([]);
    const [activeNamespace, setActiveNamespace] = useState('');
    const [filterValue, setFilterValue] = useState([]);

    const loadNamespaces = useCallback(async () => {
      if (!apis?.intlAdmin?.langLib?.namespaces) {
        return;
      }
      try {
        const { data: resData } = await ajax(merge({}, apis.intlAdmin.langLib.namespaces));
        if (resData?.code !== 0) {
          return;
        }
        const list = (resData?.data?.pageData || [])
          .map(item => item.namespace || item)
          .filter(Boolean);
        setNamespaceList(list);
      } catch (e) {
        // ignore
      }
    }, [ajax, apis?.intlAdmin?.langLib?.namespaces]);

    useEffect(() => {
      loadNamespaces();
    }, [loadNamespaces]);

    const langTypeApis = useMemo(() => apis.intlAdmin.langType, [apis.intlAdmin.langType]);

    return (
      <BizUnit
        isNext
        name="langType"
        apis={langTypeApis}
        getColumns={() => getColumns({ formatMessage })}
        getFormInner={props => <FormInner {...props} />}
        getActionList={({ data, apis: langApis, ...props }) => {
          const remainCount = Math.max(0, (data?.defaultEntryCount || 0) - (data?.entryCount || 0));
          // 内置顺序：save → setStatus×2 → remove；上移/下移插在删除前
          let beforeRemoveIndex = 0;
          if (langApis?.save) {
            beforeRemoveIndex += 1;
          }
          if (langApis?.setStatus) {
            beforeRemoveIndex += 2;
          }
          return [
            {
              ...props,
              apis: langApis,
              buttonComponent: SetDefault,
              data,
              children: formatMessage({ id: 'SetDefault' }),
              hidden: !!data?.isDefault || !langApis?.setDefault
            },
            {
              ...props,
              apis: langApis,
              buttonComponent: TranslateRemaining,
              data,
              namespace: activeNamespace || undefined,
              children: formatMessage({ id: 'TranslateRemaining' }),
              hidden: !!data?.isDefault || remainCount <= 0 || !langApis?.translateRemaining
            },
            {
              ...props,
              apis: langApis,
              buttonComponent: MoveSort,
              data,
              direction: 'up',
              index: beforeRemoveIndex,
              children: formatMessage({ id: 'MoveUp' }),
              hidden: !langApis?.move
            },
            {
              ...props,
              apis: langApis,
              buttonComponent: MoveSort,
              data,
              direction: 'down',
              index: beforeRemoveIndex,
              children: formatMessage({ id: 'MoveDown' }),
              hidden: !langApis?.move
            }
          ];
        }}
        onFilterChange={value => {
          setFilterValue(value || []);
          setActiveNamespace(getNamespaceFromFilter(value));
        }}
        filter={{
          list: [],
          value: filterValue
        }}
        page={{
          title: formatMessage({ id: 'LangType' }),
          menu,
          ...pageProps
        }}
        options={{
          bizName: formatMessage({ id: 'LangTypeBiz' }),
          keywordFilterName: 'keyword',
          tableProps: {
            pagination: {
              showSizeChanger: true,
              showQuickJumper: true,
              hideOnSinglePage: false
            },
            tab: {
              name: 'namespace',
              label: formatMessage({ id: 'Namespace' }),
              list: namespaceList.map(namespace => ({
                label: namespace,
                value: namespace
              }))
            }
          }
        }}
      />
    );
  })
);

export default LangType;
