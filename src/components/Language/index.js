import style from './style.module.scss';
import { createWithRemoteLoader } from '@kne/remote-loader';
import useControlValue from '@kne/use-control-value';
import { Space, Button, Divider, Dropdown } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import classnames from 'classnames';

const Language = createWithRemoteLoader({
  modules: ['components-core:Icon']
})(({
  remoteModules,
  className,
  list = [
    { label: '中文', value: 'zh-CN' },
    { label: 'EN', value: 'en-US' }
  ],
  colorful = true,
  ...props
}) => {
  const [current, onChange] = useControlValue(Object.assign({}, { defaultLocale: 'zh-CN' }, props), {
    defaultValue: 'defaultLocale',
    value: 'locale',
    onChange: 'onChange'
  });
  const [Icon] = remoteModules;

  const activeIndex = list.findIndex(item => item.value === current);
  const showList = list.slice(0, 2);
  if (activeIndex > showList.length - 1) {
    showList[showList.length - 1] = list[activeIndex];
  }
  const otherList = list.filter((item, index) => showList.indexOf(item) === -1);
  return (
    <div
      className={classnames(className, 'language', style['language'], {
        'is-colorful': colorful,
        [style['is-colorful']]: colorful
      })}
      onClick={e => {
        e.stopPropagation();
      }}>
      <Icon className={style['icon']} type="icon-yuyanqiehuan" />
      <Space split={<Divider type="vertical" />} size={0}>
        {showList.slice(0, 2).map(({ label, value }) => (
          <Button
            key={value}
            type="text"
            className={classnames('btn-no-padding', style['item'], {
              [style['is-active']]: value === current
            })}
            onClick={() => {
              onChange(value);
            }}>
            {label}
          </Button>
        ))}
      </Space>
      {otherList.length > 0 && (
        <Dropdown
          menu={{
            items: otherList.map(({ label, value }) => {
              return {
                label,
                key: value,
                onClick: () => {
                  onChange(value);
                }
              };
            })
          }}>
          <Button size="small" type="text" icon={<CaretDownOutlined />} />
        </Dropdown>
      )}
    </div>
  );
});

export default Language;
