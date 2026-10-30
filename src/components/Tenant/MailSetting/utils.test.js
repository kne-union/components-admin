import { createRequest, toSmtpFormData, toSmtpPayload } from './utils';

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

  test('toSmtpFormData 未配置时默认启用、465、SSL', () => {
    expect(toSmtpFormData({ configured: false, enabled: false, secure: false })).toMatchObject({ enabled: true, port: 465, secure: true });
    expect(toSmtpFormData({ configured: true, enabled: false, secure: false, port: 25 })).toMatchObject({ enabled: false, port: 25, secure: false });
  });
});
