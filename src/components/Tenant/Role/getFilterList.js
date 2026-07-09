const getFilterList = ({ formatMessage, SuperSelectFilterItem }) => ({
  list: [
    {
      type: SuperSelectFilterItem,
      props: {
        label: formatMessage({ id: 'SettingType' }),
        name: 'type',
        single: true,
        options: [
          { label: formatMessage({ id: 'SystemType' }), value: 'system' },
          { label: formatMessage({ id: 'CustomType' }), value: 'custom' }
        ]
      }
    }
  ]
});

export default getFilterList;
