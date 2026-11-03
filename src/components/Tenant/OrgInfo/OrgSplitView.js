import { createWithRemoteLoader } from '@kne/remote-loader';
import { Tree, Input, Empty, Button, Typography } from 'antd';
import { ApartmentOutlined, BankOutlined, DownOutlined, LeftOutlined, RightOutlined, SearchOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { useIntl } from '@kne/react-intl';
import OrgOptions from './OrgOptions';
import OrgSourceTag from './OrgSourceTag';
import withLocale from '../withLocale';
import { getSourceIcon } from '../constants';
import style from './style.module.scss';

const buildNodeMap = nodes => {
  const map = new Map();
  const walk = (list, path) => {
    (list || []).forEach(node => {
      map.set(node.id, { node, path });
      walk(node.children, path.concat(node));
    });
  };
  walk(nodes, []);
  return map;
};

const filterTree = (nodes, keyword) =>
  (nodes || []).reduce((acc, node) => {
    const children = filterTree(node.children, keyword);
    if (String(node.name || '').toLowerCase().includes(keyword) || children.length) {
      acc.push(Object.assign({}, node, { children }));
    }
    return acc;
  }, []);

const collectIds = nodes => (nodes || []).flatMap(node => [node.id, ...collectIds(node.children)]);

const Highlight = ({ text, keyword }) => {
  const value = String(text || '');
  const index = keyword ? value.toLowerCase().indexOf(keyword) : -1;
  if (index < 0) {
    return value;
  }
  return (
    <>
      {value.slice(0, index)}
      <mark className={style['split-tree-mark']}>{value.slice(index, index + keyword.length)}</mark>
      {value.slice(index + keyword.length)}
    </>
  );
};

const OrgIcon = ({ root, size = 'default' }) => (
  <span className={classnames(style['org-icon'], style[`org-icon-${size}`], { [style['org-icon-root']]: root })} aria-hidden>
    {root ? <BankOutlined /> : <ApartmentOutlined />}
  </span>
);

const LeaderValue = createWithRemoteLoader({
  modules: ['components-core:Image']
})(({ remoteModules, leader, emptyText }) => {
  const [Image] = remoteModules;
  if (!leader?.name) {
    return <span className={style['detail-stat-empty']}>{emptyText}</span>;
  }
  return (
    <span className={style['detail-leader']}>
      <Image.Avatar size={22} id={leader.avatar} className={style['detail-leader-avatar']}>
        {!leader.avatar ? String(leader.name).trim().charAt(0) : null}
      </Image.Avatar>
      <span className={style['detail-leader-name']} title={leader.name}>
        {leader.name}
      </span>
    </span>
  );
});

const OrgDetail = withLocale(({ entry, apis, onSuccess, onViewUsers, onSelect, onBack }) => {
  const { formatMessage } = useIntl();
  const { node, path } = entry;
  const isRoot = node.id === 'root';
  const children = node.children || [];
  const stats = [
    { key: 'members', icon: <TeamOutlined />, label: formatMessage({ id: 'OrgMemberLabel' }), value: Number(node.userCount) || 0 },
    { key: 'children', icon: <ApartmentOutlined />, label: formatMessage({ id: 'OrgChildrenLabel' }), value: children.length },
    !isRoot && {
      key: 'leader',
      icon: <UserOutlined />,
      label: formatMessage({ id: 'OrgLeader' }),
      value: <LeaderValue leader={node.leader} emptyText={formatMessage({ id: 'OrgLeaderEmpty' })} />
    }
  ].filter(Boolean);

  return (
    <div className={style['detail']}>
      {onBack && (
        <Button type="link" size="small" icon={<LeftOutlined />} className={style['detail-back']} onClick={onBack}>
          {formatMessage({ id: 'OrgBackToList' })}
        </Button>
      )}
      {path.length > 0 && (
        <div className={style['detail-path']}>
          {path.map(item => (
            <span key={item.id} className={style['detail-path-item']}>
              <button type="button" className={style['detail-path-link']} onClick={() => onSelect(item.id)}>
                {item.name}
              </button>
              <RightOutlined className={style['detail-path-sep']} />
            </span>
          ))}
          <span className={style['detail-path-current']}>{node.name}</span>
        </div>
      )}
      <div className={style['detail-head']}>
        <OrgIcon root={isRoot} size="large" />
        <div className={style['detail-head-main']}>
          <div className={style['detail-title']}>
            <span className={style['detail-name']}>{node.name}</span>
            <OrgSourceTag source={node.syncSource} />
          </div>
          {!isRoot && (
            <Typography.Paragraph type="secondary" className={style['detail-desc']} ellipsis={{ rows: 2, tooltip: node.description }}>
              {node.description || formatMessage({ id: 'OrgDescEmpty' })}
            </Typography.Paragraph>
          )}
        </div>
      </div>
      <div className={style['detail-actions']}>
        <OrgOptions variant="button" showLength={4} data={node} apis={apis} onSuccess={onSuccess} onViewUsers={onViewUsers} />
      </div>
      <div className={style['detail-stats']}>
        {stats.map(item => (
          <div key={item.key} className={style['detail-stat']}>
            <div className={style['detail-stat-label']}>
              {item.icon}
              {item.label}
            </div>
            <div className={style['detail-stat-value']}>{item.value}</div>
          </div>
        ))}
      </div>
      <div className={style['detail-section-title']}>
        {formatMessage({ id: 'OrgChildrenLabel' })}
        <span className={style['detail-section-count']}>{children.length}</span>
      </div>
      {children.length ? (
        <div className={style['detail-children']}>
          {children.map(child => (
            <div key={child.id} className={style['child-card']} onClick={() => onSelect(child.id)}>
              <OrgIcon size="small" />
              <div className={style['child-card-main']}>
                <div className={style['child-card-name']}>{child.name}</div>
                <div className={style['child-card-meta']}>
                  {formatMessage({ id: 'OrgUserCount' }, { count: Number(child.userCount) || 0 })}
                  {child.children?.length ? ` · ${formatMessage({ id: 'OrgChildCount' }, { count: child.children.length })}` : ''}
                  {child.leader?.name ? ` · ${child.leader.name}` : ''}
                </div>
              </div>
              <RightOutlined className={style['child-card-arrow']} />
            </div>
          ))}
        </div>
      ) : (
        <div className={style['detail-children-empty']}>{formatMessage({ id: 'OrgChildrenEmpty' })}</div>
      )}
    </div>
  );
});

const OrgSplitView = ({ data, apis, onSuccess, onViewUsers, isMobile, defaultExpandedKeys }) => {
  const { formatMessage } = useIntl();
  const [keyword, setKeyword] = useState('');
  const [selectedId, setSelectedId] = useState('root');
  const [expandedKeys, setExpandedKeys] = useState(defaultExpandedKeys);
  const [mobileDetail, setMobileDetail] = useState(false);

  useEffect(() => {
    setExpandedKeys(defaultExpandedKeys);
  }, [defaultExpandedKeys]);

  const nodeMap = useMemo(() => buildNodeMap(data), [data]);
  const searchKey = keyword.trim().toLowerCase();
  const filteredData = useMemo(() => (searchKey ? filterTree(data, searchKey) : data), [data, searchKey]);
  const entry = nodeMap.get(selectedId) || nodeMap.get('root');

  const select = id => {
    setSelectedId(id);
    const target = nodeMap.get(id);
    if (target) {
      setExpandedKeys(keys => Array.from(new Set([...keys, ...target.path.map(item => item.id)])));
    }
    if (isMobile) {
      setMobileDetail(true);
    }
  };

  const treePanel = (
    <div className={style['split-tree']}>
      <div className={style['split-tree-search']}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder={formatMessage({ id: 'OrgSearchPlaceholder' })}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
      </div>
      <div className={style['split-tree-body']}>
        {filteredData.length ? (
          <Tree
            blockNode
            switcherIcon={<DownOutlined />}
            treeData={filteredData}
            fieldNames={{ title: 'name', key: 'id', children: 'children' }}
            expandedKeys={searchKey ? collectIds(filteredData) : expandedKeys}
            onExpand={keys => setExpandedKeys(keys)}
            selectedKeys={entry ? [entry.node.id] : []}
            onSelect={(_, { node }) => select(node.id)}
            className={style['split-tree-tree']}
            titleRender={node => (
              <span className={style['split-tree-node']}>
                <span className={style['split-tree-name']}>
                  <Highlight text={node.name} keyword={searchKey} />
                </span>
                {node.syncSource ? <span className={style['split-tree-source']}>{getSourceIcon(node.syncSource)}</span> : null}
                {node.userCount != null ? <span className={style['split-tree-count']}>{Number(node.userCount) || 0}</span> : null}
              </span>
            )}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'OrgSearchEmpty' })} />
        )}
      </div>
    </div>
  );

  const detailPanel = entry ? (
    <OrgDetail
      entry={entry}
      apis={apis}
      onSuccess={onSuccess}
      onViewUsers={onViewUsers}
      onSelect={select}
      onBack={isMobile ? () => setMobileDetail(false) : null}
    />
  ) : null;

  if (isMobile) {
    return <div className={style['split']}>{mobileDetail ? detailPanel : treePanel}</div>;
  }

  return (
    <div className={style['split']}>
      {treePanel}
      <div className={style['split-detail']}>{detailPanel}</div>
    </div>
  );
};

export default withLocale(OrgSplitView);

export { OrgIcon, LeaderValue };
