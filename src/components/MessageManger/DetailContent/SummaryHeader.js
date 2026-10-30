import { Flex } from 'antd';
import style from '../style.module.scss';

/** 详情顶部摘要：标题 + 标签 + 元信息网格 */
const SummaryHeader = ({ title, tags, description, meta = [] }) => (
  <div className={style['summary']}>
    <Flex align="center" gap={8} wrap>
      <span className={style['summary-title']}>{title}</span>
      {tags}
    </Flex>
    {description ? <div className={style['summary-description']}>{description}</div> : null}
    {meta.length > 0 && (
      <div className={style['summary-meta']}>
        {meta.map(item => (
          <div key={item.key}>
            <div className={style['meta-label']}>{item.label}</div>
            <div className={style['meta-value']}>{item.value ?? '-'}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default SummaryHeader;
