import React, { useEffect } from 'react';
import bg from '../Assets/bg.png';
import privacy from '../Assets/privacy.svg';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';

interface Props {
  show: boolean;
  handleClose: () => void;
}
declare global {
  interface Window {
    funcAfterPaymentConsent: any;
  }
}
const PaymentConsent = ({ show = false, handleClose }: Props) => {
  const { t } = useTranslation();

  const handleConsent = () => {
    sessionStorage.setItem('aesirx-analytics-payment', 'true');
    window?.funcAfterPaymentConsent && window.funcAfterPaymentConsent();
    handleClose();
  };

  useEffect(() => {
    if (sessionStorage.getItem('aesirx-analytics-payment') === 'true') {
      window.funcAfterPaymentConsent && window.funcAfterPaymentConsent();
    }
  }, []);

  return (
    <div className="aesirxconsent">
      <div
        tabIndex={-1}
        className={`toast-container position-fixed m-md-3 ${
          show ? 'top-50 start-50 translate-middle' : 'bottom-0 end-0 opacity-0'
        }`}
      >
        <div className={`toast payment-consent ${show ? 'show' : ''} custom`}>
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
                <p className="fw-semibold lh-160 text-primary mb-2">{t('txt_payment_notice')}</p>
                <div className="text-primary lh-160">
                  {t('txt_payment_1')}
                  <br />
                  <br />
                  <div
                    dangerouslySetInnerHTML={{
                      __html: t('txt_payment_2', {
                        interpolation: { escapeValue: false },
                      }),
                    }}
                  />
                  <br />
                  {t('txt_payment_3')}
                  <br />
                  <br />
                  <div
                    dangerouslySetInnerHTML={{
                      __html: t('txt_payment_4', {
                        interpolation: { escapeValue: false },
                      }),
                    }}
                  />
                </div>
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
  );
};

export default PaymentConsent;
