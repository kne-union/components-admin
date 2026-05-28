import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Tree, App, Card, Button, Space, Modal, Upload, Typography, Table, Avatar, Divider, Checkbox, Tag, Badge, Tooltip, Drawer } from 'antd';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import OrgChart from '@kne/react-org-chart';
import merge from 'lodash/merge';
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  ExpandOutlined,
  PlusOutlined,
  MinusOutlined,
  InboxOutlined,
  DownloadOutlined,
  TeamOutlined,
  UserOutlined,
  CloudOutlined,
  EditOutlined,
  LinkOutlined
} from '@ant-design/icons';
import FormInner from './FormInner';
import LeaderFormInner from './LeaderFormInner';
import { normalizeLeaderUserIdForSubmit } from './normalizeLeaderUserIdForSubmit';
import OrgNodeUserCount from './OrgNodeUserCount';
import OrgLinkSetting from './OrgLinkSetting';
import { buildImportPreviewGroups, downloadOrgImportTemplate, parseOrgImportExcelFile, prepareImportRowsForSubmit } from './orgImportTemplate';
import ImportAnchorOrgSelect from './ImportAnchorOrgSelect';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import style from './style.module.scss';
import '@kne/react-org-chart/dist/index.css';

const SOURCE_LABEL_MAP = {
  wecom: '企业微信',
  dingtalk: '钉钉'
};

/** SuperSelect object-output-value 回显需 { id, name }，不能只传 id 字符串 */
const mapOrgToFormData = org => {
  let leaderUserId = null;
  if (org.leader?.id != null) {
    leaderUserId = { id: org.leader.id, name: org.leader.name };
  } else if (org.leaderUserId != null) {
    leaderUserId = {
      id: org.leaderUserId,
      ...(org.leaderName ? { name: org.leaderName } : {})
    };
  }
  return Object.assign({}, org, { leaderUserId });
};

const OrgSourceTag = ({ source }) => {
  const { formatMessage } = useIntl();
  if (!source) {
    return null;
  }
  const label = SOURCE_LABEL_MAP[source] || source;
  return (
    <Tooltip title={formatMessage({ id: 'OrgSourceFrom' }, { source: label })}>
      <Tag className={style['org-source-tag']} icon={<CloudOutlined />} color="processing">
        {label}
      </Tag>
    </Tooltip>
  );
};

const OrgOptions = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:ButtonGroup', 'components-core:Icon', 'components-core:FormInfo@useFormModal']
})(({ remoteModules, showLength = 3, data, apis, onSuccess, onViewUsers, linkedSource }) => {
  const [usePreset, ButtonGroup, Icon, useFormModal] = remoteModules;
  const { ajax } = usePreset();
  const formModal = useFormModal();
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const isExternalSource = linkedSource && data.source === linkedSource;
  return (
    <ButtonGroup
      itemClassName="btn-no-padding"
      moreType="link"
      list={[
        {
          icon: <UserOutlined />,
          type: 'link',
          children: formatMessage({ id: 'ViewUsers' }),
          hidden: !(data.id && data.id !== 'root') || typeof onViewUsers !== 'function',
          onClick: () => {
            onViewUsers(data);
          }
        },
        {
          icon: <Icon type="tianjia" />,
          type: 'link',
          children: formatMessage({ id: 'AddSubOrg' }),
          hidden: !apis.create || isExternalSource,
          onClick: async () => {
            formModal({
              title: formatMessage({ id: 'AddSubOrg' }),
              size: 'small',
              formProps: {
                onSubmit: async formData => {
                  const { data: resData } = await ajax(
                    merge({}, apis.create, {
                      data: Object.assign(
                        {},
                        formData,
                        {
                          leaderUserId: normalizeLeaderUserIdForSubmit(formData.leaderUserId)
                        },
                        data.id && data.id !== 'root'
                          ? {
                              parentId: data.id
                            }
                          : {}
                      )
                    })
                  );
                  if (resData.code !== 0) {
                    return false;
                  }
                  message.success(formatMessage({ id: 'AddSuccess' }));
                  onSuccess && onSuccess();
                }
              },
              children: <FormInner apis={apis} />
            });
          }
        },
        {
          icon: <Icon type="bianji" />,
          type: 'link',
          children: formatMessage({ id: 'Edit' }),
          hidden: !(data.id && data.id !== 'root') || !apis.save || isExternalSource,
          onClick: async () => {
            formModal({
              title: formatMessage({ id: 'EditOrgNode' }),
              size: 'small',
              formProps: {
                data: mapOrgToFormData(data),
                onSubmit: async formData => {
                  const { data: resData } = await ajax(
                    merge({}, apis.save, {
                      data: Object.assign({}, formData, {
                        parentId: data.parentId,
                        id: data.id,
                        leaderUserId: normalizeLeaderUserIdForSubmit(formData.leaderUserId)
                      })
                    })
                  );
                  if (resData.code !== 0) {
                    return false;
                  }
                  message.success(formatMessage({ id: 'SaveSuccess' }));
                  onSuccess && onSuccess();
                }
              },
              children: <FormInner apis={apis} orgId={data.id} />
            });
          }
        },
        {
          icon: <EditOutlined />,
          type: 'link',
          children: formatMessage({ id: 'EditOrgLeader' }),
          hidden: !(data.id && data.id !== 'root') || !apis.save || !isExternalSource,
          onClick: async () => {
            formModal({
              title: formatMessage({ id: 'EditOrgLeader' }),
              size: 'small',
              formProps: {
                data: mapOrgToFormData(data),
                onSubmit: async formData => {
                  const { data: resData } = await ajax(
                    merge({}, apis.save, {
                      data: Object.assign({}, {
                        id: data.id,
                        parentId: data.parentId,
                        name: data.name,
                        description: data.description,
                        leaderUserId: normalizeLeaderUserIdForSubmit(formData.leaderUserId)
                      })
                    })
                  );
                  if (resData.code !== 0) {
                    return false;
                  }
                  message.success(formatMessage({ id: 'SaveSuccess' }));
                  onSuccess && onSuccess();
                }
              },
              children: <LeaderFormInner apis={apis} orgId={data.id} />
            });
          }
        },
        {
          icon: <Icon type="shanchu" />,
          type: 'link',
          children: formatMessage({ id: 'Delete' }),
          hidden: !(data.id && data.id !== 'root') || !apis.remove || isExternalSource,
          confirm: true,
          isDelete: true,
          danger: true,
          disabled: data.children && data.children.length > 0,
          onClick: async () => {
            const { data: resData } = await ajax(
              merge({}, apis.remove, {
                data: { id: data.id }
              })
            );
            if (resData.code !== 0) {
              return;
            }
            message.success(formatMessage({ id: 'DeleteSuccess' }));
            onSuccess && onSuccess();
          }
        }
      ]}
    />
  );
});

const OrgLeaderMeta = createWithRemoteLoader({
  modules: ['components-core:Image']
})(({ remoteModules, leader, variant = 'tree' }) => {
  const [Image] = remoteModules;
  if (!leader?.name) {
    return null;
  }

  const name = String(leader.name);
  const initial = name.trim().charAt(0);
  const avatarSrc = leader.avatar || leader.avatarUrl || leader.leaderAvatar;

  return (
    <div className={`${style['org-leader-meta']} ${style[`org-leader-meta-${variant}`]}`}>
      <Flex align="center" gap={8} className={style['org-leader-row']}>
        <Image.Avatar size={22} className={style['org-leader-avatar']} id={leader.avatar}>
          {!leader.avatar ? initial : null}
        </Image.Avatar>
        <span className={style['org-leader-name']} title={name}>
          {name}
        </span>
      </Flex>
    </div>
  );
});

const DRAG_SCROLL_SKIP_SELECTOR = 'button, a, input, textarea, select, [role="button"], .ant-card, .ant-btn, .ant-dropdown-trigger';

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
        icon={<ExpandOutlined />}
        onClick={() => {
          onChange(1);
        }}
      />
      <Button
        icon={<PlusOutlined />}
        onClick={() => {
          onChange(value * 1.2);
        }}
      />
      <Button
        icon={<MinusOutlined />}
        onClick={() => {
          onChange(value * 0.8);
        }}
      />
    </Space.Compact>
  );
};

const GraphOrg = createWithRemoteLoader({
  modules: ['components-core:Common@SimpleBar']
})(({ remoteModules, data, apis, onSuccess, onViewUsers, linkedSource }) => {
  const [expandIds, setExpandIds] = useState([]);
  const [scale, setScale] = useState(1);
  const { scrollRef, isDragging, onMouseDown, onTouchStart } = useDragToScroll();
  const renderNode = data => {
    return data.map(node => {
      const card = (
        <Card
          type="inner"
          hoverable
          size="small"
          className={style['org-card']}
          extra={<OrgOptions data={node} apis={apis} onSuccess={onSuccess} onViewUsers={onViewUsers} linkedSource={linkedSource} showLength={0} />}>
          <Flex align="center" gap={8} wrap="wrap" className={style['tree-node-title-row']}>
            <div className={style['tree-node-title']}>{node.name}</div>
            <OrgSourceTag source={linkedSource && node.source === linkedSource ? node.source : null} />
            <OrgNodeUserCount count={node.userCount} />
          </Flex>
          {node.description && <div className={style['tree-node-description']}>{node.description}</div>}
          {node.leader && (
            <>
              <Divider style={{ marginBottom: 0 }} />
              <OrgLeaderMeta leader={node.leader} variant="graph" />
            </>
          )}
          {node.children && node.children.length > 0 && (
            <Button
              icon={expandIds.indexOf(node.id) === -1 ? <MinusCircleOutlined /> : <PlusCircleOutlined />}
              shape="circle"
              size="small"
              type="link"
              className={style['org-btn']}
              onClick={() => {
                setExpandIds(expandIds => {
                  const newExpandIds = expandIds.slice(0);
                  const index = expandIds.indexOf(node.id);
                  if (index === -1) {
                    newExpandIds.push(node.id);
                  } else {
                    newExpandIds.splice(index, 1);
                  }
                  return newExpandIds;
                });
              }}
            />
          )}
        </Card>
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

const TreeOrg = ({ data, ids, apis, onSuccess, onViewUsers, linkedSource }) => {
  const [expandedKeys, setExpandedKeys] = useState(['root']);

  useEffect(() => {
    ids && ids.length > 0 && setExpandedKeys(['root', ...ids]);
  }, [ids]);

  return (
    <Tree
      blockNode
      showLine={{ showLeafIcon: false }}
      showIcon
      selectable={false}
      expandedKeys={expandedKeys}
      fieldNames={{ title: 'name', key: 'id', children: 'children' }}
      treeData={data}
      onExpand={expandedKeys => {
        setExpandedKeys(expandedKeys);
      }}
      className={style['org-tree']}
      titleRender={nodeData => {
        return (
          <Flex vertical className={style['tree-node']}>
            <Flex className={style['tree-node-main']} align="center" wrap="nowrap">
              <Flex align="center" gap={8} wrap="wrap" className={style['tree-node-title-row']}>
                <span className={style['tree-node-title']}>{nodeData.name}</span>
                <OrgSourceTag source={linkedSource && nodeData.source === linkedSource ? nodeData.source : null} />
                <OrgNodeUserCount count={nodeData.userCount} />
              </Flex>
              <span className={style['tree-node-options']}>
                <OrgOptions data={nodeData} apis={apis} onSuccess={onSuccess} onViewUsers={onViewUsers} linkedSource={linkedSource} />
              </span>
            </Flex>
            {(nodeData.description || nodeData.leader?.name) && (
              <div className={style['tree-node-extra']}>
                {nodeData.description ? <div className={style['tree-node-description']}>{nodeData.description}</div> : null}
                <OrgLeaderMeta leader={nodeData.leader} variant="tree" />
              </div>
            )}
          </Flex>
        );
      }}
    />
  );
};

const OrgInfo = createWithRemoteLoader({
  modules: ['components-core:StateBar', 'components-core:Global@usePreset']
})(({ remoteModules, data, companyName, apis, onSuccess, tenantId, onViewUsers, linkedSource, linkSettingProps }) => {
  const [StateBar, usePreset] = remoteModules;
  const { ajax } = usePreset();
  const [activeKey, setActiveKey] = useState('tree');
  const [importOpen, setImportOpen] = useState(false);
  const [linkDrawerOpen, setLinkDrawerOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [anchorOrgId, setAnchorOrgId] = useState(undefined);
  const [importFile, setImportFile] = useState(null);
  const [parsedRows, setParsedRows] = useState(null);
  const [importSelectedRowKeys, setImportSelectedRowKeys] = useState([]);
  const [uploadKey, setUploadKey] = useState(0);
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  const importPreviewGroups = useMemo(() => buildImportPreviewGroups(parsedRows || []), [parsedRows]);

  const importSelectedKeySet = useMemo(() => new Set(importSelectedRowKeys.map(String)), [importSelectedRowKeys]);

  const renderImportEmpty = useCallback(v => (v ? v : <span className={style.importPreviewEmpty}>—</span>), []);

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
        className: style.importPreviewCheckboxCell,
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
          <Space size={8} wrap className={style.importPreviewOrgCell}>
            <TeamOutlined className={style.importPreviewOrgIcon} />
            <span className={style.importPreviewOrgName}>{v || '—'}</span>
            {!record.orgInSheet ? (
              <Tag bordered={false} className={style.importPreviewRefTag}>
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
            className={style.importPreviewUserBadge}
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
        className: style.importPreviewCheckboxCell,
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
            <div className={style.importPreviewUserCell}>
              <span className={style.importPreviewUserAvatar}>{String(v).trim().charAt(0) || '?'}</span>
              <span className={style.importPreviewUserName}>{v}</span>
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
            <Tag color="gold" bordered={false} className={style.importPreviewLeaderTag}>
              {formatMessage({ id: 'Yes' })}
            </Tag>
          ) : (
            renderImportEmpty(v)
          )
      }
    ],
    [formatMessage, importSelectedKeySet, toggleImportRowIndices, renderImportEmpty]
  );
  const { treeData, ids } = useMemo(() => {
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
    const treeData = tree.map(root => {
      if (root.id !== 'root') {
        return root;
      }
      const children = root.children || [];
      return Object.assign({}, root, {
        userCount: children.reduce((sum, child) => sum + (Number(child.userCount) || 0), 0),
        children
      });
    });

    return {
      treeData,
      ids: data.map(item => item.id)
    };
  }, [data, companyName, formatMessage]);

  const anchorOrgListApi = useMemo(() => {
    if (!apis?.orgList) {
      return null;
    }
    return merge({}, apis.orgList, tenantId ? { params: Object.assign({ tenantId }, apis.orgList.params || {}) } : {});
  }, [apis?.orgList, tenantId]);

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
    setImportLoading(true);
    try {
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
          { id: 'ImportSuccess' },
          {
            createdOrgs,
            createdUsers,
            reusedUsers,
            rowCount
          }
        )
      );
      setImportOpen(false);
      setImportFile(null);
      setParsedRows(null);
      setImportSelectedRowKeys([]);
      setUploadKey(k => k + 1);
      setAnchorOrgId(undefined);
      onSuccess && onSuccess();
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <Flex vertical>
      <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
        <StateBar
          activeKey={activeKey}
          onChange={setActiveKey}
          type="radio"
          stateOption={[
            { tab: formatMessage({ id: 'Tree' }), key: 'tree' },
            { tab: formatMessage({ id: 'Graph' }), key: 'graph' }
          ]}
        />
        <Space>
          {linkSettingProps ? (
            <Button
              icon={linkedSource ? <CloudOutlined /> : <LinkOutlined />}
              onClick={() => setLinkDrawerOpen(true)}>
              {linkedSource ? `${SOURCE_LABEL_MAP[linkedSource] || linkedSource}` : formatMessage({ id: 'OrgLinkTitle' })}
            </Button>
          ) : null}
          {apis.import ? (
            <Button
              type="primary"
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
      {linkSettingProps ? (
        <Drawer
          title={formatMessage({ id: 'OrgLinkTitle' })}
          open={linkDrawerOpen}
          onClose={() => setLinkDrawerOpen(false)}
          width={480}
          destroyOnClose>
          <OrgLinkSetting
            tenantId={linkSettingProps.tenantId}
            envArgs={linkSettingProps.envArgs}
            onSuccess={() => {
              linkSettingProps.onLinkChange && linkSettingProps.onLinkChange();
            }}
          />
        </Drawer>
      ) : null}
      <Modal
        title={formatMessage({ id: 'OrgExcelImport' })}
        open={importOpen}
        onCancel={() => {
          setImportOpen(false);
          setImportFile(null);
          setParsedRows(null);
          setImportSelectedRowKeys([]);
          setUploadKey(k => k + 1);
          setAnchorOrgId(undefined);
        }}
        onOk={handleImportSubmit}
        okText={formatMessage({ id: 'ImportConfirmSubmit' })}
        okButtonProps={{
          disabled: !parsedRows || !parsedRows.length || !importSelectedRowKeys.length
        }}
        confirmLoading={importLoading}
        destroyOnClose
        width={parsedRows && parsedRows.length ? 1080 : 560}>
        <Flex vertical gap={20} className={style.importModal}>
          <div className={style.importModalSection}>
            <Typography.Paragraph type="secondary" className={style.importModalHint}>
              {formatMessage({ id: 'ImportExcelHint' })}
            </Typography.Paragraph>
            <Button
              type="default"
              icon={<DownloadOutlined />}
              className={style.importModalDownload}
              onClick={() => {
                downloadOrgImportTemplate();
              }}>
              {formatMessage({ id: 'DownloadImportTemplate' })}
            </Button>
          </div>
          <div className={style.importModalSection}>
            <div className={style.importModalFieldLabel}>{formatMessage({ id: 'ImportAnchorLabel' })}</div>
            <ImportAnchorOrgSelect
              data={data}
              orgListApi={anchorOrgListApi}
              value={anchorOrgId}
              onChange={setAnchorOrgId}
              placeholder={formatMessage({ id: 'ImportAnchorPlaceholder' })}
            />
          </div>
          <div className={style.importModalSection}>
            <div className={style.importModalFieldLabel}>{formatMessage({ id: 'ImportUploadLabel' })}</div>
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
                onClick={() => {
                  setImportFile(null);
                  setParsedRows(null);
                  setImportSelectedRowKeys([]);
                  setUploadKey(k => k + 1);
                }}>
                {formatMessage({ id: 'ImportRechooseFile' })}
              </Button>
            ) : null}
          </div>
          {parsedRows !== null ? (
            <div className={style.importModalSection}>
              <Divider style={{ margin: '0 0 4px' }} />
              <div className={style.importModalFieldLabel}>{formatMessage({ id: 'ImportPreviewLabel' })}</div>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {formatMessage({ id: 'ImportPreviewCount' }, { count: parsedRows.length })}
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
                {formatMessage({ id: 'ImportSelectedCount' }, { selected: importSelectedRowKeys.length, total: parsedRows.length })}
              </Typography.Paragraph>
                <div className={style.importPreviewPanel}>
                  <Table
                    className={style.importPreviewTable}
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
                          <div className={style.importPreviewExpand}>
                            <Flex align="center" gap={12} className={style.importPreviewExpandHeader}>
                              <Flex align="center" gap={8} className={style.importPreviewExpandHeaderLabel}>
                                <UserOutlined className={style.importPreviewExpandIcon} />
                                <span>{formatMessage({ id: 'ImportNestedUsers' })}</span>
                              </Flex>
                              <Badge
                                count={record.users.length}
                                overflowCount={99}
                                color="var(--primary-color)"
                                className={style.importPreviewExpandBadge}
                              />
                            </Flex>
                            <Table
                              className={style.importPreviewNestedTable}
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
            </div>
          ) : null}
        </Flex>
      </Modal>
      <div className={style['org']}>
        {activeKey === 'tree' && <TreeOrg ids={ids} data={treeData} apis={apis} onSuccess={onSuccess} onViewUsers={onViewUsers} linkedSource={linkedSource} />}
        {activeKey === 'graph' && <GraphOrg ids={ids} data={treeData} apis={apis} onSuccess={onSuccess} onViewUsers={onViewUsers} linkedSource={linkedSource} />}
      </div>
    </Flex>
  );
});

export default withLocale(OrgInfo);
