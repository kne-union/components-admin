import { createWithRemoteLoader } from '@kne/remote-loader';
import { Tag, Typography } from 'antd';
import { GlobalOutlined, EnvironmentOutlined, CalendarOutlined, BankOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import style from './style.module.scss';

const companyInitial = name => {
  const text = String(name || '').trim();
  return text ? text.charAt(0).toUpperCase() : '?';
};

const normalizeTags = raw =>
  (Array.isArray(raw) ? raw : [])
    .map(item => (typeof item === 'string' ? item : (item?.label ?? item?.name)))
    .filter(item => typeof item === 'string' && item.trim());

const formatDate = value => {
  if (!value) return '';
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD') : String(value);
};

export const CompanyLogo = createWithRemoteLoader({
  modules: ['components-core:Image']
})(({ remoteModules, company, size = 56 }) => {
  const [Image] = remoteModules;
  if (company?.logo) {
    return <Image.Avatar id={company.logo} size={size} shape="square" className={style.companyLogo} />;
  }
  return (
    <span className={style.companyLogoFallback} style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }} aria-hidden>
      {companyInitial(company?.name)}
    </span>
  );
});

const CompanySummary = withLocale(({ data }) => {
  const { formatMessage } = useIntl();
  const company = data || {};
  const tags = normalizeTags(company.companyTags);
  const fields = [
    { key: 'industry', icon: <BankOutlined />, label: 'CompanyIndustry', value: company.industry },
    { key: 'scale', icon: <TeamOutlined />, label: 'CompanyScale', value: company.scale },
    { key: 'founded', icon: <CalendarOutlined />, label: 'CompanyFounded', value: formatDate(company.foundedDate) },
    { key: 'address', icon: <EnvironmentOutlined />, label: 'CompanyAddress', value: company.address, full: true },
    {
      key: 'website',
      icon: <GlobalOutlined />,
      label: 'CompanyWebsite',
      full: true,
      value: company.website && (
        <Typography.Link href={company.website} target="_blank" rel="noopener noreferrer" ellipsis>
          {company.website}
        </Typography.Link>
      )
    }
  ].filter(item => item.value);

  return (
    <div className={style.company}>
      <div className={style.companyHead}>
        <CompanyLogo company={company} />
        <div className={style.companyHeadBody}>
          <div className={style.companyName}>{company.name || formatMessage({ id: 'UnnamedCompany' })}</div>
          {company.fullName && company.fullName !== company.name && <div className={style.companyFullName}>{company.fullName}</div>}
          {tags.length > 0 && (
            <div className={style.companyTags}>
              {tags.map(tag => (
                <Tag key={tag} bordered={false} color="processing">
                  {tag}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>
      {fields.length > 0 && (
        <div className={style.companyFields}>
          {fields.map(item => (
            <div key={item.key} className={item.full ? style.companyFieldFull : style.companyField}>
              <span className={style.companyFieldIcon}>{item.icon}</span>
              <span className={style.companyFieldLabel}>{formatMessage({ id: item.label })}</span>
              <span className={style.companyFieldValue}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
      {company.description && (
        <Typography.Paragraph className={style.companyDesc} ellipsis={{ rows: 3, expandable: true, symbol: formatMessage({ id: 'Expand' }) }}>
          {company.description}
        </Typography.Paragraph>
      )}
    </div>
  );
});

export default CompanySummary;
