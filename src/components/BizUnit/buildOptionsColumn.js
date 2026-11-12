import buildActionList from './Actions/buildActionList';

/**
 * 操作列统一走 link 风格
 * table-view 的 options 渲染器默认给每个动作 type: 'link'，但业务里显式写了 type: 'primary'
 * 的动作会把它覆盖掉，于是一行里第一个按钮是实心主色、其余是文字链接，视觉上不一致。
 * 表格行内操作本就该是同一种弱化按钮，这里统一降级 primary，danger / text 等其余类型保持原样。
 */
const normalizeActionType = list => list.map(item => (item && item.type === 'primary' ? Object.assign({}, item, { type: 'link' }) : item));

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
        const list = normalizeActionType(
          buildActionList({ ...actionListProps, ...(className ? { className } : {}), data: item, fetchOptions: context, formatMessage })
        );
        return Object.assign(
          { list },
          // 默认只保留三点「更多」图标，全部动作收进下拉。
          // 不传 showLength 时 ButtonGroup 会走自动测量：测量完成前先外显 1 个按钮，
          // 48px 列宽下把「更多」挤出并被 overflow:hidden 裁掉；同时受控模式也不会再
          // 因容器宽度变化而在行内露出部分文字按钮。业务可用 options.showLength 覆盖。
          { showLength: Number.isInteger(options.showLength) ? options.showLength : 0 },
          place ? { place } : {},
          className ? { className } : {}
        );
      }
    },
    options.optionsColumn
  );
};

export default buildOptionsColumn;
