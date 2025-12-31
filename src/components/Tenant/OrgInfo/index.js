import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Tree, App, Card, Button, Space } from 'antd';
import { useEffect, useMemo, useState, useRef } from 'react';
import OrgChart from '@kne/react-org-chart';
import merge from 'lodash/merge';
import { PlusCircleOutlined, MinusCircleOutlined, ExpandOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import FormInner from './FormInner';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import style from './style.module.scss';
import '@kne/react-org-chart/dist/index.css';

const OrgOptions = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:ButtonGroup', 'components-core:Icon', 'components-core:FormInfo@useFormModal']
})(({ remoteModules, showLength = 3, data, apis, onSuccess }) => {
  const [usePreset, ButtonGroup, Icon, useFormModal] = remoteModules;
  const { ajax } = usePreset();
  const formModal = useFormModal();
  const { formatMessage } = useIntl();
  const { message } = App.useApp();
  return (
    <ButtonGroup
      itemClassName="btn-no-padding"
      moreType="link"
      list={[
        {
          icon: <Icon type="tianjia" />,
          type: 'link',
          children: formatMessage({ id: 'AddSubOrg' }),
          hidden: !apis.create,
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
              children: <FormInner />
            });
          }
        },
        {
          icon: <Icon type="bianji" />,
          type: 'link',
          children: formatMessage({ id: 'Edit' }),
          hidden: !(data.id && data.id !== 'root') || !apis.save,
          onClick: async () => {
            formModal({
              title: formatMessage({ id: 'EditOrgNode' }),
              size: 'small',
              formProps: {
                data: Object.assign({}, data),
                onSubmit: async formData => {
                  const { data: resData } = await ajax(
                    merge({}, apis.save, {
                      data: Object.assign({}, formData, {
                        parentId: data.parentId,
                        id: data.id
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
              children: <FormInner />
            });
          }
        },
        {
          icon: <Icon type="shanchu" />,
          type: 'link',
          children: formatMessage({ id: 'Delete' }),
          hidden: !(data.id && data.id !== 'root') || !apis.remove,
          confirm: true,
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
})(({ remoteModules, data, apis, onSuccess }) => {
  const ref = useRef(null);
  const [expandIds, setExpandIds] = useState([]);
  const [scale, setScale] = useState(1);
  const renderNode = data => {
    return data.map(node => {
      const card = (
        <Card
          type="inner"
          hoverable
          size="small"
          className={style['org-card']}
          extra={<OrgOptions data={node} apis={apis} onSuccess={onSuccess} showLength={0} />}>
          <div className={style['tree-node-title']}>{node.name}</div>
          {node.description && <div className={style['tree-node-description']}>{node.description}</div>}
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
    <div className={style['org-chart-outer']} ref={ref}>
      <ControlPanel value={scale} onChange={setScale} />
      <div className={style['org-chart-inner']}>
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

const TreeOrg = ({ data, ids, apis, onSuccess }) => {
  const [expandedKeys, setExpandedKeys] = useState(['root']);
  useEffect(() => {
    ids && ids.length > 0 && setExpandedKeys(['root', ...ids]);
  }, [ids]);
  return (
    <Tree
      showLine
      showIcon
      selectable={false}
      expandedKeys={expandedKeys}
      fieldNames={{ title: 'name', key: 'id', children: 'children' }}
      treeData={data}
      onExpand={expandedKeys => {
        setExpandedKeys(expandedKeys);
      }}
      titleRender={nodeData => {
        return (
          <Flex vertical className={style['tree-node']}>
            <Flex gap={36}>
              <span className={style['tree-node-title']}>{nodeData.name}</span>
              <span className={style['tree-node-options']}>
                <OrgOptions data={nodeData} apis={apis} onSuccess={onSuccess} />
              </span>
            </Flex>
            <div className={style['tree-node-description']}>{nodeData.description}</div>
          </Flex>
        );
      }}
    />
  );
};

const OrgInfo = createWithRemoteLoader({
  modules: ['components-core:StateBar']
})(({ remoteModules, data, companyName, apis, onSuccess }) => {
  const [StateBar] = remoteModules;
  const [activeKey, setActiveKey] = useState('tree');
  const { formatMessage } = useIntl();
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

    return {
      treeData: parseTree(output),
      ids: data.map(item => item.id)
    };
  }, [data, companyName, formatMessage]);
  return (
    <Flex vertical>
      <StateBar
        activeKey={activeKey}
        onChange={setActiveKey}
        type="radio"
        stateOption={[
          { tab: formatMessage({ id: 'Tree' }), key: 'tree' },
          { tab: formatMessage({ id: 'Graph' }), key: 'graph' }
        ]}
      />
      <div className={style['org']}>
        {activeKey === 'tree' && <TreeOrg ids={ids} data={treeData} apis={apis} onSuccess={onSuccess} />}
        {activeKey === 'graph' && <GraphOrg ids={ids} data={treeData} apis={apis} onSuccess={onSuccess} />}
      </div>
    </Flex>
  );
});

export default withLocale(OrgInfo);
