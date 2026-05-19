import { Flex, Tag, Tooltip } from 'antd';
import classnames from 'classnames';
import { useIntl } from '@kne/react-intl';
import getUserOrgDisplayItems from './getUserOrgDisplayItems';
import { OrgListTooltip, OrgPathTooltip, tooltipOverlayProps } from './OrgTooltipContent';
import withLocale from '../withLocale';
import style from './UserOrgTags.module.scss';

const MAX_VISIBLE = 2;

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
    const path = org.fullPath || org.label;
    const showTooltip = path && org.label && path !== org.label;
    const tag = (
      <Tag bordered={false} className={style.tag}>
        {org.label}
      </Tag>
    );

    if (!showTooltip) {
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
