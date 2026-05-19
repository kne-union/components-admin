import dayjs from 'dayjs';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { Carousel, Row, Col, Tag, Space, Typography } from 'antd';
import { GlobalOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, BankOutlined, TeamOutlined } from '@ant-design/icons';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';
import style from '../style.module.scss';

const { Title, Paragraph, Text, Link } = Typography;

const formatFounded = value => {
  if (!value) return '';
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD') : String(value);
};

const normalizeCompanyTags = raw => {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .map(item => {
      if (typeof item === 'string') return item.trim();
      const v = item?.label ?? item?.name;
      return typeof v === 'string' ? v.trim() : '';
    })
    .filter(Boolean);
};

const Basic = createWithRemoteLoader({
  modules: ['components-core:Image']
})(
  withLocale(({ remoteModules, data: raw }) => {
    const [Image] = remoteModules;
    const { formatMessage } = useIntl();
    const data = raw || {};

    const banners = data.banners;
    const hasBanners = Array.isArray(banners) && banners.length > 0;

    const name = data.name;
    const fullName = data.fullName;
    const website = data.website;
    const description = data.description;
    const logo = data.logo;
    const industry = data.industry;
    const scale = data.scale;
    const address = data.address;
    const phone = data.phone;
    const email = data.email;
    const foundedDate = data.foundedDate;

    const companyTags = normalizeCompanyTags(data.companyTags);
    const hasHeroTags = companyTags.length > 0;

    const metaItems = [
      website && {
        key: 'website',
        icon: <GlobalOutlined />,
        label: formatMessage({ id: 'CompanyWebsite' }),
        node: (
          <Link href={website} target="_blank" rel="noopener noreferrer">
            {website}
          </Link>
        )
      },
      industry && {
        key: 'industry',
        icon: <BankOutlined />,
        label: formatMessage({ id: 'CompanyIndustry' }),
        node: <Text className={style.basicMetaText}>{industry}</Text>
      },
      scale && {
        key: 'scale',
        icon: <TeamOutlined />,
        label: formatMessage({ id: 'CompanyScale' }),
        node: <Text className={style.basicMetaText}>{scale}</Text>
      },
      address && {
        key: 'address',
        icon: <EnvironmentOutlined />,
        label: formatMessage({ id: 'CompanyAddress' }),
        node: <Text className={style.basicMetaText}>{address}</Text>
      },
      phone && {
        key: 'phone',
        icon: <PhoneOutlined />,
        label: formatMessage({ id: 'PhoneTitle' }),
        node: (
          <Link href={`tel:${String(phone).replace(/\s/g, '')}`} className={style.basicMetaText}>
            {phone}
          </Link>
        )
      },
      email && {
        key: 'email',
        icon: <MailOutlined />,
        label: formatMessage({ id: 'Email' }),
        node: (
          <Link href={`mailto:${email}`} className={style.basicMetaText}>
            {email}
          </Link>
        )
      },
      foundedDate && {
        key: 'founded',
        icon: <CalendarOutlined />,
        label: formatMessage({ id: 'CompanyFounded' }),
        node: <Text className={style.basicMetaText}>{formatFounded(foundedDate)}</Text>
      }
    ].filter(Boolean);

    const nameInitial = (name || '?').trim().charAt(0) || '?';

    const hasBodyContent = Boolean(description || metaItems.length > 0);

    return (
      <div className={style.basicPanel}>
        <div className={`${style.basicHeroBanner} ${!hasBanners ? style.basicHeroBannerDefault : ''}`}>
          {hasBanners ? (
            <div className={style.basicHeroBg}>
              <Carousel autoplay effect="fade" dots className={style.basicHeroCarousel}>
                {banners.map((imageId, index) => (
                  <div key={`${imageId}-${index}`} className={style.basicHeroSlide}>
                    <div className={style.basicHeroSlideInner}>
                      <Image id={imageId} className={style.basicHeroBgImage} />
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          ) : null}
          <div className={style.basicHeroContent}>
            <div className={style.basicHeroInner}>
              <div className={style.basicLogo}>
                {logo ? (
                  <Image.Avatar size={80} id={logo} shape="square" />
                ) : (
                  <div className={style.basicLogoPlaceholder} aria-hidden>
                    {nameInitial}
                  </div>
                )}
              </div>
              <div className={style.basicTitleBlock}>
                <Title level={3} className={style.basicNameOnBanner}>
                  {name || '-'}
                </Title>
                {fullName ? (
                  <Text className={style.basicFullNameOnBanner}>{fullName}</Text>
                ) : null}
                {hasHeroTags ? (
                  <Space size={[8, 8]} wrap className={style.basicTagsOnBanner}>
                    {companyTags.map((text, i) => (
                      <Tag key={`${text}-${i}`} bordered={false} className={style.basicTagOnBanner}>
                        {text}
                      </Tag>
                    ))}
                  </Space>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {hasBodyContent ? (
          <div className={style.basicBody}>
            {description ? (
              <div className={style.basicDescWrap}>
                <Text type="secondary" className={style.basicDescLabel}>
                  {formatMessage({ id: 'CompanyDescription' })}
                </Text>
                <Paragraph className={style.basicDesc}>{description}</Paragraph>
              </div>
            ) : null}

            {metaItems.length > 0 ? (
              <div className={style.basicMetaGrid}>
                <Row gutter={[20, 20]}>
                  {metaItems.map(item => (
                    <Col xs={24} sm={12} key={item.key}>
                      <div className={style.basicMetaRow}>
                        <span className={style.basicMetaIcon}>{item.icon}</span>
                        <div className={style.basicMetaBody}>
                          <div className={style.basicMetaLabel}>{item.label}</div>
                          <div className={style.basicMetaValue}>{item.node}</div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  })
);

export default Basic;
export { default as FormInner } from './FormInner';
