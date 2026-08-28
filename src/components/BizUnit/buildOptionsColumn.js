import Actions from './Actions';

const buildOptionsColumn = ({ isNext, formatMessage, apis, options, getActionList, getFormInner, onReload }) => {
  const actionsProps = {
    moreType: 'link',
    itemClassName: 'btn-no-padding',
    showLength: 0,
    apis,
    options,
    getActionList,
    getFormInner,
    onSuccess: onReload
  };

  if (isNext) {
    return {
      name: 'options',
      title: formatMessage({ id: 'Operation' }),
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
    };
  }

  return {
    name: 'options',
    type: 'options',
    title: formatMessage({ id: 'Operation' }),
    fixed: 'right',
    valueOf: (item, fetchOptions) => ({
      children: <Actions {...actionsProps} data={item} fetchOptions={fetchOptions} />
    })
  };
};

export default buildOptionsColumn;
