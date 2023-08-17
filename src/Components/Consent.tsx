/* eslint-disable no-case-declarations */
import { agreeConsents, getConsents, getSignature, revokeConsents } from '../utils/consent';
import React, { useContext, useEffect, useState } from 'react';
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
import { SSOButton } from 'aesirx-sso';
import {
  MAINNET,
  WithWalletConnector,
  WalletConnectionProps,
  useConnection,
  useConnect,
  ConnectorType,
} from '@concordium/react-components';
import { WALLET_CONNECT } from '../Hooks/config';
import { OsTypes, isMobile, osName } from 'react-device-detect';
import { LoadingStatus } from './LoadingStatus';
import ConnectModal from './Connect';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
interface WalletConnectionPropsExtends extends WalletConnectionProps {
  endpoint: string;
}
const ConsentComponent = ({ endpoint }: any) => {
  return (
    <WithWalletConnector network={MAINNET}>
      {(props) => <ConsentComponentApp {...props} endpoint={endpoint} />}
    </WithWalletConnector>
  );
};
const ConsentComponentApp = (props: WalletConnectionPropsExtends) => {
  const {
    endpoint,
    activeConnectorType,
    activeConnector,
    activeConnectorError,
    connectedAccounts,
    genesisHashes,
    setActiveConnectorType,
  } = props;

  const { setConnection } = useConnection(connectedAccounts, genesisHashes);

  const { isConnecting } = useConnect(activeConnector, setConnection);

  const handleOnConnect = async (connectorType: ConnectorType) => {
    await setActiveConnectorType(connectorType);
    setLoading('done');
  };

  const [
    uuid,
    level,
    connection,
    account,
    show,
    setShow,
    web3ID,
    handleLevel,
    showRevoke,
    handleRevoke,
    showConnectModal,
  ] = useConsentStatus(endpoint, props);

  const [consents, setConsents] = useState<number[]>([1, 2]);
  const [loading, setLoading] = useState('done');
  const [showExpandConsent, setShowExpandConsent] = useState(true);
  const [showExpandRevoke, setShowExpandRevoke] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(true);
  const analyticsContext = useContext(AnalyticsContext);

  const handleChange = async ({ target: { value } }: any) => {
    if (consents.indexOf(parseInt(value)) === -1) {
      setConsents([...consents, ...[parseInt(value)]]);
    } else {
      setConsents(consents.filter((consent) => consent !== parseInt(value)));
    }
  };

  const handleAgree = async () => {
    try {
      let flag = true;
      // Wallets
      if (level > 2) {
        if (account) {
          const signature = await getSignature(endpoint, account, connection, 'Give consent:{}');

          setLoading('saving');

          await agreeConsents(endpoint, level, uuid, consents, account, signature, web3ID);
        } else {
          setLoading('connect');
          flag = false;
        }
      } else {
        setLoading('saving');
        const consentList = await getConsents(endpoint, analyticsContext.visitor_uuid);
        consents.forEach(async (consent) => {
          const existConsent = consentList.find((item: any) => item?.consent === consent);
          if (!existConsent) {
            await agreeConsents(endpoint, 1, uuid, consent);
          } else if (
            !!existConsent?.consent_uuid &&
            existConsent?.expiration &&
            new Date(existConsent.expiration) < new Date()
          ) {
            await agreeConsents(endpoint, 1, uuid, consent);
          }
        });
      }

      if (flag) {
        sessionStorage.setItem('aesirx-analytics-uuid', uuid);
        sessionStorage.setItem('aesirx-analytics-allow', '1');

        setShow(false);
        setLoading('done');
        handleRevoke(true, level);
        setShowBackdrop(false);
      }
    } catch (error) {
      console.log(error);
      handleNotAllow();

      setLoading('done');
      toast.error(error?.response?.data?.error ?? error.message);
    }
  };

  const onGetData = async (response: any) => {
    try {
      setLoading('saving');
      sessionStorage.setItem('aesirx-analytics-jwt', response?.jwt);
      await agreeConsents(endpoint, level, uuid, consents, null, null, null, response?.jwt);
      setShow(false);
      handleRevoke(true, level);
      setLoading('done');
    } catch (error) {
      console.log(error);
      setShow(false);
      setLoading('done');
      toast.error(error?.response?.data?.error ?? error.message);
    }
  };

  const handleNotAllow = () => {
    sessionStorage.setItem('aesirx-analytics-uuid', uuid);
    sessionStorage.setItem('aesirx-analytics-rejected', 'true');
    setShowExpandConsent(false);
    setShowBackdrop(false);
  };

  const handleRevokeBtn = async () => {
    const levelRevoke = sessionStorage.getItem('aesirx-analytics-revoke');
    try {
      let flag = true;

      if (levelRevoke !== '1') {
        if (parseInt(levelRevoke) > 2) {
          if (account) {
            setLoading('sign');
            const signature = await getSignature(
              endpoint,
              account,
              connection,
              'Revoke consent:{}'
            );
            setLoading('saving');
            const consentList = await getConsents(endpoint, uuid);
            consentList.forEach(async (consent: any) => {
              !consent?.expiration &&
                (await revokeConsents(
                  endpoint,
                  levelRevoke,
                  consent?.consent_uuid,
                  account,
                  signature,
                  web3ID
                ));
            });
            setLoading('done');
            handleRevoke(false);
          } else {
            setLoading('connect');
            flag = false;
          }
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
                sessionStorage.getItem('aesirx-analytics-jwt')
              ));
          });
          setLoading('done');
          handleRevoke(false);
        }

        if (flag) {
          setShowExpandConsent(false);
          setShow(true);
          setShowBackdrop(false);
          sessionStorage.removeItem('aesirx-analytics-allow');
        }
      } else {
        handleRevoke(false);
        setShowExpandConsent(false);
        setShow(true);
        setShowBackdrop(false);
        sessionStorage.removeItem('aesirx-analytics-allow');
      }
    } catch (error) {
      console.log(error);
      setLoading('done');
      toast.error(error?.response?.data?.error ?? error.message);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('aesirx-analytics-rejected') === 'true') {
      setShowBackdrop(false);
      setShowExpandConsent(false);
    }
  }, []);

  console.log('level', uuid, level, web3ID, account, loading);

  return (
    <div className="aesirxconsent">
      <ToastContainer />
      <div className={`offcanvas-backdrop fade ${showBackdrop && show ? 'show' : 'd-none'}`} />
      <div tabIndex={-1} className={`toast-container position-fixed bottom-0 end-0 p-3`}>
        <div
          className={`toast revoke-toast ${
            showRevoke ||
            (sessionStorage.getItem('aesirx-analytics-revoke') &&
              sessionStorage.getItem('aesirx-analytics-revoke') !== '0')
              ? 'show'
              : ''
          } ${showExpandRevoke ? '' : 'minimize'}`}
        >
          <LoadingStatus loading={loading} />
          <div className="toast-body p-0 ">
            <div className="revoke-wrapper minimize-shield-wrapper position-relative">
              {!showExpandRevoke && (
                <>
                  <img
                    className="cover-img position-absolute h-100 w-100 object-fit-cover"
                    src={bg}
                  />
                  <div
                    className="minimize-shield"
                    onClick={() => {
                      if (
                        osName !== OsTypes?.IOS &&
                        isMobile &&
                        !connection &&
                        sessionStorage.getItem('aesirx-analytics-revoke') &&
                        parseInt(sessionStorage.getItem('aesirx-analytics-revoke')) > 2
                      ) {
                        setActiveConnectorType(WALLET_CONNECT);
                      }
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
                  <div
                    className="minimize-revoke"
                    onClick={() => {
                      setShowExpandRevoke(false);
                    }}
                  >
                    <img src={no} />
                  </div>
                  <div className="p-3 bg-white text">
                    You can revoke your consent for data usage at any time. <br />
                    Go to{' '}
                    <a
                      href="https://nft.shield.aesirx.io"
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
                        <div className="d-flex align-items-center">
                          <a
                            className="text-success text-decoration-underline manage-consent"
                            href="https://dapp.shield.aesirx.io/revoke-consent"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Manage Consent
                          </a>
                          {loading === 'done' ? (
                            <Button
                              variant="success"
                              onClick={handleRevokeBtn}
                              className={'text-white d-flex align-items-center revoke-btn'}
                            >
                              Revoke Consent
                            </Button>
                          ) : (
                            <></>
                          )}
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
      <div tabIndex={-1} className={`toast-container position-fixed bottom-0 end-0 p-3`}>
        <div className={`toast ${show ? 'show' : ''} ${showExpandConsent ? '' : 'minimize'}`}>
          <LoadingStatus loading={loading} />
          <div className="toast-body p-0">
            {!showExpandConsent ? (
              <>
                <div className="minimize-shield-wrapper position-relative">
                  <img
                    className="cover-img position-absolute h-100 w-100 object-fit-cover"
                    src={bg}
                  />
                  <div
                    className="minimize-shield"
                    onClick={() => {
                      setShowExpandConsent(true);
                      sessionStorage.removeItem('aesirx-analytics-rejected');
                    }}
                  >
                    <img src={privacy} alt="Shield of Privacy" />
                    Shield of Privacy
                  </div>
                </div>
              </>
            ) : (
              <>
                {level ? (
                  <>
                    <TermsComponent level={level} handleLevel={handleLevel}>
                      <Form className="mb-0">
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
                        <div className="d-flex justify-content-end">
                          {loading === 'done' ? (
                            <>
                              {level === 2 ? (
                                <div className="ssoBtnWrapper me-1 bg-success">
                                  <SSOButton
                                    className="btn btn-success text-white d-flex align-items-center"
                                    text={
                                      <>
                                        <img src={yes} className="me-1" />
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
                                  <img src={yes} className="me-1" />
                                  Yes, I consent
                                </Button>
                              )}

                              <Button
                                variant="success-outline"
                                onClick={handleNotAllow}
                                className="d-flex align-items-center"
                              >
                                <img src={no} className="me-1" />
                                Reject Consent
                              </Button>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </Form>
                    </TermsComponent>
                  </>
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
              </>
            )}
          </div>
        </div>
      </div>

      {!account && (loading === 'connect' || showConnectModal) && (
        <ConnectModal
          isConnecting={isConnecting}
          handleOnConnect={handleOnConnect}
          activeConnectorError={activeConnectorError}
          activeConnectorType={activeConnectorType}
          activeConnector={activeConnector}
        />
      )}
    </div>
  );
};

export default ConsentComponent;
