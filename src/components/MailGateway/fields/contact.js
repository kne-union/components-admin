import { createWithRemoteLoader } from '@kne/remote-loader';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AutoComplete, Flex, Select, Tag, Typography } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { formatAddress } from '../utils';
import ContactAvatar from '../Contact/ContactAvatar';

const ContactsContext = createContext(null);

export const ContactsProvider = ({ getContacts, children }) => <ContactsContext.Provider value={getContacts}>{children}</ContactsContext.Provider>;

export const useGetContacts = () => useContext(ContactsContext);

const includesText = (source, keyword) =>
  String(source || '')
    .toLowerCase()
    .includes(keyword.toLowerCase());

const EMAIL_REGEXP = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

const parseAddress = value => {
  const matched = String(value || '').match(/^(.*)<([^>]+)>\s*$/);
  return matched ? { name: matched[1].trim().replace(/^"|"$/g, ''), address: matched[2].trim() } : { name: '', address: String(value || '').trim() };
};

const renderTag = ({ value, closable, onClose }) => {
  const { name, address } = parseAddress(value);
  return (
    <Tag
      color={EMAIL_REGEXP.test(address) ? undefined : 'error'}
      closable={closable}
      onClose={onClose}
      title={value}
      onMouseDown={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {name || address}
    </Tag>
  );
};

const useContactOptions = ({ ajax, apis, enabled, keyword, valueType }) => {
  const getContacts = useGetContacts();
  const [state, setState] = useState({ list: [], loading: false });
  const contextRef = useRef({});
  contextRef.current = { ajax, apis, getContacts };

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let canceled = false;
    const fetchLocal = async () => {
      const { ajax, apis } = contextRef.current;
      try {
        const { data } = await ajax(
          Object.assign({}, apis.mailGateway.contact.list, { params: { perPage: 20, filter: keyword ? { keyword } : {} } })
        );
        return data.code === 0 ? data.data.pageData || [] : [];
      } catch (e) {
        return [];
      }
    };
    const fetchExternal = async () => {
      const { getContacts } = contextRef.current;
      if (typeof getContacts !== 'function') {
        return [];
      }
      try {
        const list = await getContacts({ keyword });
        return (Array.isArray(list) ? list : []).filter(item => !keyword || includesText(item.name, keyword) || includesText(item.address, keyword));
      } catch (e) {
        return [];
      }
    };
    const timer = setTimeout(
      async () => {
        setState(current => Object.assign({}, current, { loading: true }));
        const [local, external] = await Promise.all([fetchLocal(), fetchExternal()]);
        if (canceled) {
          return;
        }
        const map = new Map();
        [...local, ...external].forEach(item => {
          const key = String(item.address || '').toLowerCase();
          key && !map.has(key) && map.set(key, item);
        });
        setState({ list: Array.from(map.values()), loading: false });
      },
      keyword ? 300 : 0
    );
    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [enabled, keyword]);

  return {
    loading: state.loading,
    options: state.list.map(item => ({
      label: formatAddress(item),
      value: valueType === 'address' ? item.address : formatAddress(item),
      contact: item
    }))
  };
};

const renderOption = ({ data, label }) =>
  !data.contact ? (
    label
  ) : (
    <Flex align="center" gap={8}>
      <ContactAvatar contact={data.contact} size={20} />
      <Typography.Text ellipsis style={{ flex: 1 }}>
        {data.contact.name || data.contact.address}
      </Typography.Text>
      <Typography.Text type="secondary" ellipsis>
        {data.contact.description || data.contact.address}
      </Typography.Text>
    </Flex>
  );

/**
 * 多个地址输入：可直接输入，也可从联系人（内置联系人 + ContactsProvider 传入的 getContacts）中选择
 * value 为地址字符串数组，valueType=full 时形如 'Name <a@x.com>'，address 时只保留地址
 */
export const ContactSelect = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, value, onChange, valueType = 'full', placeholder, ...props }) => {
    const [usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { formatMessage } = useIntl();
    const [enabled, setEnabled] = useState(false);
    const [keyword, setKeyword] = useState('');
    const { options, loading } = useContactOptions({ ajax, apis, enabled, keyword, valueType });
    return (
      <Select
        mode="tags"
        allowClear
        placeholder={placeholder || formatMessage({ id: 'ContactSelectPlaceholder' })}
        tokenSeparators={[',', ';', '，', '；']}
        loading={loading}
        {...props}
        showSearch={{ filterOption: false, onSearch: setKeyword }}
        value={Array.isArray(value) ? value : value ? [value] : []}
        options={options}
        optionRender={renderOption}
        tagRender={renderTag}
        onOpenChange={open => open && setEnabled(true)}
        onChange={next => {
          setKeyword('');
          onChange(next);
        }}
      />
    );
  })
);

/**
 * 单个地址输入，可从联系人中联想选择，value 为字符串
 */
export const ContactInput = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, value, onChange, valueType = 'address', placeholder, ...props }) => {
    const [usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { formatMessage } = useIntl();
    const [enabled, setEnabled] = useState(false);
    const [keyword, setKeyword] = useState('');
    const { options } = useContactOptions({ ajax, apis, enabled, keyword, valueType });
    return (
      <AutoComplete
        allowClear
        placeholder={placeholder || formatMessage({ id: 'ContactSelectPlaceholder' })}
        filterOption={false}
        {...props}
        value={value}
        options={options}
        optionRender={renderOption}
        onOpenChange={open => open && setEnabled(true)}
        onSearch={setKeyword}
        onChange={next => onChange(next || '')}
      />
    );
  })
);
