import { createWithRemoteLoader } from '@kne/remote-loader';
import { Typography } from 'antd';
import withLocale from '../../withLocale';
import style from '../style.module.scss';
import { useIntl } from '@kne/react-intl';

const Basic = createWithRemoteLoader({
  modules: ['components-core:InfoPage@Content']
})(
  withLocale(({ remoteModules, data }) => {
    const [Content] = remoteModules;
    const { formatMessage } = useIntl();
    return (
      <div className={style['section']}>
        <Content
          col={2}
          list={[
            {
              label: formatMessage({ id: 'CompanyName' }),
              content: data.name || '-'
            },
            {
              label: formatMessage({ id: 'CompanyFullName' }),
              content: data.fullName || '-'
            },
            {
              label: formatMessage({ id: 'CompanyWebsite' }),
              content: data.website ? (
                <Typography.Link href={data.website} target="_blank">
                  {data.website}
                </Typography.Link>
              ) : (
                '-'
              )
            },
            {
              label: formatMessage({ id: 'CompanyDescription' }),
              content: data.description || '-',
              block: true
            }
          ]}
        />
      </div>
    );
  })
);

export default Basic;
export { default as FormInner } from './FormInner';
