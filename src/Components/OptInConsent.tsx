import React, { useEffect, useState } from 'react';
import bg from '../Assets/bg.png';
import privacy from '../Assets/privacy.svg';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';

interface Props {
  optInConsent?: string;
  optInConsentTitle?: string;
  optInReplaceAnalyticsConsent?: string;
}
declare global {
  interface Window {
    funcAfterOptInConsent: any;
    optInConsent: any;
    optInConsentTitle: any;
    optInReplaceAnalyticsConsent: any;
  }
}
const OptInConsent = ({
  optInConsent = window?.optInConsent,
  optInConsentTitle = window?.optInConsentTitle,
  optInReplaceAnalyticsConsent = window?.optInReplaceAnalyticsConsent,
}: Props) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const handleConsent = () => {
    sessionStorage.setItem(optInConsentTitle, 'true');
    window?.funcAfterOptInConsent && window.funcAfterOptInConsent();
    setShow(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  useEffect(() => {
    if (sessionStorage.getItem(optInConsentTitle) === 'true') {
      window.funcAfterOptInConsent && window.funcAfterOptInConsent();
    }
    if (optInReplaceAnalyticsConsent) {
      setShow(true);
    }
  }, []);

  return (
    <>
      {optInConsent && (
        <div className={`aesirxconsent opt-in-consent ${show ? 'show' : ''}`}>
          <div tabIndex={-1} className={`toast-container position-fixed m-md-3 `}>
            <div className={`toast ${show ? 'show' : ''} custom`}>
              <div className="toast-body p-0 shadow mx-3 mx-md-0">
                <div className="bg-white">
                  <div
                    className={`d-flex rounded-top align-items-center justify-content-between p-2 p-lg-3 fw-medium flex-wrap py-2 py-lg-3 px-4 header-consent-bg`}
                    style={{
                      borderBottom: '1px solid #DEDEDE',
                    }}
                  >
                    <div className="text-primary text-nowrap">{t('txt_tracking_data_privacy')}</div>
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
                        />
                        <div className="minimize-shield position-relative z-2 py-2">
                          <img src={privacy} alt="Shield of Privacy" />
                          {t('txt_shield_of_privacy')}
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className="p-4 pt-3 pb-0 bg-white">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: optInConsent,
                      }}
                    />
                  </div>
                  <div className="rounded-bottom position-relative overflow-hidden text-white bg-white">
                    <div className="position-relative pt-2 pt-lg-3 p-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <Button
                          onClick={handleClose}
                          variant="outline-success"
                          className="border-2 fs-7 fw-bold text-primary rounded-pill py-13px px-5rem"
                        >
                          {t('txt_reject_consent')}
                        </Button>
                        <Button
                          onClick={handleConsent}
                          variant="outline-success"
                          className="border-2 fs-7 fw-bold text-primary rounded-pill py-13px px-5rem"
                        >
                          {t('txt_yes_i_consent')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OptInConsent;
