import { Tag, Tooltip } from 'antd';
import classnames from 'classnames';
import { useIntl } from '@kne/react-intl';
import { getSourceIcon, getSourceLabel, SOURCE_LABEL_MAP, SOURCE_TAG_CLASS } from '../constants';
import style from './style.module.scss';

const OrgSourceTag = ({ source }) => {
  const { formatMessage } = useIntl();
  if (!source) {
    return null;
  }
  const label = getSourceLabel(source);
  return (
    <Tooltip title={formatMessage({ id: 'OrgSourceFrom' }, { source: SOURCE_LABEL_MAP[source] || source })}>
      <Tag className={classnames(style['org-source-tag'], SOURCE_TAG_CLASS)} icon={getSourceIcon(source)} color="processing">
        {label}
      </Tag>
    </Tooltip>
  );
};

export default OrgSourceTag;
