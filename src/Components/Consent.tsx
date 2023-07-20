/* eslint-disable no-case-declarations */
import { agreeConsents, getConsents, getSignature, revokeConsents } from '../utils/consent';
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import useConsentStatus from '../Hooks/useConsentStatus';
import '../style.scss';
import { TermsComponent } from './Terms';
import { ToastContainer, toast } from 'react-toastify';

import yes from '../Assets/yes.svg';
import no from '../Assets/no.svg';
import bg from '../Assets/bg.png';
import privacy from '../Assets/privacy.svg';

import ContentLoader from 'react-content-loader';
import { SSOButton, SSOContextProvider } from 'aesirx-sso';

const ConsentComponent = ({ endpoint }: any) => {
  const [uuid, level, provider, show, setShow, web3ID, handleLevel, showRevoke, handleRevoke] =
    useConsentStatus(endpoint);
  const [consents, setConsents] = useState<number[]>([1, 2]);
  const [loading, setLoading] = useState('done');
  const [showExpandRevoke, setShowExpandRevoke] = useState(false);

  const handleChange = async ({ target: { value } }: any) => {
    if (consents.indexOf(parseInt(value)) === -1) {
      setConsents([...consents, ...[parseInt(value)]]);
    } else {
      setConsents(consents.filter((consent) => consent !== parseInt(value)));
    }
  };

  const handleAgree = async () => {
    try {
      if (level > 2) {
        setLoading('connect');
        const address = await provider.connect();
        setLoading('sign');
        const signature = await getSignature(endpoint, address, provider, 'Give consent:{}');

        setLoading('saving');

        await agreeConsents(endpoint, level, uuid, consents, address, signature, web3ID);
        handleRevoke(true, level);
      } else {
        setLoading('saving');
        consents.forEach(async (consent) => {
          await agreeConsents(endpoint, 1, uuid, consent);
        });
      }

      localStorage.setItem('aesirx-analytics-uuid', uuid);
      localStorage.setItem('aesirx-analytics-allow', '1');

      setShow(false);
      setLoading('done');
    } catch (error) {
      console.log(error);

      setShow(false);
      setLoading('done');
      toast.error(error.message);
    }
  };

  const onGetData = async (response: any) => {
    try {
      setLoading('saving');
      localStorage.setItem('aesirx-analytics-jwt', response?.jwt);
      await agreeConsents(endpoint, level, uuid, consents, null, null, null, response?.jwt);
      setShow(false);
      handleRevoke(true, level);
      setLoading('done');
    } catch (error) {
      console.log(error);
      setShow(false);
      setLoading('done');
      toast.error(error.message);
    }
  };

  const handleNotAllow = () => {
    localStorage.setItem('aesirx-analytics-uuid', uuid);
    localStorage.setItem('aesirx-analytics-allow', '0');
    setShow(false);
  };

  const handleRevokeBtn = async () => {
    const levelRevoke = localStorage.getItem('aesirx-analytics-revoke');
    try {
      if (levelRevoke) {
        if (parseInt(levelRevoke) > 2) {
          setLoading('connect');
          const address = await provider.connect();
          setLoading('sign');
          const signature = await getSignature(endpoint, address, provider, 'Revoke consent:{}');
          setLoading('saving');
          const consentList = await getConsents(endpoint, uuid);
          consentList.forEach(async (consent: any) => {
            !consent?.expiration &&
              (await revokeConsents(
                endpoint,
                levelRevoke,
                consent?.consent_uuid,
                address,
                signature,
                web3ID
              ));
          });
          setLoading('done');
        } else {
          setLoading('saving');
          const consentList = await getConsents(endpoint, uuid);
          consentList.forEach(async (consent: any) => {
            !consent?.expiration &&
              (await revokeConsents(
                endpoint,
                levelRevoke,
                consent?.consent_uuid,
                null,
                null,
                null,
                localStorage.getItem('aesirx-analytics-jwt')
              ));
          });
          localStorage.removeItem('aesirx-analytics-jwt');
          setLoading('done');
        }
      }
      handleRevoke(false);
    } catch (error) {
      console.log(error);
      setLoading('done');
      handleRevoke(false);
      toast.error(error.message);
    }
  };

  console.log('level', uuid, level, web3ID);

  return (
    <div className="aesirx">
      <ToastContainer />
      <div className={`offcanvas-backdrop fade ${show ? 'show' : 'd-none'}`} />
      <div tabIndex={-1} className={`toast-container position-fixed bottom-0 end-0 p-3`}>
        <div
          className={`toast revoke-toast ${
            showRevoke ||
            (localStorage.getItem('aesirx-analytics-revoke') &&
              parseInt(localStorage.getItem('aesirx-analytics-revoke')) > 1)
              ? 'show'
              : ''
          } ${showExpandRevoke ? 'expand' : ''}`}
        >
          <div className="toast-body p-0 ">
            <div className="revoke-wrapper position-relative">
              {!showExpandRevoke && (
                <>
                  <img
                    className="cover-img position-absolute h-100 w-100 object-fit-cover"
                    src={bg}
                  />
                  <div
                    className="revoke-small"
                    onClick={() => {
                      setShowExpandRevoke(true);
                    }}
                  >
                    <img src={privacy} alt="Shield of Privacy" />
                    Shield of Privacy
                  </div>
                </>
              )}

              {showExpandRevoke && (
                <>
                  <div className="p-3 bg-white text">
                    You can revoke consent for your data to be used anytime. Go to{' '}
                    <a
                      href="https://nft.web3id.aesirx.io"
                      className="text-success text-decoration-underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      link
                    </a>{' '}
                    for more information.
                  </div>
                  <div className="rounded-bottom position-relative overflow-hidden text-white">
                    <img
                      className="cover-img position-absolute h-100 w-100 object-fit-cover"
                      src={bg}
                    />
                    <div className="position-relative p-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div className="me-2">
                          <img src={privacy} alt="Shield of Privacy" /> Shield of Privacy
                        </div>
                        {loading === 'done' ? (
                          <Button
                            variant="success"
                            onClick={handleRevokeBtn}
                            className="text-white d-flex align-items-center revoke-btn"
                          >
                            Revoke Consent
                          </Button>
                        ) : loading === 'connect' ? (
                          <Button
                            variant="success"
                            disabled
                            className="d-flex align-items-center text-white"
                          >
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Please connect your Concordium wallet
                          </Button>
                        ) : loading === 'sign' ? (
                          <Button
                            variant="success"
                            disabled
                            className="d-flex align-items-center text-white"
                          >
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Please sign the message on your wallet twice and wait for it to be
                            saved.
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            disabled
                            className="d-flex align-items-center text-white"
                          >
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Saving...
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div tabIndex={-1} className={`toast-container position-fixed bottom-0 end-0 p-3`}>
        <div className={`toast ${show ? 'show' : ''}`}>
          <SSOContextProvider>
            <div className="toast-body p-0">
              {level ? (
                <TermsComponent level={level} handleLevel={handleLevel}>
                  <Form>
                    <Form.Check
                      checked={consents.includes(1)}
                      type="switch"
                      label="Personal data share consent."
                      value={1}
                      onChange={handleChange}
                      className="d-none"
                    />
                    <Form.Check
                      checked={consents.includes(2)}
                      type="switch"
                      label="Personal data cross site share consent."
                      value={2}
                      onChange={handleChange}
                      className="d-none"
                    />
                    <div className="d-flex mt-2 justify-content-end">
                      {loading === 'done' ? (
                        <>
                          {level === 2 ? (
                            <div className="ssoBtnWrapper me-1 bg-success">
                              <SSOButton
                                className="btn btn-success text-white d-flex align-items-center"
                                text={
                                  <>
                                    <img src={yes} className="me-2" />
                                    Yes, I consent
                                  </>
                                }
                                ssoState={'noscopes'}
                                onGetData={onGetData}
                              />
                            </div>
                          ) : (
                            <Button
                              variant="success"
                              onClick={handleAgree}
                              className="me-1 text-white d-flex align-items-center"
                            >
                              <img src={yes} className="me-2" />
                              Yes, I consent
                            </Button>
                          )}

                          <Button
                            variant="secondary"
                            onClick={handleNotAllow}
                            className="text-white d-flex align-items-center"
                          >
                            <img src={no} className="me-2" />
                            Reject Consent
                          </Button>
                        </>
                      ) : loading === 'connect' ? (
                        <Button
                          variant="success"
                          disabled
                          className="d-flex align-items-center text-white"
                        >
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Please connect your Concordium wallet
                        </Button>
                      ) : loading === 'sign' ? (
                        <Button
                          variant="success"
                          disabled
                          className="d-flex align-items-center text-white"
                        >
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Please sign the message on your wallet twice and wait for it to be saved.
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          disabled
                          className="d-flex align-items-center text-white"
                        >
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </Button>
                      )}
                    </div>
                  </Form>
                </TermsComponent>
              ) : (
                <div className="p-4">
                  <ContentLoader
                    speed={2}
                    width={340}
                    height={84}
                    viewBox="0 0 340 84"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                  >
                    <rect x="0" y="0" rx="3" ry="3" width="67" height="11" />
                    <rect x="76" y="0" rx="3" ry="3" width="140" height="11" />
                    <rect x="127" y="48" rx="3" ry="3" width="53" height="11" />
                    <rect x="187" y="48" rx="3" ry="3" width="72" height="11" />
                    <rect x="18" y="48" rx="3" ry="3" width="100" height="11" />
                    <rect x="0" y="71" rx="3" ry="3" width="37" height="11" />
                    <rect x="18" y="23" rx="3" ry="3" width="140" height="11" />
                    <rect x="166" y="23" rx="3" ry="3" width="173" height="11" />
                  </ContentLoader>
                </div>
              )}
            </div>
          </SSOContextProvider>
        </div>
      </div>
    </div>
  );
};

export default ConsentComponent;
