import React from 'react';
import bg from '../Assets/bg.png';
import privacy from '../Assets/privacy.svg';
import { useTranslation } from 'react-i18next';
import { useI18nextContext } from '../utils/I18nextProvider';
import Select, { StylesConfig } from 'react-select';
import i18n from 'i18next';

const ConsentHeader = ({ isRejectedLayout, languageSwitcher }: any) => {
  const { t } = useTranslation();
  const { listLanguages } = useI18nextContext();
  const currentLanguage = listLanguages.filter(
    (lang: any) => lang.value == i18n.language || i18n.language?.includes(lang.value)
  );
  const customStyles: StylesConfig = {
    menuList: (base) => ({
      ...base,
      maxHeight: '160px',
    }),
  };
  return (
    <div
      className={`rounded-top align-items-center justify-content-between p-2 p-lg-3 fw-medium flex-wrap py-2 py-lg-3 px-lg-4 header-consent-bg ${
        isRejectedLayout ? 'd-none' : 'd-flex'
      }`}
      style={{
        borderBottom: '1px solid #DEDEDE',
      }}
    >
      <div className="text-primary text-nowrap">
        {(window as any)?.aesirx_analytics_translate?.txt_tracking_data_privacy ??
          t('txt_tracking_data_privacy')}
      </div>
      {languageSwitcher ? (
        <div className="language-switcher ms-auto me-2 d-flex align-items-center fs-14">
          <Select
            styles={customStyles}
            components={{
              IndicatorSeparator: () => null,
            }}
            isClearable={false}
            isSearchable={false}
            placeholder={t('txt_select')}
            options={listLanguages}
            className="shadow-none"
            onChange={(data: any) => {
              i18n.changeLanguage(data.value);
            }}
            defaultValue={
              currentLanguage?.length ? currentLanguage : [{ label: 'English', value: 'en' }]
            }
          />
        </div>
      ) : (
        <></>
      )}
      <div className="d-flex align-items-center fs-14 text-primary">
        <a
          href="https://shield.aesirx.io/"
          rel="noreferrer"
          target="_blank"
          className="minimize-shield-wrapper position-relative text-decoration-none"
        >
          <img
            className="cover-img position-absolute h-100 w-100 object-fit-cover z-1"
            src={bg}
            alt="Background Image"
          />
          <div className="minimize-shield position-relative z-2 py-2">
            <img src={privacy} alt="SoP Icon" />
            {(window as any)?.aesirx_analytics_translate?.txt_shield_of_privacy ??
              t('txt_shield_of_privacy')}
          </div>
        </a>
      </div>
    </div>
  );
};
export default ConsentHeader;
