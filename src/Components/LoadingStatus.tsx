import React from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LoadingStatus = ({ loading }: any) => {
  const { t } = useTranslation();

  return (
    <>
      {loading === 'connect' ? (
        <div className="loading-status">
          <Button
            variant="dark"
            disabled
            className="d-flex align-items-center justify-content-center text-white w-100"
          >
            <span
              className="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            <span className="text">
              {(window as any)?.aesirx_analytics_translate?.txt_please_connect ??
                t('txt_please_connect')}
            </span>
          </Button>
        </div>
      ) : loading === 'sign' ? (
        <div className="loading-status">
          <Button
            variant="dark"
            disabled
            className="d-flex align-items-center justify-content-center text-white w-100"
          >
            <span
              className="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            <span className="text">
              {(window as any)?.aesirx_analytics_translate?.txt_please_sign ?? t('txt_please_sign')}
            </span>
          </Button>
        </div>
      ) : loading === 'saving' ? (
        <div className="loading-status">
          <Button
            variant="dark"
            disabled
            className="d-flex align-items-center justify-content-center text-white w-100"
          >
            <span
              className="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            <span className="text">
              {(window as any)?.aesirx_analytics_translate?.txt_saving ?? t('txt_saving')}
            </span>
          </Button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export { LoadingStatus };
