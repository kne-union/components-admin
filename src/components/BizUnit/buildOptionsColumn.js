import Actions from './Actions';

const buildOptionsColumn = ({ formatMessage, apis, options, getActionList, getFormInner, onReload }) => {
  const actionsProps = {
    moreType: 'link',
    itemClassName: 'btn-no-padding',
    showLength: options.showLength ?? 0,
    apis,
    options,
    getActionList,
    getFormInner,
    onSuccess: onReload
  };

  return Object.assign(
    {
      name: 'options',
      title: formatMessage({ id: 'Action' }),
      renderType: 'options',
      fixed: 'right',
      width: 48,
      min: 40,
      max: 160,
      getValueOf: (item, ctx) => {
        const { context, place, className } = ctx || {};
        return {
          children: (
            <Actions
              {...actionsProps}
              {...(place ? { place } : {})}
              {...(className ? { className } : {})}
              data={item}
              fetchOptions={context}
            />
          )
        };
      }
    },
    options.optionsColumn
  );
};

export default buildOptionsColumn;
