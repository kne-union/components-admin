import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Tree, App, Card, Button } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import OrgChart from '@kne/react-org-chart';
import merge from 'lodash/merge';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import FormInner from './FormInner';
import style from './style.module.scss';
import '@kne/react-org-chart/dist/index.css';

const OrgOptions = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:ButtonGroup', 'components-core:Icon', 'components-core:FormInfo@useFormModal']
})(({ remoteModules, showLength = 3, data, apis, onSuccess }) => {
  const [usePreset, ButtonGroup, Icon, useFormModal] = remoteModules;
  const { ajax } = usePreset();
  const formModal = useFormModal();
  const { message } = App.useApp();
  return (
    <ButtonGroup
      itemClassName="btn-no-padding"
      moreType="link"
      list={[
        {
          icon: <Icon type="tianjia" />,
          type: 'link',
          children: '新增子级组织',
          onClick: async () => {
            formModal({
              title: '新增子级组织',
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
                  message.success('添加成功');
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
          children: '编辑',
          hidden: !(data.id && data.id !== 'root'),
          onClick: async () => {
            formModal({
              title: '编辑组织节点',
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
                  message.success('保存成功');
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
          children: '删除',
          hidden: !(data.id && data.id !== 'root'),
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
            message.success('删除成功');
            onSuccess && onSuccess();
          }
        }
      ]}
    />
  );
});

const GraphOrg = createWithRemoteLoader({
  modules: ['components-core:Common@SimpleBar']
})(({ remoteModules, data, apis, onSuccess }) => {
  const [SimpleBar] = remoteModules;
  const [expandIds, setExpandIds] = useState([]);
  const renderNode = data => {
    return data.map(node => {
      const card = (
        <Card type="inner" hoverable size="small" className={style['org-card']} extra={<OrgOptions data={node} apis={apis} onSuccess={onSuccess} showLength={0} />}>
          <div className={style['tree-node-title']}>{node.name}</div>
          <div className={style['tree-node-description']}>{node.description}</div>
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
    <SimpleBar className={style['org-chart-outer']} autoHide={false}>
      {renderNode(data)}
    </SimpleBar>
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
  const { treeData, ids } = useMemo(() => {
    const output = [
      {
        id: 'root',
        name: companyName || '未命名公司'
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
  }, [data, companyName]);
  return (
    <Flex vertical>
      <StateBar
        activeKey={activeKey}
        onChange={setActiveKey}
        type="radio"
        stateOption={[
          { tab: '树形', key: 'tree' },
          { tab: '图形', key: 'graph' }
        ]}
      />
      <div className={style['org']}>
        {activeKey === 'tree' && <TreeOrg ids={ids} data={treeData} apis={apis} onSuccess={onSuccess} />}
        {activeKey === 'graph' && <GraphOrg ids={ids} data={treeData} apis={apis} onSuccess={onSuccess} />}
      </div>
    </Flex>
  );
});

export default OrgInfo;
