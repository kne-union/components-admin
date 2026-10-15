const { Rule } = _MailGateway;
const { default: mockPreset, mailGatewayData } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Radio } = antd;

// 服务端通过 services.action.register / options.actions 注册的动作（含 formSchema），会出现在 GET /actions 的返回里；
// 通过 services.condition.register / options.conditions 注册的条件（如 AI 判断），会出现在 GET /rules/options 的 extensions 里。这里在 mock 中模拟
const actionApis = mockPreset.apis.mailGateway.action;
const ruleApis = mockPreset.apis.mailGateway.rule;
const preset = Object.assign({}, mockPreset, {
  apis: Object.assign({}, mockPreset.apis, {
    mailGateway: Object.assign({}, mockPreset.apis.mailGateway, {
      action: Object.assign({}, actionApis, {
        list: Object.assign({}, actionApis.list, {
          loader: async props => {
            const direction = props?.params?.direction;
            const builtIn = await actionApis.list.loader(props);
            return [...builtIn, ...mailGatewayData.customActions.filter(item => !direction || item.directions.includes(direction))];
          }
        })
      }),
      rule: Object.assign({}, ruleApis, {
        options: Object.assign({}, ruleApis.options, {
          loader: async props => Object.assign({}, await ruleApis.options.loader(props), { extensions: mailGatewayData.customConditions })
        })
      })
    })
  })
});

const ticketQueues = [
  { label: '售后服务', value: 'after-sale' },
  { label: '技术支持', value: 'tech-support' },
  { label: '投诉处理', value: 'complaint' }
];

const TicketQueueInput = ({ value, onChange }) => (
  <Radio.Group optionType="button" buttonStyle="solid" options={ticketQueues} value={value} onChange={e => onChange(e.target.value)} />
);

// FormCreator 字段类型的 component 须为 FormInfo 字段组件，用 FormInfo.hooks.useOnChange 包装
const TicketQueueField = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, ...props }) => {
  const [FormInfo] = remoteModules;
  const render = FormInfo.hooks.useOnChange(props);
  return render(TicketQueueInput);
});

let ticketQueueRegistered = false;

const CustomActionExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout', 'components-thirdparty:FormCreator@preset']
})(({ remoteModules }) => {
  const [PureGlobal, Layout, formCreatorPreset] = remoteModules;
  // 动作 formSchema 中 type 为 TicketQueue 的字段使用这个控件
  if (!ticketQueueRegistered) {
    ticketQueueRegistered = true;
    formCreatorPreset({
      fields: {
        TicketQueue: { label: '工单队列', groupName: '工单', component: TicketQueueField, valueSchema: { type: 'string' } }
      }
    });
  }
  return (
    <PureGlobal preset={preset}>
      <Layout navigation={{ isFixed: false }}>
        <Rule pageProps={{ menu: null, menuFixed: false }} />
      </Layout>
    </PureGlobal>
  );
});

render(<CustomActionExample />);
