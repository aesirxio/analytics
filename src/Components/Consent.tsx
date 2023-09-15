/* eslint-disable no-case-declarations */
import {
  agreeConsents,
  getConsents,
  getNonce,
  getSignature,
  revokeConsents,
} from '../utils/consent';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import useConsentStatus from '../Hooks/useConsentStatus';
import '../styles/style.scss';
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
import { useTranslation } from 'react-i18next';
import { useAccount, useSignMessage } from 'wagmi';
import SSOEthereumProvider from './Ethereum';
interface WalletConnectionPropsExtends extends WalletConnectionProps {
  endpoint: string;
}
const ConsentComponent = ({ endpoint }: any) => {
  return (
    <WithWalletConnector network={MAINNET}>
      {(props) => (
        <div className="aesirxconsent">
          <SSOEthereumProvider>
            <ConsentComponentApp {...props} endpoint={endpoint} />
          </SSOEthereumProvider>
        </div>
      )}
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

  const handleOnConnect = async (connectorType: ConnectorType, network = 'concordium') => {
    if (network === 'concordium') {
      setActiveConnectorType(connectorType);
    }
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
  const { t } = useTranslation();

  // Metamask
  const { address, connector } = useAccount();

  const { signMessage } = useSignMessage({
    async onSuccess(data, variables) {
      const signature = Buffer.from(
        typeof data === 'object' && data !== null ? JSON.stringify(data) : data,
        'utf-8'
      ).toString('base64');
      if (variables?.message.indexOf('Revoke consent') > -1) {
        // Revoke Metamask
        const levelRevoke = sessionStorage.getItem('aesirx-analytics-revoke');
        const consentList = await getConsents(endpoint, uuid);
        consentList.forEach(async (consent: any) => {
          !consent?.expiration &&
            (await revokeConsents(
              endpoint,
              levelRevoke,
              consent?.consent_uuid,
              address,
              signature,
              web3ID,
              '',
              'metamask'
            ));
        });
        setLoading('done');
        handleRevoke(false);
        setShowExpandConsent(false);
        setShow(true);
        setShowBackdrop(false);
        sessionStorage.removeItem('aesirx-analytics-allow');
      } else {
        setLoading('saving');
        // Consent Metamask
        await agreeConsents(
          endpoint,
          level,
          uuid,
          consents,
          address,
          signature,
          web3ID,
          '',
          'metamask'
        );
        sessionStorage.setItem('aesirx-analytics-uuid', uuid);
        sessionStorage.setItem('aesirx-analytics-allow', '1');

        setShow(false);
        setLoading('done');
        handleRevoke(true, level);
        setShowBackdrop(false);
      }
    },
    async onError(error) {
      setLoading('done');
      toast.error(error.message);
    },
  });

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
          // Concordium
          const signature = await getSignature(endpoint, account, connection, 'Give consent:{}');

          setLoading('saving');

          await agreeConsents(endpoint, level, uuid, consents, account, signature, web3ID);
        } else if (connector) {
          // Metamask
          const nonce = await getNonce(endpoint, address, 'Give consent:{}', 'metamask');
          signMessage({ message: `${nonce}` });
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

      if (flag && account) {
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
            if (connector) {
              // Metamask
              setLoading('sign');
              const nonce = await getNonce(endpoint, address, 'Revoke consent:{}', 'metamask');
              setLoading('saving');
              signMessage({ message: `${nonce}` });
            } else {
              setLoading('connect');
              flag = false;
            }
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

        if (flag && account) {
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
    if (activeConnectorError) {
      toast.error(activeConnectorError);
    }
  }, [activeConnectorError]);

  useEffect(() => {
    if (sessionStorage.getItem('aesirx-analytics-rejected') === 'true') {
      setShowBackdrop(false);
      setShowExpandConsent(false);
    }
  }, []);

  console.log('level', uuid, level, web3ID, account, loading);

  return (
    <div>
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
                    {t('txt_shield_of_privacy')}
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
                    {t('txt_you_can_revoke')} <br />
                    {t('txt_visit')}{' '}
                    <a
                      href="https://nft.shield.aesirx.io"
                      className="text-success text-decoration-underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('txt_here')}
                    </a>{' '}
                    {t('txt_for_more_information')}
                  </div>
                  <div className="rounded-bottom position-relative overflow-hidden text-white">
                    <img
                      className="cover-img position-absolute h-100 w-100 object-fit-cover"
                      src={bg}
                    />
                    <div className="position-relative p-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div className="me-2">
                          <img src={privacy} alt="Shield of Privacy" /> {t('txt_shield_of_privacy')}
                        </div>
                        <div className="d-flex align-items-center">
                          <a
                            className="text-success text-decoration-underline manage-consent"
                            href="https://dapp.shield.aesirx.io/revoke-consent"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {t('txt_manage_consent')}
                          </a>
                          {loading === 'done' ? (
                            <Button
                              variant="success"
                              onClick={handleRevokeBtn}
                              className={'text-white d-flex align-items-center revoke-btn'}
                            >
                              {t('txt_revoke_consent')}
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
                    {t('txt_shield_of_privacy')}
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
                                        {t('txt_yes_i_consent')}
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
                                  {t('txt_yes_i_consent')}
                                </Button>
                              )}

                              <Button
                                variant="success-outline"
                                onClick={handleNotAllow}
                                className="d-flex align-items-center"
                              >
                                <img src={no} className="me-1" />
                                {t('txt_reject_consent')}
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
