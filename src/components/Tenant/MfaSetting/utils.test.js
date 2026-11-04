import { splitDuration, toMfaFormData, toMfaPayload } from './utils';

describe('MfaSetting utils', () => {
  it('toMfaFormData 把秒换算成分钟，缺省按 1 天', () => {
    expect(toMfaFormData({ enabled: true, maxAge: 3600 })).toEqual({ enabled: true, maxAgeMinutes: 60 });
    expect(toMfaFormData(null)).toEqual({ enabled: false, maxAgeMinutes: 1440 });
    expect(toMfaFormData({ enabled: false, maxAge: 0 })).toEqual({ enabled: false, maxAgeMinutes: 0 });
  });

  it('toMfaPayload 把分钟换算成秒，固定短信方式且不小于 0', () => {
    expect(toMfaPayload({ enabled: true, maxAgeMinutes: 30 })).toEqual({ enabled: true, methods: ['sms'], maxAge: 1800 });
    expect(toMfaPayload({ enabled: false, maxAgeMinutes: -5 })).toEqual({ enabled: false, methods: ['sms'], maxAge: 0 });
    expect(toMfaPayload({ enabled: true })).toEqual({ enabled: true, methods: ['sms'], maxAge: 0 });
  });

  it('splitDuration 只保留非 0 部分', () => {
    expect(splitDuration(0)).toEqual([]);
    expect(splitDuration(86400)).toEqual([['Days', 1]]);
    expect(splitDuration(90061)).toEqual([
      ['Days', 1],
      ['Hours', 1],
      ['Minutes', 1],
      ['Seconds', 1]
    ]);
  });
});
