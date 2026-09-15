import Actions from './Actions';

const buildOptionsColumn = ({ isNext, formatMessage, apis, options, getActionList, getFormInner, onReload }) => {
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

  if (isNext) {
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
  }

  return Object.assign(
    {
      name: 'options',
      type: 'options',
      title: formatMessage({ id: 'Action' }),
      fixed: 'right',
      valueOf: (item, fetchOptions) => ({
        children: <Actions {...actionsProps} data={item} fetchOptions={fetchOptions} />
      })
    },
    options.optionsColumn
  );
};

export default buildOptionsColumn;
