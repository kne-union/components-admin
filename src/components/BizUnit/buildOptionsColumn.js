import Actions from './Actions';

const buildOptionsColumn = ({ isNext, formatMessage, apis, options, getActionList, getFormInner, onReload }) => {
  const actionsProps = {
    moreType: 'link',
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
      width: 180,
      min: 120,
      max: 240,
      getValueOf: (item, ctx) => ({
        children: <Actions {...actionsProps} data={item} fetchOptions={ctx?.context} />
      })
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
