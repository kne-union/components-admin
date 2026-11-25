import { Fragment, useMemo, useState } from 'react';
import { Alert, Button, Tooltip } from 'antd';
import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { useIntl } from '@kne/react-intl';
import UserSelect from '@components/UserSelect';
import withLocale from '../../../withLocale';
import { TOKEN_PLACEHOLDER, buildMcpToken, buildMcpUrl, getMcpClients } from './mcpClients';
import style from './style.module.scss';

const resolveOwner = value => {
  if (value == null || value === '') {
    return { subjectId: undefined, userName: '' };
  }
  if (typeof value === 'object') {
    const subjectId = value.value ?? value.id;
    return {
      subjectId: subjectId == null || subjectId === '' ? undefined : String(subjectId),
      userName: String(value.label || value.nickname || value.email || value.phone || '')
    };
  }
  return { subjectId: String(value), userName: '' };
};

const highlightPlaceholder = content =>
  content.split(TOKEN_PLACEHOLDER).map((part, index, parts) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 && <span className={style.placeholder}>{TOKEN_PLACEHOLDER}</span>}
    </Fragment>
  ));

const Step = ({ index, state, title, description, children }) => (
  <section className={style.step}>
    <div className={classnames(style.dot, { [style.dotActive]: state === 'active', [style.dotDone]: state === 'done' })}>
      {state === 'done' ? <CheckOutlined /> : index}
    </div>
    <div className={style.body}>
      <h4 className={style.title}>{title}</h4>
      {description && <p className={style.desc}>{description}</p>}
      {children}
    </div>
  </section>
);

const InstallMcpContent = withLocale(
  ({ ajax, createApi, apiUrl, message, onGenerated, serverName, selectUser = true, selfName = '', promptExample }) => {
    const { formatMessage } = useIntl();
    const [owner, setOwner] = useState();
    const resolved = resolveOwner(owner);
    const subjectId = selectUser ? resolved.subjectId : undefined;
    const userName = selectUser ? resolved.userName : selfName;
    const canGenerate = !selectUser || !!subjectId;
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [clientKey, setClientKey] = useState('cursor');
    const url = buildMcpUrl(apiUrl);
    const clients = useMemo(() => getMcpClients({ url, token, serverName }), [url, token, serverName]);
    const current = clients.find(item => item.key === clientKey) || clients[0];

    const copy = async text => {
      await navigator.clipboard.writeText(text);
      message.success(formatMessage({ id: 'McpCopySuccess' }));
    };

    const generate = async () => {
      if (!canGenerate) {
        message.error(formatMessage({ id: 'McpSelectUserRequired' }));
        return;
      }
      setLoading(true);
      try {
        const time = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const name = userName ? `MCP ${userName} ${time}` : `MCP ${time}`;
        const { data: resData } = await ajax(Object.assign({}, createApi, { data: selectUser ? { subjectId, name } : { name } }));
        if (resData.code !== 0) {
          return;
        }
        setToken(buildMcpToken(resData.data));
        onGenerated && onGenerated();
      } finally {
        setLoading(false);
      }
    };

    const prompt = promptExample || formatMessage({ id: 'McpInstallPromptExample' });

    return (
      <div className={style.install}>
        <p className={style.intro}>{formatMessage({ id: selectUser ? 'McpInstallIntro' : 'McpInstallIntroSelf' })}</p>
        <Alert
          className={style.securityAlert}
          type="warning"
          showIcon
          message={formatMessage({ id: 'McpSecurityTitle' })}
          description={
            <ul className={style.securityList}>
              {['McpSecurityTip1', 'McpSecurityTip2', 'McpSecurityTip3', 'McpSecurityTip4'].map(id => (
                <li key={id}>{formatMessage({ id })}</li>
              ))}
            </ul>
          }
        />

        <Step
          index={1}
          state={token ? 'done' : 'active'}
          title={formatMessage({ id: selectUser ? 'McpInstallStep1' : 'McpInstallStep1Self' })}
          description={token ? null : formatMessage({ id: selectUser ? 'McpInstallStep1Description' : 'McpInstallStep1SelfDescription' })}
        >
          {token ? (
            <div className={style.token}>
              <div className={style.tokenHead}>
                <span>
                  {userName || subjectId ? (
                    <>
                      {formatMessage({ id: 'McpBelongUser' })}：<span className={style.tokenOwner}>{userName || subjectId}</span>
                    </>
                  ) : null}
                </span>
                <Button size="small" icon={<CopyOutlined />} onClick={() => copy(token)}>
                  {formatMessage({ id: 'McpInstallCopyToken' })}
                </Button>
              </div>
              <p className={style.tokenValue}>{token}</p>
              <p className={style.hint}>{formatMessage({ id: 'McpInstallTokenOnceTips' })}</p>
            </div>
          ) : (
            <div className={style.ownerRow}>
              {selectUser && (
                <div className={style.ownerField}>
                  <UserSelect.Field
                    single
                    placeholder={formatMessage({ id: 'McpSelectUserPlaceholder' })}
                    value={owner}
                    onChange={value => setOwner(value || undefined)}
                  />
                </div>
              )}
              <Button type="primary" loading={loading} disabled={!canGenerate} onClick={generate}>
                {formatMessage({ id: 'McpInstallGenerateToken' })}
              </Button>
            </div>
          )}
        </Step>

        <Step index={2} state={token ? 'active' : 'idle'} title={formatMessage({ id: 'McpInstallStep2' })}>
          <div className={style.clients} role="radiogroup" aria-label={formatMessage({ id: 'McpInstallStep2' })}>
            {clients.map(item => (
              <button
                key={item.key}
                type="button"
                role="radio"
                aria-checked={item.key === current.key}
                className={classnames(style.client, { [style.clientActive]: item.key === current.key })}
                onClick={() => setClientKey(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className={style.code}>
            <div className={style.codeHead}>
              <div className={style.codePath}>
                {current.type === 'command' ? (
                  <strong>{formatMessage({ id: 'McpInstallRunCommand' })}</strong>
                ) : (
                  <>
                    <strong>{formatMessage({ id: 'McpInstallEditFile' })}</strong>
                    {current.path}
                  </>
                )}
              </div>
              <button type="button" className={style.copyBtn} onClick={() => copy(current.content)}>
                <CopyOutlined />
                {formatMessage({ id: 'McpInstallCopyConfig' })}
              </button>
            </div>
            <pre className={style.codeBody}>{token ? current.content : highlightPlaceholder(current.content)}</pre>
          </div>
          {!token && <p className={style.hint}>{formatMessage({ id: 'McpInstallPlaceholderTips' })}</p>}
        </Step>

        <Step
          index={3}
          state="idle"
          title={formatMessage({ id: 'McpInstallStep3' })}
          description={formatMessage({ id: 'McpInstallStep3Description' }, { serverName: serverName || 'mcp' })}
        >
          <div className={style.prompt}>
            {prompt}
            <Tooltip title={formatMessage({ id: 'McpInstallCopyPrompt' })}>
              <Button
                className={style.promptCopy}
                type="text"
                size="small"
                icon={<CopyOutlined />}
                aria-label={formatMessage({ id: 'McpInstallCopyPrompt' })}
                onClick={() => copy(prompt)}
              />
            </Tooltip>
          </div>
        </Step>
      </div>
    );
  }
);

export default InstallMcpContent;
