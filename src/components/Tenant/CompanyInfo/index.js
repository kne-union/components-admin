import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, Flex } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import { useState } from 'react';
import DevelopmentHistory, { FormInner as DevelopmentHistoryFormInner } from './DevelopmentHistory';
import Basic, { FormInner as BasicFormInner } from './Basic';
import Banner, { FormInner as BannerFormInner } from './Banner';
import TeamDescription, { FormInner as TeamDescriptionFormInner } from './TeamDescription';
import style from './style.module.scss';

const CompanyDetail = createWithRemoteLoader({
  modules: ['components-core:InfoPage']
})(({ remoteModules, data }) => {
  const [InfoPage] = remoteModules;

  return (
    <>
      <Banner data={data} />
      <InfoPage.Part>
        <Basic data={data} />
      </InfoPage.Part>
      <InfoPage.Part title="发展历程">
        <DevelopmentHistory data={data} />
      </InfoPage.Part>
      <InfoPage.Part title="团队介绍">
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
        <InfoPage.Part title="公司信息" className={style['section']}>
          <Flex gap={24} vertical>
            <InfoPage.Part>
              <BannerFormInner />
            </InfoPage.Part>
            <InfoPage.Part>
              <BasicFormInner />
            </InfoPage.Part>
            <InfoPage.Part title="发展历程">
              <DevelopmentHistoryFormInner />
            </InfoPage.Part>
            <InfoPage.Part title="团队介绍">
              <TeamDescriptionFormInner />
            </InfoPage.Part>
            <Flex justify="center" gap={12}>
              <SubmitButton>保存</SubmitButton>
              <CancelButton
                onClick={() => {
                  setIsEdit(false);
                }}>
                取消
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
        title="公司信息"
        extra={
          hasEdit && (
            <Button
              type="link"
              icon={<FormOutlined />}
              onClick={() => {
                setIsEdit(true);
              }}>
              编辑
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

export default CompanyInfo;
