import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, App, Button, Space, Upload, Typography, Table, Checkbox, Tag, Badge } from 'antd';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import OrgChart from '@kne/react-org-chart';
import merge from 'lodash/merge';
import classnames from 'classnames';
import { useIsMobile } from '@kne/responsive-utils';
import {
  ExpandOutlined,
  PlusOutlined,
  MinusOutlined,
  InboxOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  ImportOutlined,
  TeamOutlined,
  UserOutlined,
  LinkOutlined,
  LoginOutlined
} from '@ant-design/icons';
import OrgNodeUserCount from './OrgNodeUserCount';
import OrgOptions from './OrgOptions';
import OrgSourceTag from './OrgSourceTag';
import OrgSplitView, { OrgIcon, LeaderValue } from './OrgSplitView';
import OrgLinkSetting from './OrgLinkSetting';
import ThirdLoginSetting from './ThirdLoginSetting';
import { buildImportPreviewGroups, downloadOrgImportTemplate, parseOrgImportExcelFile, prepareImportRowsForSubmit } from './orgImportTemplate';
import ImportAnchorOrgSelect from './ImportAnchorOrgSelect';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import style from './style.module.scss';
import '@kne/react-org-chart/dist/index.css';

import { getSourceIcon, SOURCE_LABEL_MAP } from '../constants';

const ImportStep = ({ index, title, extra, children }) => (
  <div className={style['import-step']}>
    <div className={style['import-step-head']}>
      <span className={style['import-step-index']}>{index}</span>
      <span className={style['import-step-title']}>{title}</span>
      {extra}
    </div>
    <div className={style['import-step-body']}>{children}</div>
  </div>
);

const DRAG_SCROLL_SKIP_SELECTOR = 'button, a, input, textarea, select, [role="button"], [data-org-card], .ant-btn, .ant-dropdown-trigger';

const useDragToScroll = () => {
  const scrollRef = useRef(null);
  const dragRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const endDrag = useCallback(() => {
    if (!dragRef.current?.active) {
      return;
    }
    dragRef.current.active = false;
    setIsDragging(false);
  }, []);

  const startDrag = useCallback((clientX, clientY, target) => {
    if (target?.closest?.(DRAG_SCROLL_SKIP_SELECTOR)) {
      return;
    }
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    dragRef.current = {
      active: true,
      startX: clientX,
      startY: clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop
    };
    setIsDragging(true);
  }, []);

  const onMouseDown = useCallback(
    e => {
      if (e.button !== 0) {
        return;
      }
      startDrag(e.clientX, e.clientY, e.target);
    },
    [startDrag]
  );

  const onTouchStart = useCallback(
    e => {
      if (e.touches.length !== 1) {
        return;
      }
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY, e.target);
    },
    [startDrag]
  );

  useEffect(() => {
    const onMove = (clientX, clientY) => {
      if (!dragRef.current?.active) {
        return;
      }
      const el = scrollRef.current;
      if (!el) {
        return;
      }
      const { startX, startY, scrollLeft, scrollTop } = dragRef.current;
      el.scrollLeft = scrollLeft - (clientX - startX);
      el.scrollTop = scrollTop - (clientY - startY);
    };

    const onMouseMove = e => {
      if (!dragRef.current?.active) {
        return;
      }
      e.preventDefault();
      onMove(e.clientX, e.clientY);
    };

    const onTouchMove = e => {
      if (!dragRef.current?.active) {
        return;
      }
      if (e.touches.length !== 1) {
        return;
      }
      e.preventDefault();
      const touch = e.touches[0];
      onMove(touch.clientX, touch.clientY);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', endDrag);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', endDrag);
      document.removeEventListener('touchcancel', endDrag);
    };
  }, [endDrag]);

  return { scrollRef, isDragging, onMouseDown, onTouchStart };
};

const ControlPanel = ({ value, onChange }) => {
  return (
    <Space.Compact className={style['control-panel']}>
      <Button
        size="small"
        icon={<ExpandOutlined />}
        onClick={() => {
          onChange(1);
        }}
      />
      <Button
        size="small"
        icon={<PlusOutlined />}
        onClick={() => {
          onChange(value * 1.2);
        }}
      />
      <Button
        size="small"
        icon={<MinusOutlined />}
        onClick={() => {
          onChange(value * 0.8);
        }}
      />
    </Space.Compact>
  );
};

const DEFAULT_COLLAPSE_THRESHOLD = 30;

const getAutoCollapsedIds = (nodes, threshold = DEFAULT_COLLAPSE_THRESHOLD) => {
  let level = nodes || [];
  while (level.length) {
    const next = [];
    for (const node of level) {
      if (node.children?.length) next.push(...node.children);
    }
    if (next.length > threshold) {
      // 从超限层的上一级起，各级有子节点的组织都默认收起，避免展开一级后整棵子树展开
      const collapsed = [];
      const collect = list => {
        (list || []).forEach(node => {
          if (!node.children?.length) return;
          collapsed.push(node.id);
          collect(node.children);
        });
      };
      collect(level);
      return collapsed;
    }
    level = next;
  }
  return [];
};

const getAutoExpandedKeys = (nodes, threshold = DEFAULT_COLLAPSE_THRESHOLD) => {
  const collapsed = new Set(getAutoCollapsedIds(nodes, threshold));
  const expanded = [];
  const walk = list => {
    (list || []).forEach(node => {
      if (!node.children?.length) return;
      if (collapsed.has(node.id)) return;
      expanded.push(node.id);
      walk(node.children);
    });
  };
  walk(nodes);
  return expanded;
};

const GraphOrg = createWithRemoteLoader({
  modules: ['components-core:Common@SimpleBar']
})(({ remoteModules, data, apis, onSuccess, onViewUsers, linkedSource, collapseThreshold = DEFAULT_COLLAPSE_THRESHOLD }) => {
  const [expandIds, setExpandIds] = useState(() => getAutoCollapsedIds(data, collapseThreshold));
  const [scale, setScale] = useState(1);
  const { scrollRef, isDragging, onMouseDown, onTouchStart } = useDragToScroll();

  useEffect(() => {
    setExpandIds(getAutoCollapsedIds(data, collapseThreshold));
  }, [data, collapseThreshold]);
  const renderNode = data => {
    return data.map(node => {
      const collapsed = expandIds.indexOf(node.id) !== -1;
      const childCount = node.children ? node.children.length : 0;
      const card = (
        <div data-org-card className={classnames(style['graph-card'], { [style['graph-card-root']]: node.id === 'root' })}>
          <div className={style['graph-card-head']}>
            <OrgIcon root={node.id === 'root'} size="small" />
            <div className={style['graph-card-name']} title={node.name}>
              {node.name}
            </div>
            <span className={style['graph-card-more']}>
              <OrgOptions data={node} apis={apis} onSuccess={onSuccess} onViewUsers={onViewUsers} showLength={0} />
            </span>
          </div>
          {node.description && <div className={style['graph-card-desc']}>{node.description}</div>}
          <div className={style['graph-card-meta']}>
            <OrgNodeUserCount count={node.userCount} />
            <OrgSourceTag source={node.syncSource} />
            {node.leader?.name && <LeaderValue leader={node.leader} />}
          </div>
          {childCount > 0 && (
            <button
              type="button"
              className={classnames(style['graph-card-toggle'], { [style['graph-card-toggle-collapsed']]: collapsed })}
              onClick={() => {
                setExpandIds(expandIds => (collapsed ? expandIds.filter(id => id !== node.id) : expandIds.concat(node.id)));
              }}>
              {collapsed ? childCount : <MinusOutlined />}
            </button>
          )}
        </div>
      );
      if (node.id === 'root') {
        return (
          <OrgChart className={style['org-chart']} key={node.id} label={card}>
            {renderNode(expandIds.indexOf(node.id) === -1 ? node.children : [])}
          </OrgChart>
        );
      }
      return (
        <OrgChart.Node key={node.id} label={card}>
          {renderNode(expandIds.indexOf(node.id) === -1 ? node.children : [])}
        </OrgChart.Node>
      );
    });
  };
  return (
    <div className={style['org-chart-outer']}>
      <ControlPanel value={scale} onChange={setScale} />
      <div
        ref={scrollRef}
        className={`${style['org-chart-inner']} ${isDragging ? style['org-chart-inner-dragging'] : ''}`}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}>
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left'
          }}>
          {renderNode(data)}
        </div>
      </div>
    </div>
  );
});

const OrgInfo = createWithRemoteLoader({
  modules: ['components-core:StateBar', 'components-core:Global@usePreset', 'components-core:Drawer@useDrawer', 'components-core:Modal']
})(({
  remoteModules,
  data,
  companyName,
  apis,
  onSuccess,
  tenantId,
  onViewUsers,
  linkedSource,
  linkSettingProps,
  thirdLoginSettingProps,
  collapseThreshold = DEFAULT_COLLAPSE_THRESHOLD
}) => {
  const [StateBar, usePreset, useDrawer, Modal] = remoteModules;
  const { ajax } = usePreset();
  const drawer = useDrawer();
  const [activeKey, setActiveKey] = useState('tree');
  const [importOpen, setImportOpen] = useState(false);
  const [anchorOrgId, setAnchorOrgId] = useState(undefined);
  const [importFile, setImportFile] = useState(null);
  const [parsedRows, setParsedRows] = useState(null);
  const [importSelectedRowKeys, setImportSelectedRowKeys] = useState([]);
  const [uploadKey, setUploadKey] = useState(0);
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const isMobile = useIsMobile();
  const importPreviewOpen = parsedRows !== null;
  const importModalWidth = isMobile ? 'calc(100vw - 32px)' : importPreviewOpen ? 1080 : 560;
  const importPreviewGroups = useMemo(() => buildImportPreviewGroups(parsedRows || []), [parsedRows]);

  const importSelectedKeySet = useMemo(() => new Set(importSelectedRowKeys.map(String)), [importSelectedRowKeys]);

  const renderImportEmpty = useCallback(v => (v ? v : <span className={style['import-preview-empty']}>—</span>), []);

  const toggleImportRowIndices = useCallback((indices, checked) => {
    setImportSelectedRowKeys(prev => {
      const next = new Set(prev.map(String));
      indices.forEach(i => {
        const k = String(i);
        if (checked) {
          next.add(k);
        } else {
          next.delete(k);
        }
      });
      return Array.from(next);
    });
  }, []);

  const previewOrgColumns = useMemo(
    () => [
      {
        title: '',
        width: 48,
        fixed: 'left',
        className: style['import-preview-checkbox-cell'],
        render: (_, record) => {
          const indices = record.rowIndices;
          const allSelected = indices.length > 0 && indices.every(i => importSelectedKeySet.has(String(i)));
          const someSelected = indices.some(i => importSelectedKeySet.has(String(i)));
          return (
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={e => toggleImportRowIndices(indices, e.target.checked)}
            />
          );
        }
      },
      {
        title: formatMessage({ id: 'OrgName' }),
        dataIndex: 'orgName',
        ellipsis: true,
        render: (v, record) => (
          <Space size={8} wrap className={style['import-preview-org-cell']}>
            <TeamOutlined className={style['import-preview-org-icon']} />
            <span className={style['import-preview-org-name']}>{v || '—'}</span>
            {!record.orgInSheet ? (
              <Tag bordered={false} className={style['import-preview-ref-tag']}>
                {formatMessage({ id: 'ImportOrgRefOnly' })}
              </Tag>
            ) : null}
          </Space>
        )
      },
      {
        title: formatMessage({ id: 'ImportColParentOrg' }),
        dataIndex: 'parentOrgName',
        ellipsis: true,
        render: renderImportEmpty
      },
      {
        title: formatMessage({ id: 'ImportColUserCount' }),
        width: 96,
        align: 'center',
        render: (_, record) => (
          <Badge
            count={record.users.length}
            showZero
            overflowCount={99}
            className={style['import-preview-user-badge']}
            color={record.users.length ? 'var(--primary-color)' : 'var(--font-color-grey-3)'}
          />
        )
      },
      {
        title: formatMessage({ id: 'Description' }),
        dataIndex: 'description',
        ellipsis: true,
        render: renderImportEmpty
      }
    ],
    [formatMessage, importSelectedKeySet, toggleImportRowIndices, renderImportEmpty]
  );

  const previewUserColumns = useMemo(
    () => [
      {
        title: '',
        width: 48,
        className: style['import-preview-checkbox-cell'],
        render: (_, record) => (
          <Checkbox
            checked={importSelectedKeySet.has(String(record.rowIndex))}
            onChange={e => toggleImportRowIndices([record.rowIndex], e.target.checked)}
          />
        )
      },
      {
        title: formatMessage({ id: 'ImportColUserName' }),
        dataIndex: 'userName',
        ellipsis: true,
        render: v =>
          v ? (
            <div className={style['import-preview-user-cell']}>
              <span className={style['import-preview-user-avatar']}>{String(v).trim().charAt(0) || '?'}</span>
              <span className={style['import-preview-user-name']}>{v}</span>
            </div>
          ) : (
            renderImportEmpty(v)
          )
      },
      {
        title: formatMessage({ id: 'ImportColEmail' }),
        dataIndex: 'email',
        ellipsis: true,
        render: renderImportEmpty
      },
      {
        title: formatMessage({ id: 'ImportColPhone' }),
        dataIndex: 'phone',
        ellipsis: true,
        render: renderImportEmpty
      },
      {
        title: formatMessage({ id: 'ImportColIsLeader' }),
        dataIndex: 'isLeader',
        width: 96,
        align: 'center',
        render: v =>
          v ? (
            <Tag color="gold" bordered={false} className={style['import-preview-leader-tag']}>
              {formatMessage({ id: 'Yes' })}
            </Tag>
          ) : (
            renderImportEmpty(v)
          )
      }
    ],
    [formatMessage, importSelectedKeySet, toggleImportRowIndices, renderImportEmpty]
  );
  const treeData = useMemo(() => {
    const output = [
      {
        id: 'root',
        name: companyName || formatMessage({ id: 'UnnamedCompany' })
      }
    ];

    const parseTree = output => {
      return output.map(node => {
        const children = data.filter(item => {
          if (node.id === 'root') {
            return !item.parentId;
          }
          return item.parentId === node.id;
        });
        return Object.assign({}, node, { children: parseTree(children) });
      });
    };

    const tree = parseTree(output);
    return tree.map(root => {
      if (root.id !== 'root') {
        return root;
      }
      const children = root.children || [];
      return Object.assign({}, root, {
        userCount: children.reduce((sum, child) => sum + (Number(child.userCount) || 0), 0),
        children
      });
    });
  }, [data, companyName, formatMessage]);

  const defaultExpandedKeys = useMemo(() => getAutoExpandedKeys(treeData, collapseThreshold), [treeData, collapseThreshold]);

  const anchorOrgListApi = useMemo(() => {
    if (!apis?.orgList) {
      return null;
    }
    return merge({}, apis.orgList, tenantId ? { params: Object.assign({ tenantId }, apis.orgList.params || {}) } : {});
  }, [apis?.orgList, tenantId]);

  const closeImport = () => {
    setImportOpen(false);
    setImportFile(null);
    setParsedRows(null);
    setImportSelectedRowKeys([]);
    setUploadKey(k => k + 1);
    setAnchorOrgId(undefined);
  };

  const handleImportSubmit = async () => {
    if (!parsedRows || !parsedRows.length) {
      message.warning(formatMessage({ id: 'ImportFileRequired' }));
      return;
    }
    if (!importSelectedRowKeys.length) {
      message.warning(formatMessage({ id: 'ImportNoRowsSelected' }));
      return;
    }
    const keySet = new Set(importSelectedRowKeys.map(k => String(k)));
    let rowsToSubmit;
    try {
      const selected = parsedRows.map((row, i) => ({ row, i })).filter(({ i }) => keySet.has(String(i)));
      rowsToSubmit = selected.map(({ row, i }) => prepareImportRowsForSubmit([row], { rowIndexOffset: i })[0]);
    } catch (e) {
      message.error(e?.message || String(e));
      return;
    }
    const importUrl = apis.import?.url || '';
    const isAdminBatchImport = importUrl.indexOf('/admin/') >= 0;
    if (isAdminBatchImport && !tenantId) {
      message.error(formatMessage({ id: 'ImportTenantIdMissing' }));
      return;
    }
    const body = { rows: rowsToSubmit };
    if (anchorOrgId) {
      body.parentOrgId = anchorOrgId;
    }
    if (isAdminBatchImport && tenantId) {
      body.tenantId = tenantId;
    }
    const { data: resData } = await ajax(
      merge({}, apis.import, {
        data: body
      })
    );
    if (resData.code !== 0) {
      return;
    }
    const { createdOrgs, createdUsers, reusedUsers, rowCount } = resData.data;
    message.success(
      formatMessage(
        { id: 'ImportOrgUsersSuccess' },
        {
          createdOrgs,
          createdUsers,
          reusedUsers,
          rowCount
        }
      )
    );
    closeImport();
    onSuccess && onSuccess();
  };

  return (
    <Flex vertical className={style['org-info']}>
      <Flex className={style['org-toolbar']} justify="space-between" align="center" wrap="wrap" gap={12}>
        <Flex align="center" gap={12} wrap="wrap" className={style['org-toolbar-main']}>
          <StateBar
            activeKey={activeKey}
            onChange={setActiveKey}
            type="radio"
            stateOption={[
              { tab: formatMessage({ id: 'Tree' }), key: 'tree' },
              { tab: formatMessage({ id: 'Graph' }), key: 'graph' }
            ]}
          />
          <span className={style['org-toolbar-summary']}>{formatMessage({ id: 'OrgSummary' }, { orgCount: data.length, userCount: treeData[0]?.userCount || 0 })}</span>
        </Flex>
        <Space className={style['org-toolbar-actions']} wrap>
          {linkSettingProps ? (
            <Button
              icon={linkedSource ? getSourceIcon(linkedSource) : <LinkOutlined />}
              onClick={() => {
                drawer({
                  title: formatMessage({ id: 'OrgLinkTitle' }),
                  width: 480,
                  footer: null,
                  children: (
                    <OrgLinkSetting
                      apis={apis}
                      tenantId={linkSettingProps.tenantId}
                      envArgs={linkSettingProps.envArgs}
                      onSuccess={() => {
                        linkSettingProps.onLinkChange && linkSettingProps.onLinkChange();
                      }}
                    />
                  )
                });
              }}>
              {linkedSource ? `${SOURCE_LABEL_MAP[linkedSource] || linkedSource}` : formatMessage({ id: 'OrgLinkTitle' })}
            </Button>
          ) : null}
          {thirdLoginSettingProps ? (
            <Button
              icon={<LoginOutlined />}
              onClick={() => {
                drawer({
                  title: formatMessage({ id: 'ThirdLoginConfigTitle' }),
                  width: 480,
                  footer: null,
                  children: (
                    <ThirdLoginSetting
                      apis={apis}
                      envArgs={thirdLoginSettingProps.envArgs}
                      onSuccess={() => {
                        thirdLoginSettingProps.onChange && thirdLoginSettingProps.onChange();
                      }}
                    />
                  )
                });
              }}>
              {formatMessage({ id: 'ThirdLoginConfigTitle' })}
            </Button>
          ) : null}
          {apis.import ? (
            <Button
              type="primary"
              icon={<ImportOutlined />}
              onClick={() => {
                setImportFile(null);
                setParsedRows(null);
                setImportSelectedRowKeys([]);
                setUploadKey(k => k + 1);
                setAnchorOrgId(undefined);
                setImportOpen(true);
              }}>
              {formatMessage({ id: 'OrgExcelImport' })}
            </Button>
          ) : null}
        </Space>
      </Flex>
      <Modal
        title={formatMessage({ id: 'OrgExcelImport' })}
        open={importOpen}
        onClose={closeImport}
        footerButtons={[
          { children: formatMessage({ id: 'Cancel' }) },
          {
            type: 'primary',
            children: formatMessage({ id: 'ImportConfirmSubmit' }),
            disabled: !parsedRows || !parsedRows.length || !importSelectedRowKeys.length,
            autoClose: false,
            onClick: handleImportSubmit
          }
        ]}
        destroyOnClose
        width={importModalWidth}>
        <Flex vertical gap={20} className={style['import-modal']}>
          <ImportStep index={1} title={formatMessage({ id: 'ImportStepTemplate' })}>
            <div className={style['import-template-card']}>
              <FileExcelOutlined className={style['import-template-icon']} />
              <div className={style['import-template-main']}>
                <Typography.Text type="secondary" className={style['import-modal-hint']}>
                  {formatMessage({ id: 'ImportExcelHint' })}
                </Typography.Text>
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  className={style['import-modal-download']}
                  onClick={() => {
                    downloadOrgImportTemplate();
                  }}>
                  {formatMessage({ id: 'DownloadImportTemplate' })}
                </Button>
              </div>
            </div>
          </ImportStep>
          <ImportStep index={2} title={formatMessage({ id: 'ImportAnchorLabel' })}>
            <ImportAnchorOrgSelect
              data={data}
              orgListApi={anchorOrgListApi}
              value={anchorOrgId}
              onChange={setAnchorOrgId}
              placeholder={formatMessage({ id: 'ImportAnchorPlaceholder' })}
            />
          </ImportStep>
          <ImportStep index={3} title={formatMessage({ id: 'ImportUploadLabel' })}>
            <Upload.Dragger
              key={uploadKey}
              maxCount={1}
              accept=".xlsx,.xls"
              beforeUpload={file => {
                (async () => {
                  try {
                    const rows = await parseOrgImportExcelFile(file);
                    setImportFile(file);
                    setParsedRows(rows);
                    setImportSelectedRowKeys(rows.map((_, i) => String(i)));
                  } catch (e) {
                    setImportFile(null);
                    setParsedRows(null);
                    setImportSelectedRowKeys([]);
                    message.error(e?.message || String(e));
                  }
                })();
                return false;
              }}
              onRemove={() => {
                setImportFile(null);
                setParsedRows(null);
                setImportSelectedRowKeys([]);
                return true;
              }}
              fileList={
                importFile
                  ? [
                      {
                        uid: '-1',
                        name: importFile.name,
                        status: 'done'
                      }
                    ]
                  : []
              }>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{formatMessage({ id: 'ImportDragText' })}</p>
            </Upload.Dragger>
            {importFile ? (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setImportFile(null);
                  setParsedRows(null);
                  setImportSelectedRowKeys([]);
                  setUploadKey(k => k + 1);
                }}>
                {formatMessage({ id: 'ImportRechooseFile' })}
              </Button>
            ) : null}
          </ImportStep>
          {parsedRows !== null ? (
            <ImportStep
              index={4}
              title={formatMessage({ id: 'ImportPreviewLabel' })}
              extra={
                <span className={style['import-preview-stat']}>
                  {formatMessage({ id: 'ImportSelectedCount' }, { selected: importSelectedRowKeys.length, total: parsedRows.length })}
                </span>
              }>
              <Typography.Text type="secondary" className={style['import-preview-tip']}>
                {formatMessage({ id: 'ImportPreviewCount' }, { count: parsedRows.length })}
              </Typography.Text>
              <div className={style['import-preview-panel']}>
                <Table
                  className={style['import-preview-table']}
                  size="small"
                  bordered
                  rowKey="key"
                  columns={previewOrgColumns}
                  dataSource={importPreviewGroups}
                  pagination={false}
                  scroll={{ x: 'max-content', y: 320 }}
                  defaultExpandAllRows
                  expandable={{
                    rowExpandable: record => record.users.length > 0,
                    expandedRowRender: record =>
                      record.users.length ? (
                        <div className={style['import-preview-expand']}>
                          <Flex align="center" gap={12} className={style['import-preview-expand-header']}>
                            <Flex align="center" gap={8} className={style['import-preview-expand-header-label']}>
                              <UserOutlined className={style['import-preview-expand-icon']} />
                              <span>{formatMessage({ id: 'ImportNestedUsers' })}</span>
                            </Flex>
                            <Badge
                              count={record.users.length}
                              overflowCount={99}
                              color="var(--primary-color)"
                              className={style['import-preview-expand-badge']}
                            />
                          </Flex>
                          <Table
                            className={style['import-preview-nested-table']}
                            size="small"
                            bordered
                            rowKey="key"
                            columns={previewUserColumns}
                            dataSource={record.users}
                            pagination={false}
                            showHeader
                          />
                        </div>
                      ) : null
                  }}
                />
              </div>
            </ImportStep>
          ) : null}
        </Flex>
      </Modal>
      <div className={style['org']}>
        {activeKey === 'tree' && (
          <OrgSplitView
            data={treeData}
            apis={apis}
            onSuccess={onSuccess}
            onViewUsers={onViewUsers}
            isMobile={isMobile}
            defaultExpandedKeys={defaultExpandedKeys}
          />
        )}
        {activeKey === 'graph' && (
          <GraphOrg
            data={treeData}
            apis={apis}
            onSuccess={onSuccess}
            onViewUsers={onViewUsers}
            linkedSource={linkedSource}
            collapseThreshold={collapseThreshold}
          />
        )}
      </div>
    </Flex>
  );
});

export default withLocale(OrgInfo);
