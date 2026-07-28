const getColumns = ({ formatMessage } = {}) => {
  const t = (id, fallback) => (formatMessage ? formatMessage({ id }) : fallback);

  return [
    {
      name: 'id',
      title: 'ID',
      renderType: 'id'
    },
    {
      name: 'name',
      title: t('LangTypeName', '名称'),
      renderType: 'main'
    },
    {
      name: 'code',
      title: t('Code', '编码')
    },
    {
      name: 'isDefault',
      title: t('DefaultLanguage', '默认语言'),
      renderType: 'tag',
      getValueOf: item =>
        item.isDefault
          ? { type: 'success', text: t('DefaultYes', '默认') }
          : { type: 'default', text: t('DefaultNo', '-') }
    },
    {
      name: 'entryCount',
      title: t('EntryCount', '词条数'),
      getValueOf: item => `${item.entryCount ?? 0}/${item.defaultEntryCount ?? 0}`
    },
    {
      name: 'params',
      title: t('Params', '翻译参数')
    },
    {
      name: 'description',
      title: t('Description', '描述'),
      renderType: 'description',
      ellipsis: true
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
