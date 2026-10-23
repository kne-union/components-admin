import { toggleAppCodes } from './utils';

const appModule = { code: 'crm', name: 'CRM', modules: [{ code: 'order', name: '订单', permissions: [{ code: 'view', name: '查看' }] }] };

describe('TenantApps toggleAppCodes', () => {
  it('enables app with all feature codes', () => {
    expect(toggleAppCodes({ codes: ['setting'], appModule, enabled: true })).toEqual([
      'setting',
      'apps',
      'apps:crm',
      'apps:crm:order',
      'apps:crm:order:view'
    ]);
  });

  it('disables app and drops apps root when no app is left', () => {
    expect(toggleAppCodes({ codes: ['setting', 'apps', 'apps:crm', 'apps:crm:order', 'apps:crm:order:view'], appModule, enabled: false })).toEqual([
      'setting'
    ]);
  });

  it('keeps other apps when disabling one', () => {
    expect(toggleAppCodes({ codes: ['apps', 'apps:crm', 'apps:crm:order', 'apps:crmx', 'apps:erp'], appModule, enabled: false })).toEqual([
      'apps',
      'apps:crmx',
      'apps:erp'
    ]);
  });
});
