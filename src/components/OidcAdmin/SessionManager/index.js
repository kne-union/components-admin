import { createWithRemoteLoader } from '@kne/remote-loader';
import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Avatar, Button, Empty, Input, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { useIsMobile } from '@kne/responsive-utils';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import Menu from '../Menu';
import style from './style.module.scss';

const { Text } = Typography;
const PAGE_SIZE = 20;

const getUserName = user => user.nickname || user.name || user.email || user.phone || String(user.id);

const formatDateTime = (value, locale) => {
  if (!value) {
    return '-';
  }
  return new Intl.DateTimeFormat(locale || 'zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(value));
};

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
        }}
      >
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
  // 活跃用户总在前面（不搜索时分页置顶，搜索时页内靠前），据此切成两组
  const onlineCount = users.findIndex(user => !activeIds.has(String(user.id)));
  const splitAt = onlineCount === -1 ? users.length : onlineCount;
  const onlineUsers = users.slice(0, splitAt);
  const otherUsers = users.slice(splitAt);

  const renderUser = (user, isOnline) => {
    const selected = String(user.id) === String(activeId);
    return (
      <button
        type="button"
        key={user.id}
        aria-pressed={selected}
        className={classnames(style['user-item'], { [style['is-active']]: selected })}
        onClick={() => onSelect(user)}
      >
        <span className={style['avatar-wrap']}>
          <Avatar src={user.avatar} size={32}>
            {getUserName(user).slice(0, 1)}
          </Avatar>
          {isOnline ? <span className={style['online-dot']} title={formatMessage({ id: 'ActiveUserTag' })} /> : null}
        </span>
        <span className={style['user-item-text']}>
          <span className={style['user-item-name']}>{getUserName(user)}</span>
          <span className={style['user-item-sub']}>{user.email || user.phone || '-'}</span>
        </span>
      </button>
    );
  };

  return (
    <div className={style['user-panel']}>
      <div className={style['user-search']}>
        <Input
          allowClear
          prefix={<SearchOutlined className={style['search-icon']} />}
          placeholder={formatMessage({ id: 'SelectUserPlaceholder' })}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
      </div>
      <div
        ref={listRef}
        className={style['user-list']}
        onScroll={e => {
          const el = e.currentTarget;
          if (view.hasMore && !loadingRef.current && el.scrollHeight - el.scrollTop - el.clientHeight < 48) {
            loadNext(text);
          }
        }}
      >
        {onlineUsers.length ? (
          <div className={style['group']}>
            <div className={style['group-head']}>
              <span className={style['active-dot']} />
              <span>{formatMessage({ id: 'ActiveUsersCount' })}</span>
              <span className={style['group-count']}>{text ? onlineUsers.length : activeCount || onlineUsers.length}</span>
            </div>
            {onlineUsers.map(user => renderUser(user, true))}
          </div>
        ) : null}
        {otherUsers.length ? (
          <div className={style['group']}>
            {onlineUsers.length ? (
              <div className={style['group-head']}>
                <span>{formatMessage({ id: 'OtherUsers' })}</span>
              </div>
            ) : null}
            {otherUsers.map(user => renderUser(user, false))}
          </div>
        ) : null}
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

  const contact = [user.email, user.phone].filter(Boolean).join(' · ') || '-';

  return (
    <div className={style['detail']}>
      {onBack ? (
        <Button type="text" size="small" icon={<ArrowLeftOutlined />} className={style['back']} onClick={onBack}>
          {formatMessage({ id: 'BackToUsers' })}
        </Button>
      ) : null}

      <div className={style['profile']}>
        <Avatar src={user.avatar} size={36}>
          {getUserName(user).slice(0, 1)}
        </Avatar>
        <div className={style['profile-text']}>
          <div className={style['profile-title']}>
            <span className={style['profile-name']}>{getUserName(user)}</span>
            {user.isSuperAdmin ? (
              <Tag color="gold" bordered={false} className={style['profile-badge']}>
                {formatMessage({ id: 'SuperAdmin' })}
              </Tag>
            ) : null}
          </div>
          <Text type="secondary" className={style['profile-sub']} title={contact}>
            {contact}
          </Text>
        </div>
        <div className={style['profile-actions']}>
          <RevokeUserButton
            size="small"
            userId={user.id}
            logout={false}
            formatMessage={formatMessage}
            confirmMessage={formatMessage({ id: 'RevokeTokensConfirm' })}
            onSuccess={handleChange}
          >
            {formatMessage({ id: 'RevokeTokens' })}
          </RevokeUserButton>
          <RevokeUserButton
            size="small"
            danger
            type="primary"
            userId={user.id}
            logout
            formatMessage={formatMessage}
            confirmMessage={formatMessage({ id: 'ForceLogoutConfirm' })}
            onSuccess={handleChange}
          >
            {formatMessage({ id: 'ForceLogout' })}
          </RevokeUserButton>
        </div>
      </div>

      <div className={style['section-head']}>
        <span className={style['section-title']}>{formatMessage({ id: 'ActiveSessions' })}</span>
        <span className={style['section-count']}>{sessions.loading ? '…' : sessions.list.length}</span>
      </div>

      {sessions.loading ? (
        <div className={style['detail-loading']}>
          <Spin size="small" />
        </div>
      ) : sessions.list.length ? (
        <div className={style['session-list']}>
          {sessions.list.map(session => (
            <div key={session.uid} className={style['session-row']}>
              <div className={style['session-row-main']}>
                <div className={style['session-clients']}>
                  {(session.clients || []).length ? (
                    (session.clients || []).map(client => (
                      <Tag key={`${client.clientId}-${client.sid}`} className={style['client-tag']}>
                        {client.clientId}
                      </Tag>
                    ))
                  ) : (
                    <span className={style['session-clients-empty']}>-</span>
                  )}
                </div>
                <RevokeSessionButton uid={session.uid} onSuccess={handleChange} />
              </div>
              <div className={style['session-meta']}>
                <span className={style['meta-chunk']}>
                  <span className={style['meta-label']}>{formatMessage({ id: 'LoginAt' })}</span>
                  <span className={style['meta-value']} title={formatDateTime(session.loginAt, locale)}>
                    {formatRelative(session.loginAt, locale)}
                  </span>
                </span>
                <span className={style['meta-sep']} aria-hidden>
                  ·
                </span>
                <span className={style['meta-chunk']}>
                  <span className={style['meta-label']}>{formatMessage({ id: 'ExpiresAt' })}</span>
                  <span className={style['meta-value']} title={formatDateTime(session.expiresAt, locale)}>
                    {formatRelative(session.expiresAt, locale)}
                  </span>
                </span>
                <span className={style['meta-sep']} aria-hidden>
                  ·
                </span>
                <span className={classnames(style['meta-chunk'], style['session-uid-chunk'])}>
                  <span className={style['meta-label']}>{formatMessage({ id: 'SessionUid' })}</span>
                  <Text className={style['session-uid']} ellipsis={{ tooltip: session.uid }} copyable={{ text: session.uid }}>
                    {session.uid}
                  </Text>
                </span>
              </div>
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
    // 只在首次有数据时自动选中；手机点「用户列表」清空后不再抢回选中
    const didInitSelectRef = useRef(false);
    const handleSessionsChange = useCallback(() => setRefreshKey(key => key + 1), []);
    const handleListLoad = useCallback(list => {
      if (!Array.isArray(list) || !list.length) {
        return;
      }
      setUser(prev => {
        if (prev?.placeholder) {
          const matched = list.find(item => String(item.id) === String(prev.id));
          if (matched) {
            didInitSelectRef.current = true;
            return matched;
          }
        }
        if (prev && !prev.placeholder) {
          return prev;
        }
        if (didInitSelectRef.current) {
          return prev;
        }
        didInitSelectRef.current = true;
        return list[0];
      });
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
