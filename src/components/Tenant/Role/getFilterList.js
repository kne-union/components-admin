const getFilterList = ({ formatMessage, SuperSelectFilterItem }) => [
  [
    <SuperSelectFilterItem
      key="type"
      label={formatMessage({ id: 'SettingType' })}
      name="type"
      single
      options={[
        { label: formatMessage({ id: 'SystemType' }), value: 'system' },
        { label: formatMessage({ id: 'CustomType' }), value: 'custom' }
      ]}
    />
  ]
];

export default getFilterList;
