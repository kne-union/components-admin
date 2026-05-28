import { Flex, Tag, Tooltip } from 'antd';
import classnames from 'classnames';
import { useIntl } from '@kne/react-intl';
import getUserOrgDisplayItems from './getUserOrgDisplayItems';
import withLocale from '../withLocale';
import style from './UserOrgTags.module.scss';

const MAX_VISIBLE = 2;

export const tooltipOverlayProps = {
  overlayClassName: style.tooltipOverlay,
  mouseEnterDelay: 0.2
};

/** 单部门：名称 + 完整路径（有差异时分行展示） */
export const OrgPathTooltip = ({ org }) => {
  if (!org.path) {
    return null;
  }
  if (!org.showPath) {
    return <div className={style.tooltipSingle}>{org.path}</div>;
  }
  return (
    <div className={style.tooltipSingle}>
      <div className={style.tooltipPrimary}>{org.label}</div>
      <div className={style.tooltipSecondary}>{org.path}</div>
    </div>
  );
};

/** 多部门列表（+N 悬停） */
export const OrgListTooltip = ({ orgs, title }) => (
  <div className={style.tooltipPanel}>
    <div className={style.tooltipHeader}>{title}</div>
    <ul className={style.tooltipList}>
      {orgs.map(org => (
        <li key={org.id} className={style.tooltipListItem}>
          <span className={style.tooltipItemLabel}>{org.label || org.path}</span>
          {org.showPath ? <span className={style.tooltipItemPath}>{org.path}</span> : null}
        </li>
      ))}
    </ul>
  </div>
);

const UserOrgTags = ({ item, maxVisible = MAX_VISIBLE }) => {
  const { formatMessage } = useIntl();
  const orgs = getUserOrgDisplayItems(item);
  if (!orgs.length) {
    return null;
  }

  const visible = orgs.slice(0, maxVisible);
  const rest = orgs.slice(maxVisible);
  const listTooltipTitle = formatMessage({ id: 'OrgTooltipListTitle' }, { count: orgs.length });

  const renderTag = org => {
    const tag = (
      <Tag bordered={false} className={style.tag}>
        {org.label}
      </Tag>
    );

    if (!org.showPath) {
      return (
        <span key={org.id} className={style.tagWrap}>
          {tag}
        </span>
      );
    }

    return (
      <Tooltip key={org.id} title={<OrgPathTooltip org={org} />} {...tooltipOverlayProps}>
        <span className={style.tagWrap}>{tag}</span>
      </Tooltip>
    );
  };

  return (
    <Flex wrap gap={4} align="center" className={style.wrap}>
      {visible.map(renderTag)}
      {rest.length > 0 ? (
        <Tooltip title={<OrgListTooltip orgs={orgs} title={listTooltipTitle} />} {...tooltipOverlayProps}>
          <span className={style.tagWrap}>
            <Tag bordered={false} className={classnames(style.tag, style.tagMore)}>
              +{rest.length}
            </Tag>
          </span>
        </Tooltip>
      ) : null}
    </Flex>
  );
};

export default withLocale(UserOrgTags);
