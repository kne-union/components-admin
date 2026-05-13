import style from './dashboard.module.scss';

const SectionHeader = ({ title, extra }) => (
  <div className={style.sectionHeader}>
    <h3 className={style.sectionTitle}>{title}</h3>
    {extra}
  </div>
);

export default SectionHeader;
