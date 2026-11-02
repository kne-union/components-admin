import { createRequest, filterTemplates, filterTemplatesByType, getSmtpConnectionKey, getSmtpSaveState, toSmtpFormData, toSmtpPayload } from './utils';

describe('MailSetting utils', () => {
  test('createRequest 按请求方法放入 params / data，并带上 tenantId', () => {
    expect(createRequest({ url: '/smtp-detail', method: 'GET' }, 't1')).toEqual({ url: '/smtp-detail', method: 'GET', params: { tenantId: 't1' } });
    expect(createRequest({ url: '/template-save', method: 'POST' }, 't1', { code: 'welcome' })).toEqual({
      url: '/template-save',
      method: 'POST',
      data: { code: 'welcome', tenantId: 't1' }
    });
    expect(createRequest({ url: '/template-list', method: 'GET' })).toEqual({ url: '/template-list', method: 'GET', params: {} });
  });

  test('toSmtpPayload 空密码不提交，端口与开关有默认值', () => {
    expect(toSmtpPayload({ host: 'smtp.qq.com', user: 'a@qq.com', pass: '', port: '587', secure: false })).toEqual({
      enabled: true,
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      user: 'a@qq.com',
      pass: undefined,
      fromName: '',
      fromAddress: ''
    });
  });

  test('filterTemplatesByType 按类型过滤，兼容筛选器的多种取值格式', () => {
    const list = [{ code: 'a', type: 0 }, { code: 'a', type: 1 }, { code: 'b' }];
    expect(filterTemplatesByType(list).map(item => item.code)).toEqual(['a', 'a', 'b']);
    expect(filterTemplatesByType(list, 1)).toEqual([{ code: 'a', type: 1 }]);
    expect(filterTemplatesByType(list, [{ value: 0, label: '邮件' }]).map(item => item.code)).toEqual(['a', 'b']);
    expect(filterTemplatesByType(list, { value: '1' })).toEqual([{ code: 'a', type: 1 }]);
  });

  test('filterTemplates 按名称或编码过滤，不区分大小写', () => {
    const list = [
      { name: 'Interview Invitation', code: 'INVITEINTERVIEW[en-US]' },
      { name: '邀请面试', code: 'INVITEINTERVIEW[zh-CN]' },
      { name: '邀请采集', code: 'INVITEDATACOLLECTION[zh-CN]' }
    ];
    expect(filterTemplates(list, '')).toHaveLength(3);
    expect(filterTemplates(list, ' interview ').map(item => item.code)).toEqual(['INVITEINTERVIEW[en-US]', 'INVITEINTERVIEW[zh-CN]']);
    expect(filterTemplates(list, '采集')).toHaveLength(1);
    expect(filterTemplates(null, 'x')).toEqual([]);
  });

  test('getSmtpConnectionKey 只随连接字段变化', () => {
    const base = { host: 'smtp.qq.com', port: 465, secure: true, user: 'a@qq.com', pass: 'x', fromName: 'A' };
    expect(getSmtpConnectionKey(base)).toBe(
      getSmtpConnectionKey(Object.assign({}, base, { fromName: 'B', testTo: 'b@qq.com', host: ' smtp.qq.com ' }))
    );
    expect(getSmtpConnectionKey(base)).not.toBe(getSmtpConnectionKey(Object.assign({}, base, { port: 587 })));
    expect(getSmtpConnectionKey(base)).not.toBe(getSmtpConnectionKey(Object.assign({}, base, { pass: 'y' })));
  });

  test('getSmtpSaveState 测试通过才能保存，改连接参数需重测', () => {
    const formData = { enabled: true, host: 'smtp.qq.com', port: 465, secure: true, user: 'a@qq.com', pass: 'x' };
    const testedKey = getSmtpConnectionKey(formData);
    expect(getSmtpSaveState({ formData, testedKey: null, savedKey: null })).toBe('required');
    expect(getSmtpSaveState({ formData, testedKey, savedKey: null })).toBe('passed');
    expect(getSmtpSaveState({ formData: Object.assign({}, formData, { fromName: 'B' }), testedKey, savedKey: null })).toBe('passed');
    expect(getSmtpSaveState({ formData: Object.assign({}, formData, { port: 587 }), testedKey, savedKey: null })).toBe('outdated');
    expect(getSmtpSaveState({ formData: Object.assign({}, formData, { enabled: false }), testedKey: null, savedKey: null })).toBe('ready');
    const saved = { configured: true, enabled: true, host: 'smtp.qq.com', port: 465, secure: true, user: 'a@qq.com', hasPassword: true };
    const savedKey = getSmtpConnectionKey(toSmtpFormData(saved));
    expect(getSmtpSaveState({ formData: Object.assign(toSmtpFormData(saved), { fromName: 'B' }), testedKey: null, savedKey })).toBe('ready');
    expect(getSmtpSaveState({ formData: Object.assign(toSmtpFormData(saved), { pass: 'new' }), testedKey: null, savedKey })).toBe('required');
  });

  test('toSmtpFormData 未配置时默认启用、465、SSL', () => {
    expect(toSmtpFormData({ configured: false, enabled: false, secure: false })).toMatchObject({ enabled: true, port: 465, secure: true });
    expect(toSmtpFormData({ configured: true, enabled: false, secure: false, port: 25 })).toMatchObject({ enabled: false, port: 25, secure: false });
  });
});
