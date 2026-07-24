import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';
import {
  buildReviewFormList,
  getDefaultReviewFormData,
  requestReview
} from './reviewHelpers';
import ReviewEntriesPreview from './ReviewEntriesPreview';
import { enrichReviewEntries } from './enrichReviewEntries';

const Review = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:FormInfo', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data, onSuccess, apis, options, getFormInner, fetchOptions, ...props }) => {
    const [useFormModal, FormInfo, usePreset] = remoteModules;
    const formModal = useFormModal();
    const { ajax, apis: presetApis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();

    return (
      <Button
        {...props}
        onClick={async () => {
          const entries = await enrichReviewEntries({
            ajax,
            listApi: presetApis?.intlAdmin?.langLib?.list,
            entries: [data]
          });
          formModal({
            title: formatMessage({ id: 'Review' }),
            size: 'default',
            formProps: {
              data: getDefaultReviewFormData(),
              onSubmit: async formData => {
                const resData = await requestReview({ ajax, apis, ids: data.id, formData });
                if (resData.code !== 0) {
                  return false;
                }
                message.success(formatMessage({ id: 'ReviewSuccess' }));
                onSuccess && onSuccess();
              }
            },
            children: (
              <>
                <ReviewEntriesPreview entries={entries} formatMessage={formatMessage} />
                <FormInfo column={1} list={buildReviewFormList({ FormInfo, formatMessage })} />
              </>
            )
          });
        }}
      />
    );
  })
);

export default Review;
