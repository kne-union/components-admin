import enums from '../enums';

const getFilterList = ({ formatMessage, SuperSelectFilterItem, langTypeListApi }) => ({
  list: [
    {
      type: SuperSelectFilterItem,
      props: {
        label: formatMessage({ id: 'Locale' }),
        name: 'locale',
        single: true,
        api: Object.assign({}, langTypeListApi, {
          transformData: data => ({
            pageData: (data.pageData || []).map(item => ({
              value: item.code,
              label: item.name
            }))
          })
        })
      }
    },
    {
      type: SuperSelectFilterItem,
      props: {
        label: formatMessage({ id: 'ReviewStatus' }),
        name: 'reviewStatus',
        single: true,
        options: (enums.reviewStatus || []).map(item => ({
          label: item.description,
          value: item.value
        }))
      }
    },
    {
      type: SuperSelectFilterItem,
      props: {
        label: formatMessage({ id: 'Status' }),
        name: 'status',
        single: true,
        options: [
          { label: formatMessage({ id: 'StatusOpen' }), value: 'open' },
          { label: formatMessage({ id: 'StatusClose' }), value: 'closed' }
        ]
      }
    }
  ]
});

export default getFilterList;
