import buildActionList from './Actions/buildActionList';

const buildOptionsColumn = ({ formatMessage, apis, options, getActionList, getFormInner, onReload }) => {
  const actionListProps = {
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
      // table-view 的 options 渲染器只接受动作数组（或 { list }）。
      // 早先这里返回 { children: <Actions/> }，渲染器判定「既不是数组也没有 list」后直接 return null，
      // 于是所有 BizUnit 列表的操作列整列空白。
      getValueOf: (item, ctx) => {
        const { context, place, className } = ctx || {};
        return Object.assign(
          {
            list: buildActionList({ ...actionListProps, ...(className ? { className } : {}), data: item, fetchOptions: context, formatMessage })
          },
          Number.isInteger(options.showLength) ? { showLength: options.showLength } : {},
          place ? { place } : {},
          className ? { className } : {}
        );
      }
    },
    options.optionsColumn
  );
};

export default buildOptionsColumn;
