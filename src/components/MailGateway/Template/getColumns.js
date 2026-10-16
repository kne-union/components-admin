import { Typography } from 'antd';

const getColumns = ({ formatMessage, onPreview }) => [
  {
    name: 'name',
    title: formatMessage({ id: 'TemplateName' }),
    renderType: 'main',
    // 点击模版名称打开预览（与操作列「预览」一致）
    render: (value, { dataSource }) =>
      typeof onPreview === 'function' ? (
        <Typography.Link
          onClick={e => {
            e.stopPropagation();
            onPreview(dataSource);
          }}
        >
          {value}
        </Typography.Link>
      ) : (
        value
      )
  },
  {
    name: 'category',
    title: formatMessage({ id: 'TemplateCategory' }),
    width: 140,
    getValueOf: item => item.category?.name || formatMessage({ id: 'Uncategorized' })
  },
  {
    name: 'level',
    title: formatMessage({ id: 'TemplateLevel' }),
    width: 100,
    renderType: 'enum',
    moduleName: 'mailTemplateLevel'
  },
  {
    name: 'subject',
    title: formatMessage({ id: 'Subject' }),
    renderType: 'description',
    width: 260
  },
  {
    name: 'description',
    title: formatMessage({ id: 'Description' }),
    renderType: 'description',
    width: 240
  },
  {
    name: 'status',
    title: formatMessage({ id: 'Status' }),
    width: 100,
    renderType: 'enum',
    moduleName: 'mailTemplateStatus'
  },
  {
    name: 'updatedAt',
    title: formatMessage({ id: 'UpdatedAt' }),
    format: 'datetime',
    width: 180
  }
];

export default getColumns;
