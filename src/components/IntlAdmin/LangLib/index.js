import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { App } from 'antd';
import merge from 'lodash/merge';
import BizUnit from '@components/BizUnit';
import { GroupFolder } from '@components/GroupSelect';
import getColumns from './getColumns';
import getFilterList from './getFilterList';
import FormInner from './FormInner';
import Review from './Actions/Review';
import Regenerate from './Actions/Regenerate';
import CopyToNamespace from './Actions/CopyToNamespace';
import AddLocale, { buildCreatePayload } from './Actions/AddLocale';
import {
  buildReviewFormList,
  getDefaultReviewFormData,
  getLeafEntries,
  getPendingEntries,
  requestCopyToNamespace,
  requestRemove,
  requestReview,
  requestSetStatus
} from './Actions/reviewHelpers';
import ReviewEntriesPreview from './Actions/ReviewEntriesPreview';
import { enrichReviewEntries } from './Actions/enrichReviewEntries';
import { downloadI18nFiles, readImportFiles } from './i18nDownload';
import { openProgressModal } from '../runWithProgress';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import { INTL_NAMESPACE_TYPE } from '../constants';
import {
  resolveNamespaceCode,
  sortGroupListGlobalFirst,
  syncNamespacesToGroup,
  toNamespaceFieldValue
} from '../syncNamespacesToGroup';

const OPEN_STATUS = 'open';
const CLOSED_STATUS = 'closed';

const buildParentId = (namespace, code) => `g-${namespace}-${code}`;

/** 将后端扁平词条列表转为 treeList（按 namespace+code 分组） */
const transformFlatListToTree = (pageData = []) => {
  const leafRows = [];
  const parentMap = new Map();
  const sourceMap = new Map();

  pageData.forEach(item => {
    if (!item?.locale) {
      return;
    }
    const key = `${item.namespace}::${item.code}`;
    if (item.sourceTarget != null && String(item.sourceTarget).trim()) {
      sourceMap.set(key, String(item.sourceTarget));
    }
    if (item.defaultLocale && item.locale === item.defaultLocale && item.target != null && String(item.target).trim()) {
      sourceMap.set(key, String(item.target));
    }
  });

  pageData.forEach(item => {
    if (!item?.locale) {
      return;
    }
    const parentId = buildParentId(item.namespace, item.code);
    if (!parentMap.has(parentId)) {
      parentMap.set(parentId, {
        id: parentId,
        namespace: item.namespace,
        code: item.code,
        parentId: null,
        disabled: true
      });
    }
    const key = `${item.namespace}::${item.code}`;
    leafRows.push(
      Object.assign({}, item, {
        parentId,
        disabled: false,
        sourceTarget: item.sourceTarget || sourceMap.get(key) || ''
      })
    );
  });

  return Array.from(parentMap.values()).concat(leafRows);
};

const LangLib = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:Global@useGlobalValue',
    'components-core:Filter',
    'components-core:TablePage@Table',
    'components-core:FormInfo@useFormModal',
    'components-core:FormInfo',
    'components-admin:GroupSelect'
  ]
})(
  withLocale(({ remoteModules, menu, pageProps = {} }) => {
    const [usePreset, useGlobalValue, Filter, Table, useFormModal, FormInfo, GroupSelect] = remoteModules;
    const { SuperSelectFilterItem } = Filter.fields || Filter;
    const { apis, ajax } = usePreset();
    const locale = useGlobalValue('locale');
    const language = locale || 'zh-CN';
    const { formatMessage } = useIntl();
    const { message, modal } = App.useApp();
    const formModal = useFormModal();
    const dataRef = useRef([]);
    const { selectedRowKeys, selectedRows, setSelectedRowKeys, clearSelectedRows } = Table.useSelectedRow({ rowKey: 'id' });
    const [activeNamespace, setActiveNamespace] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [filterValue, setFilterValue] = useState([]);

    useEffect(() => {
      syncNamespacesToGroup({ ajax, apis, language });
    }, [ajax, apis, language]);

    const groupFolderApis = useMemo(
      () =>
        merge({}, apis?.group, {
          groupList: merge({}, apis?.group?.groupList, {
            transformData: sortGroupListGlobalFirst
          })
        }),
      [apis?.group]
    );

    const filter = useMemo(
      () =>
        Object.assign(
          getFilterList({
            formatMessage,
            SuperSelectFilterItem,
            langTypeListApi: apis.intlAdmin.langType.list
          }),
          // 用 defaultValue 而非 value：TablePage 受控 value 只回显 UI，
          // 请求重置时只认 defaultValue，否则会出现「筛选已选中但列表未带该条件」
          { defaultValue: filterValue }
        ),
      [formatMessage, SuperSelectFilterItem, apis.intlAdmin.langType.list, filterValue]
    );

    const reloadAfterChange = useCallback(
      reload => {
        clearSelectedRows();
        if (reload) {
          reload();
        } else {
          setRefreshKey(key => key + 1);
        }
      },
      [clearSelectedRows]
    );

    const langLibApis = useMemo(
      () =>
        merge({}, apis.intlAdmin.langLib, {
          list: merge({}, apis.intlAdmin.langLib.list, {
            transformData: data => {
              const pageData = transformFlatListToTree(data?.pageData || []);
              dataRef.current = pageData;
              return Object.assign({}, data, { pageData });
            }
          }),
          create: ({ formData }) =>
            merge({}, apis.intlAdmin.langLib.create, {
              data: buildCreatePayload(
                Object.assign({}, formData, {
                  namespace: resolveNamespaceCode(formData.namespace) || activeNamespace
                })
              )
            }),
          // GroupSelect 表单值为 {code,name}；object-output-value 取 value/id，不能用于 namespace
          save: ({ formData, data }) =>
            merge({}, apis.intlAdmin.langLib.save, {
              data: Object.assign({}, formData, {
                id: data.id,
                namespace: resolveNamespaceCode(formData.namespace) || formData.namespace
              })
            })
        }),
      [apis.intlAdmin.langLib, activeNamespace]
    );

    const rowSelection = useMemo(
      () => ({
        type: 'checkbox',
        selectedRowKeys,
        allowSelectedAll: true,
        checkRelation: 'independent',
        onChange: keys => {
          const selectableRows = (dataRef.current || []).filter(item => item.locale && !item.disabled);
          const selectableKeySet = new Set(selectableRows.map(item => item.id));
          const nextKeys = (keys || []).filter(key => selectableKeySet.has(key));
          const nextKeySet = new Set(nextKeys);
          const nextRows = selectableRows.filter(item => nextKeySet.has(item.id));
          setSelectedRowKeys(nextKeys, nextRows);
        }
      }),
      [selectedRowKeys, setSelectedRowKeys]
    );

    const openBatchReview = useCallback(
      async ({ selectedRows: rows, reload }) => {
        const pendingRows = getPendingEntries(rows);
        if (pendingRows.length === 0) {
          message.warning(formatMessage({ id: 'BatchReviewNoPending' }));
          return;
        }
        const entries = await enrichReviewEntries({
          ajax,
          listApi: apis?.intlAdmin?.langLib?.list,
          entries: pendingRows,
          allRows: dataRef.current
        });
        const ids = pendingRows.map(row => row.id);
        formModal({
          title: formatMessage({ id: 'BatchReview' }, { count: ids.length }),
          size: 'large',
          formProps: {
            data: getDefaultReviewFormData(),
            onSubmit: async formData => {
              const resData = await requestReview({ ajax, apis: langLibApis, ids, formData });
              if (resData.code !== 0) {
                return false;
              }
              message.success(formatMessage({ id: 'ReviewSuccess' }));
              reloadAfterChange(reload);
            }
          },
          children: (
            <>
              <ReviewEntriesPreview entries={entries} formatMessage={formatMessage} />
              <FormInfo column={1} list={buildReviewFormList({ FormInfo, formatMessage })} />
            </>
          )
        });
      },
      [ajax, apis?.intlAdmin?.langLib?.list, formModal, formatMessage, langLibApis, message, FormInfo, reloadAfterChange]
    );

    const openBatchCopyNamespace = useCallback(
      ({ selectedRows: rows, reload }) => {
        const leafRows = getLeafEntries(rows);
        if (leafRows.length === 0) {
          message.warning(formatMessage({ id: 'BatchCopyNamespaceEmpty' }));
          return;
        }
        const ids = leafRows.map(row => row.id);
        formModal({
          title: formatMessage({ id: 'CopyToNamespace' }),
          size: 'small',
          formProps: {
            onSubmit: async formData => {
              const namespace = resolveNamespaceCode(formData.namespace);
              if (!namespace) {
                return false;
              }
              const resData = await requestCopyToNamespace({
                ajax,
                apis: langLibApis,
                ids,
                namespace
              });
              if (resData.code !== 0) {
                return false;
              }
              const createdCount = resData?.data?.createdCount ?? ids.length;
              message.success(formatMessage({ id: 'CopyToNamespaceSuccess' }, { count: createdCount }));
              reloadAfterChange(reload);
            }
          },
          children: (
            <FormInfo
              column={1}
              list={[
                <GroupSelect
                  name="namespace"
                  label={formatMessage({ id: 'Namespace' })}
                  rule="REQ"
                  single
                  type={INTL_NAMESPACE_TYPE}
                  groupName={formatMessage({ id: 'Namespace' })}
                  showParent={false}
                  valueKey="code"
                  labelKey="name"
                  placeholder={formatMessage({ id: 'TargetNamespacePlaceholder' })}
                  interceptor={{
                    input: value => toNamespaceFieldValue(value),
                    output: value => resolveNamespaceCode(value)
                  }}
                />
              ]}
            />
          )
        });
      },
      [ajax, formModal, formatMessage, langLibApis, message, FormInfo, GroupSelect, reloadAfterChange]
    );

    const openBatchRemove = useCallback(
      ({ selectedRows: rows, reload }) => {
        const leafRows = getLeafEntries(rows);
        if (leafRows.length === 0) {
          message.warning(formatMessage({ id: 'BatchRemoveEmpty' }));
          return;
        }
        const ids = leafRows.map(row => row.id);
        modal.confirm({
          title: formatMessage({ id: 'BatchRemoveConfirmTitle' }),
          content: formatMessage({ id: 'BatchRemoveConfirm' }, { count: ids.length }),
          onOk: async () => {
            const resData = await requestRemove({ ajax, apis: langLibApis, ids });
            if (resData.code !== 0) {
              return;
            }
            message.success(formatMessage({ id: 'BatchRemoveSuccess' }, { count: ids.length }));
            reloadAfterChange(reload);
          }
        });
      },
      [ajax, formatMessage, langLibApis, message, modal, reloadAfterChange]
    );

    const openBatchSetStatus = useCallback(
      ({ selectedRows: rows, reload }, status) => {
        const leafRows = getLeafEntries(rows);
        if (leafRows.length === 0) {
          message.warning(formatMessage({ id: 'BatchStatusEmpty' }));
          return;
        }
        const ids = leafRows.map(row => row.id);
        const isOpen = status === OPEN_STATUS;
        modal.confirm({
          title: formatMessage({ id: isOpen ? 'BatchOpenConfirmTitle' : 'BatchCloseConfirmTitle' }),
          content: formatMessage({ id: isOpen ? 'BatchOpenConfirm' : 'BatchCloseConfirm' }, { count: ids.length }),
          onOk: async () => {
            const resData = await requestSetStatus({ ajax, apis: langLibApis, ids, status });
            if (resData.code !== 0) {
              return;
            }
            message.success(formatMessage({ id: isOpen ? 'BatchOpenSuccess' : 'BatchCloseSuccess' }, { count: ids.length }));
            reloadAfterChange(reload);
          }
        });
      },
      [ajax, formatMessage, langLibApis, message, modal, reloadAfterChange]
    );

    const handleExport = useCallback(async () => {
      if (!langLibApis.export) {
        return;
      }
      try {
        const { data: resData } = await ajax(
          merge({}, langLibApis.export, {
            params: activeNamespace ? { namespace: activeNamespace } : {}
          })
        );
        if (resData?.code !== 0) {
          return;
        }
        const files = resData?.data?.pageData || [];
        if (files.length === 0) {
          message.warning(formatMessage({ id: 'ExportEmpty' }));
          return;
        }
        downloadI18nFiles(files);
        message.success(formatMessage({ id: 'ExportSuccess' }));
      } catch (e) {
        // ignore
      }
    }, [ajax, activeNamespace, formatMessage, langLibApis.export, message]);

    const handleImport = useCallback(() => {
      if (!langLibApis.import) {
        return;
      }
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.i18n,.zip,text/plain,application/zip';
      input.multiple = true;
      input.onchange = async () => {
        const fileList = Array.from(input.files || []);
        if (fileList.length === 0) {
          message.warning(formatMessage({ id: 'ImportEmpty' }));
          return;
        }
        const invalid = fileList.find(file => !/\.(i18n|zip)$/i.test(file.name));
        if (invalid) {
          message.error(formatMessage({ id: 'ImportInvalidFile' }));
          return;
        }
        let progress;
        try {
          const files = await readImportFiles(fileList);
          if (files.length === 0) {
            message.warning(formatMessage({ id: 'ImportZipEmpty' }));
            return;
          }
          progress = openProgressModal(modal, {
            title: formatMessage({ id: 'ImportProgressTitle' }),
            content: formatMessage({ id: 'ImportProgress' }, { current: 0, total: files.length })
          });
          let created = 0;
          let updated = 0;
          for (let i = 0; i < files.length; i += 1) {
            const file = files[i];
            progress.update({
              percent: (i / files.length) * 100,
              content: formatMessage(
                { id: 'ImportProgressFile' },
                { current: i, total: files.length, name: file.filename }
              )
            });
            const { data: resData } = await ajax(
              merge({}, langLibApis.import, {
                data: { files: [file] }
              })
            );
            if (resData?.code !== 0) {
              return;
            }
            created += resData?.data?.createdCount || 0;
            updated += resData?.data?.updatedCount || 0;
            progress.update({
              percent: ((i + 1) / files.length) * 100,
              content: formatMessage(
                { id: 'ImportProgressFile' },
                { current: i + 1, total: files.length, name: file.filename }
              )
            });
          }
          message.success(formatMessage({ id: 'ImportSuccess' }, { created, updated }));
          await syncNamespacesToGroup({ ajax, apis, language });
          reloadAfterChange();
        } catch (e) {
          message.error(e?.message || formatMessage({ id: 'ImportInvalidFile' }));
        } finally {
          progress && progress.close();
        }
      };
      input.click();
    }, [ajax, apis, formatMessage, langLibApis.import, language, message, modal, reloadAfterChange]);

    const handleNamespaceChange = useCallback(
      key => {
        setActiveNamespace(key || '');
        clearSelectedRows();
        setRefreshKey(k => k + 1);
      },
      [clearSelectedRows]
    );

    return (
      <GroupFolder
        type={INTL_NAMESPACE_TYPE}
        apis={groupFolderApis}
        value={activeNamespace || null}
        onChange={handleNamespaceChange}
        valueKey="code"
        labelKey="name"
      >
        <BizUnit
          key={`${refreshKey}-${activeNamespace || 'all'}`}
          isNext
          name="langLib"
          apis={langLibApis}
          getColumns={() => getColumns({ formatMessage })}
          getFormInner={props => (
            <FormInner {...props} defaultNamespace={activeNamespace || undefined} GroupSelect={GroupSelect} />
          )}
          getActionList={({ data, apis: langApis, ...props }) => {
            const isParent = !data?.locale;
            const existingLocales = isParent
              ? (dataRef.current || []).filter(item => item.parentId === data.id && item.locale).map(item => item.locale)
              : [];
            // 内置顺序：save → setStatus×2 → remove；AI重新生成插在删除前
            let beforeRemoveIndex = 0;
            if (langApis?.save) {
              beforeRemoveIndex += 1;
            }
            if (langApis?.setStatus) {
              beforeRemoveIndex += 2;
            }
            const baseActions = ['save', 'remove', 'setStatusOpen', 'setStatusClose'].map(name => ({
              name,
              reset: config => {
                if (isParent) {
                  return { name, hidden: true };
                }
                if (name === 'setStatusOpen') {
                  return { name, hidden: data.status === OPEN_STATUS };
                }
                if (name === 'setStatusClose') {
                  return { name, hidden: data.status === CLOSED_STATUS };
                }
                return { name, hidden: config.hidden };
              }
            }));
            return [
              {
                ...props,
                apis: langApis,
                buttonComponent: AddLocale,
                data,
                existingLocales,
                children: formatMessage({ id: 'AddLocale' }),
                hidden: !isParent
              },
              {
                ...props,
                apis: langApis,
                buttonComponent: CopyToNamespace,
                data,
                GroupSelect,
                ids: isParent
                  ? (dataRef.current || [])
                      .filter(item => item.parentId === data.id && item.locale)
                      .map(item => item.id)
                  : [],
                onSuccess: () => {
                  props.onSuccess && props.onSuccess();
                },
                children: formatMessage({ id: 'CopyToNamespace' }),
                hidden: !isParent
              },
              {
                ...props,
                apis: langApis,
                buttonComponent: Review,
                data,
                children: formatMessage({ id: 'Review' }),
                hidden: isParent || data.reviewStatus !== 'pending'
              },
              {
                ...props,
                apis: langApis,
                buttonComponent: Regenerate,
                data,
                index: beforeRemoveIndex,
                children: formatMessage({ id: 'AiRegenerate' }),
                hidden: isParent || !['pending', 'approved'].includes(data.reviewStatus)
              },
              ...baseActions
            ];
          }}
          filter={filter}
          onFilterChange={value => {
            setFilterValue((value || []).filter(item => item?.name !== 'namespace'));
            clearSelectedRows();
          }}
          page={{
            title: formatMessage({ id: 'LangLib' }),
            menu,
            ...pageProps
          }}
          options={{
            bizName: formatMessage({ id: 'LangLibBiz' }),
            keywordFilterName: 'keyword',
            mapFilterValue: (value, getFv) => {
              const next = Object.assign({}, getFv(value));
              if (activeNamespace) {
                next.namespace = activeNamespace;
              } else {
                delete next.namespace;
              }
              return next;
            },
            openStatus: OPEN_STATUS,
            closedStatus: CLOSED_STATUS,
            openButtonProps: { children: formatMessage({ id: 'StatusOpen' }) },
            closeButtonProps: { children: formatMessage({ id: 'StatusClose' }) },
            closeMessage: formatMessage({ id: 'ConfirmCloseStatus' }, { bizName: formatMessage({ id: 'LangLibBiz' }) }),
            formProps: ({ onSubmit, action }) => {
              const next = {
                onSubmit: async formData => {
                  const result = await onSubmit(formData);
                  if (result === false) {
                    return false;
                  }
                  await syncNamespacesToGroup({ ajax, apis, language });
                }
              };
              // 编辑时不要覆盖 Edit 已注入的 data（否则只剩 namespace，表单无法赋值）
              if (action !== 'edit' && activeNamespace) {
                next.data = { namespace: toNamespaceFieldValue(activeNamespace) };
              }
              return next;
            },
            saveData: data => {
              let next = data;
              if (data?.locale && typeof data.locale !== 'object') {
                next = Object.assign({}, next, {
                  locale: { id: data.locale, name: data.locale, value: data.locale, label: data.locale }
                });
              }
              if (data?.namespace != null && typeof data.namespace !== 'object') {
                next = Object.assign({}, next, {
                  namespace: toNamespaceFieldValue(data.namespace)
                });
              }
              return next;
            },
            tableProps: {
              dataType: 'treeList',
              parentKey: 'parentId',
              pagination: {
                showSizeChanger: true,
                showQuickJumper: true,
                hideOnSinglePage: false
              },
              defaultExpandedKeys: true,
              rowKey: 'id',
              buttonGroup: {
                list: [
                  {
                    children: formatMessage({ id: 'Import' }),
                    onClick: handleImport
                  },
                  {
                    children: formatMessage({ id: 'Export' }),
                    onClick: handleExport
                  }
                ]
              },
              rowSelection,
              selectedRows,
              batchActions: [
                {
                  key: 'batch-open',
                  label: formatMessage({ id: 'BatchOpenAction' }),
                  onClick: ctx => openBatchSetStatus(ctx, OPEN_STATUS)
                },
                {
                  key: 'batch-close',
                  label: formatMessage({ id: 'BatchCloseAction' }),
                  onClick: ctx => openBatchSetStatus(ctx, CLOSED_STATUS)
                },
                {
                  key: 'batch-review',
                  label: formatMessage({ id: 'BatchReviewAction' }),
                  onClick: openBatchReview
                },
                {
                  key: 'batch-copy-namespace',
                  label: formatMessage({ id: 'CopyToNamespace' }),
                  onClick: openBatchCopyNamespace
                },
                {
                  key: 'batch-remove',
                  label: formatMessage({ id: 'BatchRemoveAction' }),
                  danger: true,
                  onClick: openBatchRemove
                }
              ]
            }
          }}
        />
      </GroupFolder>
    );
  })
);

export default LangLib;
