import { createWithRemoteLoader } from '@kne/remote-loader';
import { DEFAULT_GROUP_COLOR, GROUP_COLORS } from './groupHelpers';
import styles from './style.module.scss';

const GroupColorPicker = ({ value, onChange }) => (
  <div className={styles['group-color-picker']}>
    {GROUP_COLORS.map(item => {
      const active = (value || DEFAULT_GROUP_COLOR) === item.value;
      return (
        <button
          key={item.key}
          type="button"
          className={styles['group-color-swatch']}
          data-active={active}
          style={{ backgroundColor: item.value, '--swatch-color': item.value }}
          aria-label={item.key}
          aria-pressed={active}
          onClick={() => onChange?.(item.value)}
        />
      );
    })}
  </div>
);

const GroupColorPickerField = createWithRemoteLoader({
  modules: ['components-core:FormInfo@hooks']
})(({ remoteModules, ...props }) => {
  const [hooks] = remoteModules;
  const { useOnChange } = hooks;
  const render = useOnChange(props);
  return render(GroupColorPicker);
});

export default GroupColorPickerField;
