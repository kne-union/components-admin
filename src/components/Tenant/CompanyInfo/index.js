import '@kne/timeline/dist/index.css';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, Flex } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import { useState } from 'react';
import DevelopmentHistory, { FormInner as DevelopmentHistoryFormInner } from './DevelopmentHistory';
import Basic, { FormInner as BasicFormInner } from './Basic';
import Banner from './Banner';
import TeamDescription, { FormInner as TeamDescriptionFormInner } from './TeamDescription';
import withLocale from '../withLocale';
import { useIntl } from '@kne/react-intl';
import style from './style.module.scss';

const CompanyDetail = createWithRemoteLoader({
  modules: ['components-core:InfoPage']
})(({ remoteModules, data }) => {
  const [InfoPage] = remoteModules;
  const { formatMessage } = useIntl();
  const hasDevelopmentHistory = data.developmentHistory && data.developmentHistory.length > 0;
  const hasTeamDescription = data.teamDescription && data.teamDescription.length > 0;
  return (
    <Flex vertical gap={24} className={style.detailStack}>
      <InfoPage.Part>
        <Basic data={data} />
      </InfoPage.Part>
      {hasDevelopmentHistory && (
        <InfoPage.Part title={formatMessage({ id: 'DevelopmentHistory' })}>
          <DevelopmentHistory data={data} />
        </InfoPage.Part>
      )}
      {hasTeamDescription && (
        <InfoPage.Part title={formatMessage({ id: 'TeamDescription' })}>
          <TeamDescription data={data} />
        </InfoPage.Part>
      )}
    </Flex>
  );
});

const CompanyInfo = createWithRemoteLoader({
  modules: ['components-core:InfoPage', 'components-core:FormInfo', 'components-core:ButtonGroup@ButtonFooter']
})(
  withLocale(({ remoteModules, data, onSubmit, hasEdit = true, apis }) => {
    const [InfoPage, FormInfo, ButtonFooter] = remoteModules;
    const [isEdit, setIsEdit] = useState(false);
    const { formatMessage } = useIntl();

    const { Form, SubmitButton, CancelButton } = FormInfo;

    if (isEdit) {
      return (
        <Form
          className={style['company-info']}
          type="inner"
          data={data}
          onSubmit={async formData => {
            // 表单默认 filterEmpty 会丢掉空数组，导致清空列表字段时后端按 patch 语义跳过更新
            const payload = Object.assign({}, formData, {
              banners: formData.banners || [],
              companyTags: formData.companyTags || [],
              developmentHistory: formData.developmentHistory || [],
              teamDescription: formData.teamDescription || []
            });
            if ((await onSubmit(payload)) === false) {
              return;
            }
            setIsEdit(false);
          }}>
          <Flex vertical gap={24} className={style.detailStack}>
            <BasicFormInner />
            <DevelopmentHistoryFormInner />
            <TeamDescriptionFormInner />
            <ButtonFooter className={style.formActions} innerClassName={style.formActionsInner}>
              <Flex justify="center" gap={12} className={style.formActionsRow}>
                <CancelButton
                  onClick={() => {
                    setIsEdit(false);
                  }}>
                  {formatMessage({ id: 'Cancel' })}
                </CancelButton>
                <SubmitButton type="primary">{formatMessage({ id: 'Save' })}</SubmitButton>
              </Flex>
            </ButtonFooter>
          </Flex>
        </Form>
      );
    }

    return (
      <InfoPage className={style['company-info']}>
        <InfoPage.Part
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
  })
);

CompanyInfo.Detail = CompanyDetail;
CompanyInfo.Banner = Banner;
CompanyInfo.Basic = Basic;
CompanyInfo.DevelopmentHistory = DevelopmentHistory;
CompanyInfo.TeamDescription = TeamDescription;

export default CompanyInfo;
