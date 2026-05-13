import classNames from 'classnames';
import { Card, Statistic } from 'antd';
import { PALETTE } from './constants';
import style from './dashboard.module.scss';

const StatCard = ({ title, value, valueStyle, color, className }) => (
  <Card
    className={classNames(style.statCard, className)}
    style={{ borderTop: `3px solid ${color || PALETTE.total}` }}
    bodyStyle={{ padding: '20px 24px' }}
  >
    <Statistic title={title} value={value} valueStyle={valueStyle} />
  </Card>
);

export default StatCard;
