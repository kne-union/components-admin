import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, Flex } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import { useState } from 'react';
import DevelopmentHistory, { FormInner as DevelopmentHistoryFormInner } from './DevelopmentHistory';
import Basic, { FormInner as BasicFormInner } from './Basic';
import Banner, { FormInner as BannerFormInner } from './Banner';
import TeamDescription, { FormInner as TeamDescriptionFormInner } from './TeamDescription';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import style from './style.module.scss';

const CompanyDetail = createWithRemoteLoader({
  modules: ['components-core:InfoPage']
})(({ remoteModules, data }) => {
  const [InfoPage] = remoteModules;
  const { formatMessage } = useIntl();

  return (
    <>
      <Banner data={data} />
      <InfoPage.Part>
        <Basic data={data} />
      </InfoPage.Part>
      <InfoPage.Part title={formatMessage({ id: 'DevelopmentHistory' })}>
        <DevelopmentHistory data={data} />
      </InfoPage.Part>
      <InfoPage.Part title={formatMessage({ id: 'TeamDescription' })}>
        <TeamDescription data={data} />
      </InfoPage.Part>
    </>
  );
});

const CompanyInfo = createWithRemoteLoader({
  modules: ['components-core:InfoPage', 'components-core:FormInfo']
})(({ remoteModules, data, onSubmit, hasEdit = true, apis }) => {
  const [InfoPage, FormInfo] = remoteModules;
  const [isEdit, setIsEdit] = useState(false);
  const { formatMessage } = useIntl();

  const { Form, SubmitButton, CancelButton } = FormInfo;

  if (isEdit) {
    return (
      <Form
        className={style['company-info']}
        type="default"
        data={data}
        onSubmit={async formData => {
          if ((await onSubmit(formData)) === false) {
            return;
          }
          setIsEdit(false);
        }}>
        <InfoPage.Part bordered title={formatMessage({ id: 'CompanyInfo' })} className={style['section']}>
          <Flex gap={24} vertical>
            <InfoPage.Part>
              <BannerFormInner />
            </InfoPage.Part>
            <InfoPage.Part>
              <BasicFormInner />
            </InfoPage.Part>
            <InfoPage.Part title={formatMessage({ id: 'DevelopmentHistory' })}>
              <DevelopmentHistoryFormInner />
            </InfoPage.Part>
            <InfoPage.Part title={formatMessage({ id: 'TeamDescription' })}>
              <TeamDescriptionFormInner />
            </InfoPage.Part>
            <Flex justify="center" gap={12}>
              <SubmitButton>{formatMessage({ id: 'Save' })}</SubmitButton>
              <CancelButton
                onClick={() => {
                  setIsEdit(false);
                }}>
                {formatMessage({ id: 'Cancel' })}
              </CancelButton>
            </Flex>
          </Flex>
        </InfoPage.Part>
      </Form>
    );
  }

  return (
    <InfoPage className={style['company-info']}>
      <InfoPage.Part
        className={style['section']}
        title={formatMessage({ id: 'CompanyInfo' })}
        bordered
        extra={
          hasEdit && (
            <Button
              type="link"
              icon={<FormOutlined />}
              onClick={() => {
                setIsEdit(true);
              }}>
              {formatMessage({ id: 'Edit' })}
            </Button>
          )
        }>
        <CompanyDetail data={data} />
      </InfoPage.Part>
    </InfoPage>
  );
});

CompanyInfo.Detail = CompanyDetail;
CompanyInfo.Banner = Banner;
CompanyInfo.Basic = Basic;
CompanyInfo.DevelopmentHistory = DevelopmentHistory;
CompanyInfo.TeamDescription = TeamDescription;

export default withLocale(CompanyInfo);
