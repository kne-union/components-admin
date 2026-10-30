import {
  buildExampleProps,
  buildMessageParams,
  buildPreviewProps,
  buildMessageProps,
  buildSendPreviewProps,
  getInvalidRecipients,
  getMissingVariables,
  getRequiredVariableNames,
  getTemplateVariables,
  parseRecipients,
  splitMessageProps
} from './utils';

describe('MessageManger utils', () => {
  test('builds bracket filter params for fastify-message records', () => {
    expect(
      buildMessageParams(
        {
          type: { value: 0, label: '邮件' },
          code: 'welcome',
          name: 'user@example.com',
          ignored: 'value'
        },
        ['type', 'code', 'name']
      )
    ).toEqual({
      'filter[type]': 0,
      'filter[code]': 'welcome',
      'filter[name]': 'user@example.com'
    });
  });

  test('keeps zero values when building template filters', () => {
    expect(
      buildMessageParams(
        {
          type: { value: 0 },
          level: { value: 0 },
          status: { value: 0 },
          code: ''
        },
        ['type', 'code', 'level', 'status']
      )
    ).toEqual({
      'filter[type]': 0,
      'filter[level]': 0,
      'filter[status]': 0
    });
  });

  test('uses declared variables first and extracts liquid variables otherwise', () => {
    expect(getTemplateVariables({ variables: [{ name: 'code', label: '验证码' }], content: '{{ other }}' })).toEqual([
      { name: 'code', label: '验证码' }
    ]);
    expect(getTemplateVariables({ subject: '{{ user.name }} 你好', content: '<p>{{ code }}{{ link | raw }}{{ code }}</p>' })).toEqual([
      { name: 'user.name' },
      { name: 'code' },
      { name: 'link' }
    ]);
  });

  test('builds props from json editor and variable inputs', () => {
    const variables = [{ name: 'user.name' }, { name: 'code' }];
    expect(buildMessageProps({ props: '{"extra":1,"code":"0"}', var_0: '张三', var_1: '8888' }, variables)).toEqual({
      extra: 1,
      code: '8888',
      user: { name: '张三' }
    });
    expect(
      buildExampleProps([
        { name: 'user.name', example: '王五' },
        { name: 'empty', example: '' }
      ])
    ).toEqual({ user: { name: '王五' } });
  });

  it('builds preview props with examples and [label] placeholders', () => {
    expect(
      buildPreviewProps({
        variables: [{ name: 'user.name', label: '姓名', example: '张三' }, { name: 'code', label: '验证码' }, { name: 'url' }]
      })
    ).toEqual({ user: { name: '张三' }, code: '[验证码]', url: '[url]' });
    expect(buildPreviewProps({ subject: '{{ title }}', content: '<p>{{ userName }}</p>' })).toEqual({ title: '[title]', userName: '[userName]' });
  });

  it('treats variables only used inside condition blocks as optional', () => {
    expect(
      getRequiredVariableNames({
        subject: '{{ title }}',
        content: '<p>{{ userName }}</p>{% if packageName != blank %}<p>{{ packageName }}{% if a %}{{ inner }}{% endif %}</p>{% endif %}{{ code }}'
      })
    ).toEqual(['title', 'userName', 'code']);
  });

  it('parses and validates recipients', () => {
    expect(parseRecipients('a@x.com, b@x.com；a@x.com\nc@x.com')).toEqual(['a@x.com', 'b@x.com', 'c@x.com']);
    expect(parseRecipients(['a@x.com', ' b@x.com ', '', null, 'a@x.com'])).toEqual(['a@x.com', 'b@x.com']);
    expect(getInvalidRecipients(['a@x.com', 'bad'], false)).toEqual(['bad']);
    expect(getInvalidRecipients(['13800000000', '+86-13800000000', 'abc'], true)).toEqual(['abc']);
  });

  it('builds send preview props consistent with actual sending', () => {
    const variables = [
      { name: 'userName', label: '姓名', example: '张三' },
      { name: 'packageName', label: '套餐', example: '专业版' },
      { name: 'code' }
    ];
    const requiredNames = ['userName', 'code'];
    const props = buildSendPreviewProps({ props: '{bad json', var_2: '1234' }, variables, requiredNames);
    expect(props).toEqual({ userName: '[姓名]', packageName: '', code: '1234' });
    expect(getMissingVariables(buildMessageProps({ var_2: '1234' }, variables), variables, requiredNames)).toEqual([variables[0]]);
  });

  it('splits full props into variable fields and rest props', () => {
    const variables = [{ name: 'user.name' }, { name: 'count' }, { name: 'missing' }, { name: 'items' }];
    const props = { user: { name: 'Alice', id: 1 }, count: 3, items: [1, 2], extra: 'x' };
    const { fields, restProps } = splitMessageProps(variables, props);
    expect(fields).toEqual({ var_0: 'Alice', var_1: '3', var_2: '' });
    expect(restProps).toEqual({ user: { id: 1 }, items: [1, 2], extra: 'x' });
    expect(props.user.name).toBe('Alice');
    expect(buildMessageProps(Object.assign({ props: JSON.stringify(restProps) }, fields, { var_1: '' }), variables)).toEqual({
      user: { name: 'Alice', id: 1 },
      items: [1, 2],
      extra: 'x'
    });
  });
});
