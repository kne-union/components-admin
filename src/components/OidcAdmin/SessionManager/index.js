import { createWithRemoteLoader } from '@kne/remote-loader';
import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Avatar, Button, Empty, Input, Space, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { useIsMobile } from '@kne/responsive-utils';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import Menu from '../Menu';
import style from './style.module.scss';

const { Text, Title } = Typography;
const PAGE_SIZE = 20;

const getUserName = user => user.nickname || user.name || user.email || user.phone || String(user.id);

const formatDateTime = value => (value ? new Date(value).toLocaleString() : '-');

const formatRelative = (value, locale) => {
  const diffSec = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale || 'zh-CN', { numeric: 'auto' });
  if (abs < 3600) {
    return rtf.format(Math.round(diffSec / 60), 'minute');
  }
  if (abs < 86400) {
    return rtf.format(Math.round(diffSec / 3600), 'hour');
  }
  return rtf.format(Math.round(diffSec / 86400), 'day');
};

const RevokeUserButton = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(({ remoteModules, userId, logout, confirmMessage, onSuccess, formatMessage, ...props }) => {
  const [ConfirmButton, usePreset] = remoteModules;
  const { ajax, apis } = usePreset();
  const { message } = App.useApp();
  return (
    <ConfirmButton
      {...props}
      message={confirmMessage}
      onClick={async () => {
        const { data: resData } = await ajax(Object.assign({}, apis.oidc.session.revokeUser, { data: { userId: String(userId), logout } }));
        message.success(formatMessage({ id: 'RevokeUserSuccess' }, { grants: resData.data?.grants ?? 0, sessions: resData.data?.sessions ?? 0 }));
        onSuccess && onSuccess();
      }}
    />
  );
});

const RevokeSessionButton = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, uid, onSuccess }) => {
    const [ConfirmButton, usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    return (
      <ConfirmButton
        danger
        size="small"
        message={formatMessage({ id: 'RevokeSessionConfirm' })}
        onClick={async () => {
          await ajax(Object.assign({}, apis.oidc.session.revoke, { data: { uid } }));
          message.success(formatMessage({ id: 'SessionRevoked' }));
          onSuccess && onSuccess();
        }}>
        {formatMessage({ id: 'RevokeSession' })}
      </ConfirmButton>
    );
  })
);

/**
 * 左栏：活跃用户数 + 搜索 + 滚动到底自动加载下一页
 * - 不搜索：活跃用户置顶，先分页加载完活跃用户，再接普通用户（按 id 去重）
 * - 搜索：先按关键字查用户，再判断这一页用户是否活跃并标记（页内活跃用户靠前），不扫描全部活跃用户
 */
const UserList = ({ ajax, api, activeApi, activeId, refreshKey, onSelect, onLoad, formatMessage }) => {
  const [keyword, setKeyword] = useState('');
  const [view, setView] = useState({ users: [], activeIds: new Set(), hasMore: false, loading: false });
  const [activeCount, setActiveCount] = useState(0);
  const dataRef = useRef(null);
  const loadingRef = useRef(false);
  const tokenRef = useRef(0);
  const listRef = useRef(null);

  // 顶部活跃用户数：不受搜索影响
  useEffect(() => {
    let cancelled = false;
    ajax(Object.assign({}, activeApi, { params: { currentPage: 1, perPage: 1 } }))
      .then(({ data: resData }) => {
        if (!cancelled) {
          setActiveCount(resData.data?.activeCount ?? resData.data?.totalCount ?? 0);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ajax, activeApi, refreshKey]);

  const loadNext = useCallback(
    async (searchText, reset) => {
      if (loadingRef.current && !reset) {
        return;
      }
      const token = ++tokenRef.current;
      loadingRef.current = true;
      if (reset || !dataRef.current) {
        dataRef.current = { active: { list: [], page: 0, total: 0 }, normal: { list: [], page: 0, total: 0 }, searchActiveIds: new Set() };
      }
      const data = dataRef.current;
      setView(prev => Object.assign({}, prev, { loading: true }));
      const phase = !searchText && (data.active.page === 0 || data.active.list.length < data.active.total) ? 'active' : 'normal';
      const target = data[phase];
      try {
        const { data: resData } = await ajax(
          Object.assign({}, phase === 'active' ? activeApi : api, {
            params: { currentPage: target.page + 1, perPage: PAGE_SIZE, filter: searchText ? { keyword: searchText } : {} }
          })
        );
        if (token !== tokenRef.current) {
          return;
        }
        let pageData = resData.data?.pageData || [];
        if (phase === 'normal' && searchText && pageData.length) {
          // 搜索结果：只判断这一页用户是否活跃
          const { data: activeRes } = await ajax(
            Object.assign({}, activeApi, { params: { userIds: pageData.map(user => user.id).join(','), currentPage: 1, perPage: pageData.length } })
          ).catch(() => ({ data: {} }));
          if (token !== tokenRef.current) {
            return;
          }
          (activeRes.data?.pageData || []).forEach(user => data.searchActiveIds.add(String(user.id)));
          pageData = pageData
            .filter(user => data.searchActiveIds.has(String(user.id)))
            .concat(pageData.filter(user => !data.searchActiveIds.has(String(user.id))));
        }
        onLoad && onLoad(pageData);
        data[phase] = { list: target.list.concat(pageData), page: target.page + 1, total: resData.data?.totalCount ?? pageData.length };
      } catch (e) {
        if (token !== tokenRef.current) {
          return;
        }
        // 活跃用户接口不可用时降级为普通用户列表；普通用户接口失败则停止继续加载
        data[phase] = { list: target.list, page: target.page + 1, total: target.list.length };
      }
      loadingRef.current = false;
      const activeIds = searchText ? data.searchActiveIds : new Set(data.active.list.map(user => String(user.id)));
      setView({
        users: data.active.list.concat(data.normal.list.filter(user => searchText || !activeIds.has(String(user.id)))),
        activeIds,
        hasMore: data.active.list.length < data.active.total || data.normal.page === 0 || data.normal.list.length < data.normal.total,
        loading: false
      });
    },
    [ajax, api, activeApi, onLoad]
  );

  // 关键字变化 / 结束会话后重新从第一页加载
  useEffect(() => {
    const timer = setTimeout(() => loadNext(keyword.trim(), true), 300);
    return () => clearTimeout(timer);
  }, [keyword, loadNext, refreshKey]);

  // 内容没撑满滚动容器时（如活跃用户很少）继续加载，否则无法触发滚动加载
  useEffect(() => {
    const el = listRef.current;
    if (view.hasMore && !view.loading && el && el.scrollHeight <= el.clientHeight) {
      loadNext(keyword.trim());
    }
  }, [view, keyword, loadNext]);

  const text = keyword.trim();
  const { users, activeIds } = view;

  return (
    <div className={style['user-panel']}>
      <div className={style['user-search']}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder={formatMessage({ id: 'SelectUserPlaceholder' })}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <div className={style['active-summary']}>
          <span className={style['active-dot']} />
          <span>{formatMessage({ id: 'ActiveUsersCount' })}</span>
          <span className={style['active-count']}>{activeCount}</span>
        </div>
      </div>
      <div
        ref={listRef}
        className={style['user-list']}
        onScroll={e => {
          const el = e.currentTarget;
          if (view.hasMore && !loadingRef.current && el.scrollHeight - el.scrollTop - el.clientHeight < 48) {
            loadNext(text);
          }
        }}>
        {users.map(user => {
          const isOnline = activeIds.has(String(user.id));
          return (
            <button
              type="button"
              key={user.id}
              className={classnames(style['user-item'], {
                [style['is-active']]: String(user.id) === String(activeId),
                [style['is-online']]: isOnline
              })}
              onClick={() => onSelect(user)}>
              <span className={style['avatar-wrap']}>
                <Avatar src={user.avatar} size={36}>
                  {getUserName(user).slice(0, 1)}
                </Avatar>
                {isOnline ? <span className={style['online-dot']} /> : null}
              </span>
              <span className={style['user-item-text']}>
                <span className={style['user-item-title']}>
                  <span className={style['user-item-name']}>{getUserName(user)}</span>
                  {isOnline ? (
                    <Tag color="success" bordered={false} className={style['online-tag']}>
                      {formatMessage({ id: 'ActiveUserTag' })}
                    </Tag>
                  ) : null}
                </span>
                <span className={style['user-item-sub']}>{user.email || user.phone || '-'}</span>
              </span>
            </button>
          );
        })}
        {view.loading ? (
          <div className={style['user-list-footer']}>
            <Spin size="small" />
          </div>
        ) : null}
        {!view.loading && !users.length ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'NoUserFound' })} /> : null}
      </div>
    </div>
  );
};

/** 右栏：用户信息 + 会话卡片 */
const UserSessions = ({ ajax, api, user, onBack, onChange, formatMessage, locale }) => {
  const [sessions, setSessions] = useState({ list: [], loading: true });

  const reload = useCallback(async () => {
    setSessions(prev => Object.assign({}, prev, { loading: true }));
    const { data: resData } = await ajax(Object.assign({}, api, { params: { userId: String(user.id) } }));
    setSessions({ list: resData.data || [], loading: false });
  }, [ajax, api, user.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  // 结束会话 / 撤销令牌后，会话列表与左栏活跃用户都要刷新
  const handleChange = useCallback(async () => {
    await reload();
    onChange && onChange();
  }, [reload, onChange]);

  return (
    <div className={style['detail']}>
      {onBack ? (
        <Button type="text" icon={<ArrowLeftOutlined />} className={style['back']} onClick={onBack}>
          {formatMessage({ id: 'BackToUsers' })}
        </Button>
      ) : null}

      <div className={style['profile']}>
        <Avatar src={user.avatar} size={56}>
          {getUserName(user).slice(0, 1)}
        </Avatar>
        <div className={style['profile-text']}>
          <Space size={8} wrap>
            <Title level={5} className={style['profile-name']}>
              {getUserName(user)}
            </Title>
            {user.isSuperAdmin ? <Tag color="gold">{formatMessage({ id: 'SuperAdmin' })}</Tag> : null}
          </Space>
          <Text type="secondary" className={style['profile-sub']}>
            {[user.email, user.phone].filter(Boolean).join(' · ') || '-'}
          </Text>
        </div>
        <Space size={8} wrap className={style['profile-actions']}>
          <RevokeUserButton
            userId={user.id}
            logout={false}
            formatMessage={formatMessage}
            confirmMessage={formatMessage({ id: 'RevokeTokensConfirm' })}
            onSuccess={handleChange}>
            {formatMessage({ id: 'RevokeTokens' })}
          </RevokeUserButton>
          <RevokeUserButton
            danger
            type="primary"
            userId={user.id}
            logout
            formatMessage={formatMessage}
            confirmMessage={formatMessage({ id: 'ForceLogoutConfirm' })}
            onSuccess={handleChange}>
            {formatMessage({ id: 'ForceLogout' })}
          </RevokeUserButton>
        </Space>
      </div>

      <div className={style['section-head']}>
        <span className={style['section-title']}>{formatMessage({ id: 'ActiveSessions' })}</span>
        <span className={style['section-count']}>{sessions.list.length}</span>
      </div>

      {sessions.loading ? (
        <div className={style['detail-loading']}>
          <Spin />
        </div>
      ) : sessions.list.length ? (
        <div className={style['session-list']}>
          {sessions.list.map(session => (
            <div key={session.uid} className={style['session-card']}>
              <div className={style['session-card-head']}>
                <div className={style['session-clients']}>
                  {(session.clients || []).map(client => (
                    <Tag key={`${client.clientId}-${client.sid}`} color="blue">
                      {client.clientId}
                    </Tag>
                  ))}
                </div>
                <RevokeSessionButton uid={session.uid} onSuccess={handleChange} />
              </div>
              <div className={style['session-meta']}>
                <div className={style['meta-item']}>
                  <span className={style['meta-label']}>{formatMessage({ id: 'LoginAt' })}</span>
                  <span className={style['meta-value']}>{formatDateTime(session.loginAt)}</span>
                  <span className={style['meta-sub']}>{formatRelative(session.loginAt, locale)}</span>
                </div>
                <div className={style['meta-item']}>
                  <span className={style['meta-label']}>{formatMessage({ id: 'ExpiresAt' })}</span>
                  <span className={style['meta-value']}>{formatDateTime(session.expiresAt)}</span>
                  <span className={style['meta-sub']}>{formatRelative(session.expiresAt, locale)}</span>
                </div>
              </div>
              <Text className={style['session-uid']} copyable={{ text: session.uid }}>
                {formatMessage({ id: 'SessionUid' })}：{session.uid}
              </Text>
            </div>
          ))}
        </div>
      ) : (
        <div className={style['detail-empty']}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'NoActiveSession' })} />
        </div>
      )}
    </div>
  );
};

const SessionManager = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Layout@Page']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {}, defaultUserId }) => {
    const [usePreset, Page] = remoteModules;
    const { ajax, apis } = usePreset();
    const { formatMessage, locale } = useIntl();
    const isMobile = useIsMobile();
    const [user, setUser] = useState(() => (defaultUserId ? { id: defaultUserId, nickname: String(defaultUserId), placeholder: true } : null));
    const [refreshKey, setRefreshKey] = useState(0);
    const handleSessionsChange = useCallback(() => setRefreshKey(key => key + 1), []);
    const handleListLoad = useCallback(list => {
      setUser(prev => (prev?.placeholder ? list.find(item => String(item.id) === String(prev.id)) || prev : prev));
    }, []);

    const listNode = (
      <UserList
        ajax={ajax}
        api={apis.admin.getUserList}
        activeApi={apis.oidc.session.activeUsers}
        activeId={user?.id}
        refreshKey={refreshKey}
        onSelect={setUser}
        onLoad={handleListLoad}
        formatMessage={formatMessage}
      />
    );
    const detailNode = user ? (
      <UserSessions
        key={user.id}
        ajax={ajax}
        api={apis.oidc.session.list}
        user={user}
        onBack={isMobile ? () => setUser(null) : null}
        onChange={handleSessionsChange}
        formatMessage={formatMessage}
        locale={locale}
      />
    ) : (
      <div className={style['detail-placeholder']}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'SelectUserFirst' })} />
      </div>
    );

    return (
      <Page {...pageProps} title={formatMessage({ id: 'SessionManager' })} menu={pageProps.menu || <Menu baseUrl={baseUrl} />}>
        {isMobile ? (
          <div className={style['mobile']}>{user ? detailNode : listNode}</div>
        ) : (
          <div className={style['split']}>
            <aside className={style['split-left']}>{listNode}</aside>
            <section className={style['split-right']}>{detailNode}</section>
          </div>
        )}
      </Page>
    );
  })
);

export default SessionManager;
