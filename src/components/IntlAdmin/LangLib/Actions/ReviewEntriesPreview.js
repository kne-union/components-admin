import { createWithRemoteLoader } from '@kne/remote-loader';
import { useMemo, useState } from 'react';
import { Descriptions, Pagination, Typography } from 'antd';
import style from './reviewEntriesPreview.module.scss';

const { Text, Paragraph } = Typography;

const BATCH_PAGE_SIZE = 8;

const displayText = value => {
  if (value == null || value === '') {
    return '—';
  }
  return String(value);
};

const getBatchColumns = formatMessage => [
  {
    name: 'code',
    title: formatMessage({ id: 'Code' }),
    width: 140,
    renderType: 'main'
  },
  {
    name: 'namespace',
    title: formatMessage({ id: 'Namespace' }),
    width: 110
  },
  {
    name: 'locale',
    title: formatMessage({ id: 'Locale' }),
    width: 90
  },
  {
    name: 'sourceTarget',
    title: formatMessage({ id: 'ReviewSourceTarget' }),
    renderType: 'description'
  },
  {
    name: 'target',
    title: formatMessage({ id: 'ReviewTarget' }),
    renderType: 'description'
  }
];

/**
 * 审核弹窗中的词条对照信息：code / 默认语言文案 / 目标译文。
 * 单条用 Descriptions，批量用 components-core:TablePage@TableView。
 */
const ReviewEntriesPreview = createWithRemoteLoader({
  modules: ['components-core:TablePage@TableView']
})(({ remoteModules, entries = [], formatMessage }) => {
  const [TableView] = remoteModules;
  const [currentPage, setCurrentPage] = useState(1);
  const list = Array.isArray(entries) ? entries.filter(Boolean) : [];

  const pageData = useMemo(() => {
    if (list.length <= BATCH_PAGE_SIZE) {
      return list;
    }
    const start = (currentPage - 1) * BATCH_PAGE_SIZE;
    return list.slice(start, start + BATCH_PAGE_SIZE);
  }, [list, currentPage]);

  if (list.length === 0) {
    return null;
  }

  if (list.length === 1) {
    const item = list[0];
    return (
      <div className={style['preview']}>
        <div className={style['section-title']}>{formatMessage({ id: 'ReviewCompareTitle' })}</div>
        <Descriptions column={1} size="small" bordered className={style['desc']}>
          <Descriptions.Item label={formatMessage({ id: 'Code' })}>
            <Text code className={style['code']}>
              {displayText(item.code)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label={formatMessage({ id: 'Namespace' })}>{displayText(item.namespace)}</Descriptions.Item>
          <Descriptions.Item label={formatMessage({ id: 'Locale' })}>{displayText(item.locale)}</Descriptions.Item>
          <Descriptions.Item label={formatMessage({ id: 'ReviewSourceTarget' })}>
            <Paragraph
              className={style['value-text']}
              ellipsis={{ rows: 5, expandable: true, symbol: formatMessage({ id: 'ReviewExpand' }) }}
            >
              {displayText(item.sourceTarget)}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label={formatMessage({ id: 'ReviewTarget' })}>
            <Paragraph
              className={style['value-text']}
              ellipsis={{ rows: 5, expandable: true, symbol: formatMessage({ id: 'ReviewExpand' }) }}
            >
              {displayText(item.target)}
            </Paragraph>
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  }

  return (
    <div className={style['preview']}>
      <div className={style['section-title']}>
        {formatMessage({ id: 'ReviewBatchSelected' }, { count: list.length })}
      </div>
      <div className={style['batch-table-wrap']}>
        <TableView size="small" rowKey="id" dataSource={pageData} columns={getBatchColumns(formatMessage)} />
      </div>
      {list.length > BATCH_PAGE_SIZE ? (
        <div className={style['batch-pagination']}>
          <Pagination
            size="small"
            current={currentPage}
            pageSize={BATCH_PAGE_SIZE}
            total={list.length}
            showSizeChanger={false}
            showTotal={total => formatMessage({ id: 'ReviewBatchTotal' }, { count: total })}
            onChange={page => setCurrentPage(page)}
          />
        </div>
      ) : null}
    </div>
  );
});

export default ReviewEntriesPreview;
