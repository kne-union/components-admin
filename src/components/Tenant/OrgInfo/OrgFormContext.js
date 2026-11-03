import { BankOutlined, ApartmentOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import OrgSourceTag from './OrgSourceTag';
import style from './style.module.scss';

/** 组织表单弹窗顶部的上下文：提示当前操作挂在哪个组织上 */
const OrgFormContext = ({ label, org }) => {
  if (!org) {
    return null;
  }
  const isRoot = !org.id || org.id === 'root';
  return (
    <div className={style['form-context']}>
      <span className={classnames(style['org-icon'], style['org-icon-small'], { [style['org-icon-root']]: isRoot })} aria-hidden>
        {isRoot ? <BankOutlined /> : <ApartmentOutlined />}
      </span>
      <span className={style['form-context-label']}>{label}</span>
      <span className={style['form-context-name']}>{org.name}</span>
      <OrgSourceTag source={org.syncSource} />
    </div>
  );
};

export default OrgFormContext;
