import { createWithRemoteLoader } from '@kne/remote-loader';
import { useFetch } from '@kne/react-fetch';
import { useCallback, useMemo, useRef, useState } from 'react';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import { useNavigate } from 'react-router-dom';
import withLocale from '../withLocale';
import Sidebar from './Sidebar';
import MailDetail from './MailDetail';
import getMailColumns, { getMailCardItem } from './getMailColumns';
import { createCardRenders } from '../CardList';
import { useOpenCompose } from './Compose';
import { useAccountList } from '../fields';
import { parseCurrentKey, toFilterObject } from '../utils';
import { usePageRender } from '../PageLayout';
import style from '../style.module.scss';

const Mailbox = createWithRemoteLoader({
  modules: [
    'components-core:Layout@TablePage',
    'components-core:TablePage',
    'components-core:Table',
    'components-core:Drawer',
    'components-core:FormInfo',
    'components-core:Global@usePreset'
  ]
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [LayoutTablePage, TablePage, Table, Drawer, FormInfo, usePreset] = remoteModules;
    const renderPage = usePageRender();
    const { apis, ajax } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    const openCompose = useOpenCompose({ FormInfo, usePreset });
    const navigate = useNavigate();
    const [accountId, setAccountId] = useState(null);
    const [current, setCurrent] = useState('inbox');
    const [detailId, setDetailId] = useState(null);
    const ref = useRef(null);
    const { list: accounts } = useAccountList(apis);
    const { data: stats, reload: reloadStats } = useFetch(Object.assign({}, apis.mailGateway.mail.stats, { params: { accountId } }));
    const { selectedRowKeys, selectedRows, setSelectedRowKeys, clearSelectedRows } = Table.useSelectedRow({ rowKey: 'id' });
    const dataRef = useRef([]);

    const { folder, labelId } = parseCurrentKey(current);
    const listKey = `${accountId || 'all'}-${current}`;
    const accountMap = useMemo(() => new Map(accounts.map(item => [String(item.id), item])), [accounts]);
    const getAccountAddress = id => accountMap.get(String(id))?.address;

    const reloadAll = useCallback(() => {
      ref.current?.reload?.();
      reloadStats();
    }, [reloadStats]);

    const runBatch = async (api, data) => {
      const { data: resData } = await ajax(Object.assign({}, api, { data }));
      if (resData.code !== 0) {
        return;
      }
      message.success(formatMessage({ id: 'OperationSuccess' }));
      clearSelectedRows();
      reloadAll();
    };

    const mailApis = apis.mailGateway.mail;
    const batchActions =
      folder === 'trash'
        ? [
            { key: 'restore', label: formatMessage({ id: 'Restore' }), onClick: ({ selectedRowKeys: ids }) => runBatch(mailApis.restore, { ids }) },
            {
              key: 'remove',
              label: formatMessage({ id: 'RemoveForever' }),
              danger: true,
              onClick: ({ selectedRowKeys: ids }) => runBatch(mailApis.remove, { ids })
            }
          ]
        : [
            {
              key: 'read',
              label: formatMessage({ id: 'MarkRead' }),
              onClick: ({ selectedRowKeys: ids }) => runBatch(mailApis.read, { ids, isRead: true })
            },
            {
              key: 'unread',
              label: formatMessage({ id: 'MarkUnread' }),
              onClick: ({ selectedRowKeys: ids }) => runBatch(mailApis.read, { ids, isRead: false })
            },
            {
              key: 'trash',
              label: formatMessage({ id: 'MoveToTrash' }),
              danger: true,
              onClick: ({ selectedRowKeys: ids }) => runBatch(mailApis.trash, { ids })
            }
          ];

    const baseFilter = { accountId: accountId || undefined, folder, labelId };
    const columnOptions = {
      formatMessage,
      folder,
      showAccount: !accountId,
      accountMap,
      onOpen: item => setDetailId(item.id),
      onStar: item => runBatch(mailApis.star, { ids: [item.id], isStarred: !item.isStarred }),
      onOpenAccount: account => navigate(`${baseUrl}/accounts?${new URLSearchParams({ id: account.id, accountName: account.name })}`)
    };

    const sidebar = (
      <Sidebar
        baseUrl={baseUrl}
        withAppMenu={!renderPage}
        accounts={accounts}
        accountId={accountId}
        onAccountChange={value => {
          clearSelectedRows();
          setAccountId(value);
          setCurrent('inbox');
        }}
        current={current}
        onCurrentChange={key => {
          if (key === 'labels') {
            return;
          }
          clearSelectedRows();
          setCurrent(key);
        }}
        stats={stats}
        onCompose={() => openCompose({ accountId: accountId || accounts.find(item => item.status === 'enabled')?.id, onSuccess: reloadAll })}
      />
    );

    const ListPage = renderPage ? TablePage : LayoutTablePage;
    const table = (
      <ListPage
        {...(renderPage ? {} : { isNext: true, page: Object.assign({ menu: sidebar }, pageProps) })}
        key={listKey}
          ref={ref}
          name={`mail-gateway-mailbox-${folder}`}
          {...Object.assign({}, mailApis.list, { params: { filter: baseFilter } })}
          search={{ name: 'keyword', label: formatMessage({ id: 'Keyword' }), placeholder: formatMessage({ id: 'MailSearchPlaceholder' }) }}
          filter={{
            list: [],
            mapFilterValue: value => ({ filter: Object.assign({}, baseFilter, toFilterObject(value)) })
          }}
          pagination={{ paramsType: 'params' }}
          dataFormat={data => {
            dataRef.current = data.pageData || [];
            return { list: dataRef.current, total: data.totalCount, data };
          }}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            allowSelectedAll: false,
            onChange: keys => setSelectedRowKeys(keys, dataRef.current || [])
          }}
          selectedRows={selectedRows}
          batchActions={batchActions}
          columns={getMailColumns(columnOptions)}
          {...createCardRenders(getMailCardItem(columnOptions))}
      />
    );

    return (
      <>
        {renderPage
          ? renderPage({
              title: formatMessage({ id: 'Mailbox' }),
              children: (
                <div className={style['mailbox-page']}>
                  <div className={style['mailbox-page-sidebar']}>{sidebar}</div>
                  <div className={style['mailbox-page-main']}>{table}</div>
                </div>
              )
            })
          : table}
        <Drawer
          open={!!detailId}
          width={820}
          title={formatMessage({ id: 'MailDetail' })}
          footer={null}
          onClose={() => {
            setDetailId(null);
            reloadAll();
          }}
        >
          {detailId && (
            <MailDetail
              id={detailId}
              accountAddress={getAccountAddress(dataRef.current.find(item => String(item.id) === String(detailId))?.accountId)}
              onChange={reloadAll}
              onClose={() => {
                setDetailId(null);
                reloadAll();
              }}
            />
          )}
        </Drawer>
      </>
    );
  })
);

export default Mailbox;
