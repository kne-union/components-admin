const getColumns = ({ formatMessage } = {}) => {
  const t = (id, fallback) => (formatMessage ? formatMessage({ id }) : fallback);

  return [
    {
      name: 'code',
      title: t('Code', '编码'),
      renderType: 'main',
      fixed: 'left'
    },
    {
      name: 'namespace',
      title: t('Namespace', '命名空间')
    },
    {
      name: 'locale',
      title: t('Locale', '语言')
    },
    {
      name: 'target',
      title: t('Target', '目标值')
    },
    {
      name: 'reviewStatus',
      title: t('ReviewStatus', '审核状态'),
      renderType: 'enum',
      moduleName: 'reviewStatus',
      getValueOf: item => item.reviewStatus
    },
    {
      name: 'status',
      title: t('Status', '状态'),
      renderType: 'enum',
      moduleName: 'openStatus',
      getValueOf: item => item.status
    }
  ];
};

export default getColumns;
