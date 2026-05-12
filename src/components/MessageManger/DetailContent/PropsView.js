import { Descriptions } from 'antd';
import JsonView from '@kne/json-view';
import '@kne/json-view/dist/index.css';

const PropsView = ({ props: propsData, formatMessage }) => {
  if (!propsData || Object.keys(propsData).length === 0) return null;
  const entries = Object.entries(propsData);
  const hasJsonObject = entries.some(([, value]) => typeof value === 'object');
  return (
    <div>
      <strong>{formatMessage({ id: 'Props' })}</strong>
      <Descriptions bordered column={hasJsonObject ? 1 : 2} size="small" style={{ marginTop: 8 }}>
        {entries.map(([key, value]) => (
          <Descriptions.Item key={key} label={key}>
            {typeof value === 'object' ? <JsonView data={value} collapsedFrom={1} theme="light" /> : String(value)}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </div>
  );
};

export default PropsView;
