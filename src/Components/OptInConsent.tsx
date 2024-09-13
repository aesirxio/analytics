import React, { useEffect, useState } from 'react';
import bg from '../Assets/bg.png';
import no from '../Assets/no.svg';
import privacy from '../Assets/privacy.svg';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'react-bootstrap';
import { trackEvent } from '../utils';

interface Props {
  optInConsentData?: any;
}
declare global {
  interface Window {
    funcAfterOptInConsent: any;
    funcAfterRejectOptIn: any;
    optInConsentData: any;
  }
}

const endpoint =
  typeof window !== 'undefined' && window['aesirx1stparty']
    ? window['aesirx1stparty']
    : process?.env?.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL
    ? process?.env?.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL
    : process?.env?.REACT_APP_ENDPOINT_ANALYTICS_URL
    ? process?.env?.REACT_APP_ENDPOINT_ANALYTICS_URL
    : '';
const OptInConsent = ({
  optInConsentData = window?.optInConsentData ? JSON.parse(window?.optInConsentData) : [],
}: Props) => {
  const optInReplace = optInConsentData?.find((obj: any) => obj.replaceAnalyticsConsent);
  const { t } = useTranslation();
  const [showExpandRevoke, setShowExpandRevoke] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);
  const [revokeConsentOption, setRevokeConsentOption] = useState<string>(
    optInReplace?.title
      ? `aesirx-analytics-optin-${optInReplace?.title}`
      : 'aesirx-analytics-optin-default'
  );

  const optInRevokes = Object.keys(sessionStorage)
    .filter((key) => key.startsWith('aesirx-analytics-optin'))
    .map((key) => key);
  useEffect(() => {
    if (
      optInRevokes?.includes('aesirx-analytics-optin-default') ||
      optInRevokes?.includes(`aesirx-analytics-optin-${optInReplace?.title}`)
    ) {
      setShowRevoke(true);
    }
  });
  return (
    <>
      {optInConsentData?.map((optIn: any, key: any) => (
        <React.Fragment key={key}>
          <OptIntConsentDetail optIn={optIn} setShowRevoke={setShowRevoke} />
        </React.Fragment>
      ))}
      {optInReplace && (
        <div className="aesirxconsent">
          <div
            tabIndex={-1}
            className={`toast-container position-fixed m-md-3 ${
              showExpandRevoke ? 'top-50 start-50 translate-middle' : 'bottom-0 end-0'
            }`}
          >
            <div
              className={`toast revoke-toast custom ${showRevoke ? 'show' : ''} ${
                showExpandRevoke ? '' : 'minimize'
              }`}
            >
              <div className="toast-body p-0 shadow mx-1 mx-md-0 mb-2 mb-md-0">
                <div
                  className={`revoke-wrapper minimize-shield-wrapper position-relative ${
                    showExpandRevoke ? 'bg-white' : ''
                  }`}
                >
                  {!showExpandRevoke && (
                    <>
                      <img
                        className="cover-img position-absolute h-100 w-100 object-fit-cover"
                        src={bg}
                        alt="Background Image"
                      />
                      <div
                        className="minimize-shield"
                        onClick={() => {
                          setShowExpandRevoke(true);
                        }}
                      >
                        <img src={privacy} alt="SoP Icon" />
                        {(window as any)?.aesirx_analytics_translate?.txt_shield_of_privacy ??
                          t('txt_shield_of_privacy')}
                      </div>
                    </>
                  )}

                  {showExpandRevoke && (
                    <>
                      <div
                        className={`d-flex rounded-top align-items-center justify-content-between p-2 p-lg-3 fw-medium flex-wrap py-2 py-lg-3 px-4 header-consent-bg`}
                        style={{
                          borderBottom: '1px solid #DEDEDE',
                        }}
                      >
                        <div className="text-primary text-nowrap">
                          {(window as any)?.aesirx_analytics_translate?.txt_tracking_data_privacy ??
                            t('txt_tracking_data_privacy')}
                        </div>
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
                      <div
                        className="minimize-revoke"
                        onClick={() => {
                          setShowExpandRevoke(false);
                        }}
                      >
                        <img src={no} alt="No Icon" />
                      </div>
                      <div className="p-3 bg-white">
                        {(window as any)?.aesirx_analytics_translate?.txt_you_can_revoke ??
                          t('txt_you_can_revoke')}
                      </div>
                      <Form className="mb-0 w-100 bg-white px-3">
                        {optInRevokes?.map((item, key) => {
                          return (
                            <Form.Check
                              key={key}
                              id={`option-revoke-${item}`}
                              checked={revokeConsentOption === item}
                              type="checkbox"
                              label={
                                item === 'aesirx-analytics-optin-default'
                                  ? (window as any)?.aesirx_analytics_translate
                                      ?.txt_revoke_opt_in ?? t('txt_revoke_opt_in')
                                  : (window as any)?.aesirx_analytics_translate
                                      ?.txt_revoke_opt_in ??
                                    t('txt_revoke_opt_in') +
                                      ' ' +
                                      item?.replace('aesirx-analytics-optin-', '')
                              }
                              value={item}
                              onChange={({ target: { value } }) => {
                                setRevokeConsentOption(value);
                              }}
                            />
                          );
                        })}
                      </Form>

                      <div className="rounded-bottom position-relative overflow-hidden bg-white">
                        <div className="position-relative p-3">
                          <div className="d-flex align-items-center flex-wrap">
                            <div className="d-flex align-items-center w-100 justify-content-end">
                              <a
                                className="manage-consent fs-14 btn btn-outline-success rounded-pill py-2 py-lg-3 d-flex align-items-center justify-content-center w-100 w-lg-35"
                                href="https://dapp.shield.aesirx.io/revoke-consent"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {(window as any)?.aesirx_analytics_translate?.txt_manage_consent ??
                                  t('txt_manage_consent')}
                              </a>
                              <Button
                                variant="outline-success"
                                onClick={async () => {
                                  if (revokeConsentOption) {
                                    sessionStorage.removeItem(revokeConsentOption);
                                    setShowExpandRevoke(false);
                                    if (
                                      revokeConsentOption ===
                                        `aesirx-analytics-optin-${optInReplace?.title}` ||
                                      revokeConsentOption === 'aesirx-analytics-optin-default'
                                    ) {
                                      setTimeout(() => {
                                        window.location.reload();
                                      }, 1000);
                                    }
                                  }
                                }}
                                className={
                                  'd-flex align-items-center justify-content-center w-100 w-lg-35 revoke-btn fs-14 rounded-pill py-2 py-lg-3'
                                }
                              >
                                {(window as any)?.aesirx_analytics_translate?.txt_revoke_consent ??
                                  t('txt_revoke_consent')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const OptIntConsentDetail = ({ optIn, setShowRevoke }: any) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(true);
  const [showExpandConsent, setShowExpandConsent] = useState(true);
  const handleConsent = () => {
    setShow(false);
    setShowBackdrop(false);
    sessionStorage.setItem(
      optIn?.title ? `aesirx-analytics-optin-${optIn?.title}` : 'aesirx-analytics-optin-default',
      'true'
    );
    if (optIn?.replaceAnalyticsConsent) {
      setShowRevoke(true);
    }
    optIn?.handleConsent && optIn?.handleConsent();
    window?.funcAfterOptInConsent && window.funcAfterOptInConsent();
    window?.optInConsentData &&
      document.querySelector(`.opt-in-consent.${optIn?.title}`).classList.remove('show');
    const hostUrl = endpoint ? endpoint : '';
    const root = hostUrl ? hostUrl.replace(/\/$/, '') : '';
    root &&
      trackEvent(root, '', {
        event_name: 'Opt-in consent',
        event_type: 'opt-in-consent',
      });
  };

  const handleClose = () => {
    setShow(false);
    setShowBackdrop(false);
    if (optIn?.replaceAnalyticsConsent) {
      setShowExpandConsent(false);
      sessionStorage.setItem('aesirx-analytics-rejected', 'true');
    }
    optIn?.handleReject && optIn?.handleReject();
    window.funcAfterRejectOptIn && window.funcAfterRejectOptIn();
    window?.optInConsentData &&
      document.querySelector(`.opt-in-consent.${optIn?.title}`).classList.remove('show');
  };

  useEffect(() => {
    if (
      sessionStorage.getItem(`aesirx-analytics-optin-${optIn?.title}`) === 'true' ||
      sessionStorage.getItem('aesirx-analytics-optin-default') === 'true'
    ) {
      window.funcAfterOptInConsent && window.funcAfterOptInConsent();
    }
    if (optIn?.replaceAnalyticsConsent === 'true') {
      if (sessionStorage.getItem('aesirx-analytics-rejected') === 'true') {
        setShow(false);
        setShowExpandConsent(false);
      } else if (sessionStorage.getItem(`aesirx-analytics-optin-${optIn?.title}`) !== 'true') {
        setShow(true);
      }
    }
  }, []);
  useEffect(() => {
    if (optIn?.show) {
      setShow(true);
    }
  }, [optIn]);
  return (
    <>
      {(show || optIn?.replaceAnalyticsConsent || window?.optInConsentData) && (
        <div
          className={`aesirxconsent opt-in-consent ${optIn?.title ?? ''} ${show ? 'show' : ''} ${
            showExpandConsent ? '' : 'show-minimize'
          }`}
        >
          <div className={`offcanvas-backdrop fade ${showBackdrop && show ? 'show' : 'd-none'}`} />
          <div
            tabIndex={-1}
            className={`toast-container position-fixed m-md-3 ${show ? '' : 'opacity-0'}`}
          >
            <div
              className={`toast ${show ? 'show' : ''} custom ${
                showExpandConsent ? '' : 'minimize'
              }`}
            >
              <div className="toast-body p-0 shadow mx-3 mx-md-0">
                {!showExpandConsent && optIn?.replaceAnalyticsConsent ? (
                  <>
                    <div className="minimize-shield-wrapper position-relative">
                      <img
                        className="cover-img position-absolute h-100 w-100 object-fit-cover"
                        src={bg}
                        alt="Background Image"
                      />
                      <div
                        className="minimize-shield"
                        onClick={() => {
                          setShow(true);
                          setShowExpandConsent(true);
                          sessionStorage.removeItem('aesirx-analytics-rejected');
                        }}
                      >
                        <img src={privacy} alt="SoP Icon" />
                        {(window as any)?.aesirx_analytics_translate?.txt_shield_of_privacy ??
                          t('txt_shield_of_privacy')}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white">
                    <div
                      className={`d-flex rounded-top align-items-center justify-content-between p-2 p-lg-3 fw-medium flex-wrap py-2 py-lg-3 px-4 header-consent-bg`}
                      style={{
                        borderBottom: '1px solid #DEDEDE',
                      }}
                    >
                      <div className="text-primary text-nowrap">
                        {(window as any)?.aesirx_analytics_translate?.txt_tracking_data_privacy ??
                          t('txt_tracking_data_privacy')}
                      </div>
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
                    <div className="p-4 pt-3 pb-0 bg-white">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: optIn?.content ?? '',
                        }}
                      />
                    </div>
                    <div className="rounded-bottom position-relative overflow-hidden text-white bg-white">
                      <div className="position-relative pt-2 pt-lg-3 p-3">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                          <Button
                            onClick={handleClose}
                            variant="outline-success"
                            className="border-2 fs-7 fw-bold text-primary rounded-pill"
                          >
                            {(window as any)?.aesirx_analytics_translate?.txt_reject_consent ??
                              t('txt_reject_consent')}
                          </Button>
                          <Button
                            onClick={handleConsent}
                            variant="outline-success"
                            className="border-2 fs-7 fw-bold text-primary rounded-pill"
                          >
                            {(window as any)?.aesirx_analytics_translate?.txt_yes_i_consent ??
                              t('txt_yes_i_consent')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OptInConsent;
