import '@kne/react-box/dist/index.css';
import classnames from 'classnames';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { PersonalCard } from '@kne/react-box';
import { useIntl } from '@kne/react-intl';
import buildInvitePersonalCardProps from './Actions/buildInvitePersonalCardProps';
import withLocale from '../withLocale';
import style from './Actions/personalCardWrap.module.scss';

/** 租户用户 PersonalCard（邀请弹窗、加入确认等场景共用） */
const TenantUserPersonalCard = createWithRemoteLoader({
  modules: ['components-core:Image', 'components-core:Global@usePreset']
})(({ remoteModules, data, positionList, className }) => {
  const [Image, usePreset] = remoteModules;
  const { plugins } = usePreset();
  const { formatMessage } = useIntl();

  if (!data) {
    return null;
  }

  return (
    <div className={classnames(style.userCardWrap, className)}>
      <PersonalCard
        {...buildInvitePersonalCardProps(data, {
          Image,
          formatMessage,
          plugins,
          positionList
        })}
      />
    </div>
  );
});

export default withLocale(TenantUserPersonalCard);
