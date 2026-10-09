import { Button, Flex, Typography } from 'antd';
import classnames from 'classnames';
import style from './style.module.scss';

const ResultPanel = ({ icon, danger, title, description, actionText, onAction }) => (
  <Flex vertical align="center" gap={32} className={style['callback-result']}>
    <span className={classnames(style['callback-icon'], { [style['callback-icon-error']]: danger })}>{icon}</span>
    <Flex vertical align="center" gap={8}>
      <div className={style['callback-title']}>{title}</div>
      <Typography.Text type="secondary" className={style['callback-desc']}>
        {description}
      </Typography.Text>
    </Flex>
    {actionText && (
      <Button type="primary" size="large" block onClick={onAction}>
        {actionText}
      </Button>
    )}
  </Flex>
);

export default ResultPanel;
