import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef } from 'react';
import { Flex, Button, App } from 'antd';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';

const SECRET_LINE_PREFIX = /^@?secret\s+/i;
const SECRET_TRAILING_COMMENT = /\s+#\s*@?secret\s*$/i;

/** 把光标所在行改为密钥写法（追加 #secret；已是密钥则不变） */
const markLineAsSecret = (text, cursor) => {
  const raw = String(text || '');
  const pos = Math.max(0, Math.min(Number(cursor) || 0, raw.length));
  const lineStart = raw.lastIndexOf('\n', Math.max(0, pos - 1)) + 1;
  const nextBreak = raw.indexOf('\n', pos);
  const lineEnd = nextBreak === -1 ? raw.length : nextBreak;
  const line = raw.slice(lineStart, lineEnd);
  const trimmed = line.trim();
  if (!trimmed) {
    return { ok: false, reason: 'empty' };
  }
  if (trimmed.startsWith('#')) {
    return { ok: false, reason: 'comment' };
  }
  const body = trimmed.replace(/^export\s+/i, '');
  if (SECRET_LINE_PREFIX.test(body) || SECRET_TRAILING_COMMENT.test(body)) {
    return { ok: false, reason: 'already' };
  }
  if (!body.includes('=')) {
    return { ok: false, reason: 'invalid' };
  }
  const newLine = `${line.replace(/\s+$/, '')} #secret`;
  const nextText = raw.slice(0, lineStart) + newLine + raw.slice(lineEnd);
  const nextCursor = lineStart + newLine.length;
  return { ok: true, text: nextText, cursor: nextCursor };
};

/** 解析 .env 文本为 [{ key, value, secret }]；忽略空行与 # 注释，支持 export / 引号，以及密钥标记 */
const parseEnvTextToArgs = text => {
  const args = [];
  const seen = new Set();
  String(text || '')
    .split(/\r?\n/)
    .forEach(line => {
      let raw = line.trim();
      if (!raw || raw.startsWith('#')) {
        return;
      }
      let secret = false;
      // 行首：secret KEY=value 或 @secret KEY=value
      if (SECRET_LINE_PREFIX.test(raw)) {
        secret = true;
        raw = raw.replace(SECRET_LINE_PREFIX, '').trim();
      }
      if (raw.toLowerCase().startsWith('export ')) {
        raw = raw.slice(7).trim();
      }
      const eq = raw.indexOf('=');
      if (eq <= 0) {
        return;
      }
      const key = raw.slice(0, eq).trim();
      if (!key || /\s/.test(key) || seen.has(key)) {
        return;
      }
      let value = raw.slice(eq + 1).trim();
      const quoted =
        (value.startsWith('"') && value.endsWith('"') && value.length >= 2) || (value.startsWith("'") && value.endsWith("'") && value.length >= 2);
      if (quoted) {
        value = value.slice(1, -1);
      } else if (SECRET_TRAILING_COMMENT.test(value)) {
        // 未加引号时支持 KEY=value #secret / #@secret
        secret = true;
        value = value.replace(SECRET_TRAILING_COMMENT, '').trim();
      }
      seen.add(key);
      args.push({ key, value, secret });
    });
  return args;
};

const Args = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:TablePage@Table', 'components-core:FormInfo']
})(
  withLocale(({ remoteModules, tenant, reload }) => {
    const [usePreset, Table, FormInfo] = remoteModules;
    const { formatMessage } = useIntl();
    const { apis, ajax } = usePreset();
    const { useFormModal, useFormContext } = FormInfo;
    const { TextArea } = FormInfo.fields;
    const formModal = useFormModal();
    const { message } = App.useApp();
    const args = tenant.tenantSetting?.args || [];

    const EnvTextField = () => {
      const wrapRef = useRef(null);
      const { openApi, formData } = useFormContext();
      const markAsSecret = () => {
        const textarea = wrapRef.current?.querySelector?.('textarea');
        const text = textarea && typeof textarea.value === 'string' ? textarea.value : String(formData?.envText || '');
        const cursor = textarea && typeof textarea.selectionStart === 'number' ? textarea.selectionStart : text.length;
        const result = markLineAsSecret(text, cursor);
        if (!result.ok) {
          const tipMap = {
            empty: 'EnvMarkSecretEmpty',
            comment: 'EnvMarkSecretComment',
            already: 'EnvMarkSecretAlready',
            invalid: 'EnvMarkSecretInvalid'
          };
          message.warning(formatMessage({ id: tipMap[result.reason] || 'EnvMarkSecretInvalid' }));
          return;
        }
        openApi.setFields([{ name: 'envText', value: result.text }], { runValidate: false });
        requestAnimationFrame(() => {
          const next = wrapRef.current?.querySelector?.('textarea');
          if (next) {
            next.focus();
            next.setSelectionRange(result.cursor, result.cursor);
          }
        });
      };
      return (
        <div ref={wrapRef}>
          <TextArea
            name="envText"
            label={formatMessage({ id: 'EnvTextLabel' })}
            rule="REQ"
            block
            autoSize={{ minRows: 12, maxRows: 28 }}
            placeholder={formatMessage({ id: 'EnvTextPlaceholder' })}
            extra={formatMessage({ id: 'EnvTextHint' })}
          />
          <Flex justify="flex-end" style={{ marginTop: 8 }}>
            <Button size="small" onClick={markAsSecret}>
              {formatMessage({ id: 'EnvMarkAsSecret' })}
            </Button>
          </Flex>
        </div>
      );
    };

    return (
      <Flex vertical gap={8}>
        <Flex justify="flex-end">
          <Button
            type="primary"
            size="small"
            onClick={() => {
              formModal({
                title: formatMessage({ id: 'AddEnvironmentVariable' }),
                size: 'large',
                children: <EnvTextField />,
                formProps: {
                  data: { envText: '' },
                  onSubmit: async formData => {
                    const nextArgs = parseEnvTextToArgs(formData.envText);
                    if (!nextArgs.length) {
                      message.error(formatMessage({ id: 'EnvTextEmpty' }));
                      return false;
                    }
                    const existingKeys = new Set((args || []).map(item => item.key));
                    const duplicated = nextArgs.map(item => item.key).filter(key => existingKeys.has(key));
                    if (duplicated.length) {
                      message.error(formatMessage({ id: 'EnvKeyExists' }, { keys: duplicated.join(', ') }));
                      return false;
                    }
                    const { data: resData } = await ajax(
                      Object.assign({}, apis.tenantAdmin.appendArgs, {
                        data: {
                          tenantId: tenant.id,
                          args: nextArgs
                        }
                      })
                    );
                    if (resData.code !== 0) {
                      return false;
                    }
                    message.success(formatMessage({ id: 'AddSuccess' }));
                    reload();
                  }
                }
              });
            }}
          >
            {formatMessage({ id: 'AddEnvironmentVariable' })}
          </Button>
        </Flex>
        <Table
          rowKey="key"
          dataSource={args}
          columns={[
            {
              name: 'key',
              title: 'KEY'
            },
            {
              name: 'value',
              title: formatMessage({ id: 'Value' }),
              renderType: 'description'
            },
            {
              name: 'secret',
              title: formatMessage({ id: 'IsSecret' }),
              getValueOf: item => String(item.secret !== void 0 ? item.secret : false)
            },
            {
              name: 'options',
              renderType: 'options',
              title: formatMessage({ id: 'Action' }),
              fixed: 'right',
              getValueOf: item => {
                return [
                  {
                    children: formatMessage({ id: 'Copy' }),
                    // 密钥不展示真实值，禁止复制
                    hidden: !!item.secret,
                    onClick: async () => {
                      const text = `${item.key}=${item.value == null ? '' : String(item.value)}`;
                      try {
                        await navigator.clipboard.writeText(text);
                        message.success(formatMessage({ id: 'CopySuccess' }));
                      } catch (e) {
                        message.error(formatMessage({ id: 'CopyFailed' }));
                      }
                    }
                  },
                  {
                    children: formatMessage({ id: 'Delete' }),
                    confirm: true,
                    onClick: async () => {
                      const { data: resData } = await ajax(
                        Object.assign({}, apis.tenantAdmin.removeArg, {
                          data: {
                            tenantId: tenant.id,
                            key: item.key
                          }
                        })
                      );
                      if (resData.code !== 0) {
                        return;
                      }
                      message.success(formatMessage({ id: 'DeleteSuccess' }));
                      reload();
                    }
                  }
                ];
              }
            }
          ]}
        />
      </Flex>
    );
  })
);

export default Args;
