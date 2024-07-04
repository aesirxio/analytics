/* eslint-disable no-case-declarations */
import {
  agreeConsents,
  getConsents,
  getMember,
  getNonce,
  getSignature,
  getWalletNonce,
  loadGtagScript,
  loadGtmScript,
  revokeConsents,
  verifySignature,
} from '../utils/consent';
import React, { Suspense, useContext, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import useConsentStatus from '../Hooks/useConsentStatus';
import '../styles/style.scss';
import { TermsComponent } from './Terms';
import { ToastContainer, toast } from 'react-toastify';

import yes from '../Assets/yes.svg';
import no from '../Assets/no.svg';
import bg from '../Assets/bg.png';
import privacy from '../Assets/privacy.svg';
import arrow from '../Assets/arrow.svg';
import checkbox from '../Assets/checkbox.svg';
import checkbox_active from '../Assets/checkbox_active.svg';

import ContentLoader from 'react-content-loader';
const SSOButton: any = React.lazy(() =>
  import('aesirx-sso').then((module) => ({ default: module.SSOButton }))
);
import {
  MAINNET,
  WithWalletConnector,
  useConnection,
  useConnect,
  ConnectorType,
  stringMessage,
  useGrpcClient,
  TESTNET,
} from '@concordium/react-components';
import { BROWSER_WALLET, WALLET_CONNECT } from '../Hooks/config';
import { OsTypes, isDesktop, isMobile, osName } from 'react-device-detect';
import { LoadingStatus } from './LoadingStatus';
import ConnectModal from './Connect';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
import { useTranslation } from 'react-i18next';
import { useAccount, useSignMessage } from 'wagmi';
import SSOEthereumProvider from './Ethereum';
import { getWeb3ID } from '../utils/Concordium';
import { trackEvent } from '../utils';
declare global {
  interface Window {
    dataLayer: any;
  }
}
declare const dataLayer: any[];

const ConsentComponentCustom = ({
  endpoint,
  aesirXEndpoint,
  networkEnv,
  loginApp,
  isLoggedApp,
  gtagId,
  gtmId,
  layout,
}: any) => {
  return (
    <WithWalletConnector network={networkEnv === 'testnet' ? TESTNET : MAINNET}>
      {(props: any) => (
        <ConsentComponentCustomWrapper
          {...props}
          endpoint={endpoint}
          aesirXEndpoint={aesirXEndpoint}
          loginApp={loginApp}
          isLoggedApp={isLoggedApp}
          gtagId={gtagId}
          gtmId={gtmId}
          layout={layout}
        />
      )}
    </WithWalletConnector>
  );
};
const ConsentComponentCustomWrapper = (props: any) => {
  const [
    uuid,
    level,
    connection,
    account,
    show,
    setShow,
    web3ID,
    setWeb3ID,
    handleLevel,
    showRevoke,
    handleRevoke,
  ] = useConsentStatus(props?.endpoint, props?.layout, props);

  return (
    <div className="aesirxconsent">
      <SSOEthereumProvider layout={props?.layout} level={level}>
        <ConsentComponentCustomApp
          {...props}
          endpoint={props?.endpoint}
          aesirXEndpoint={props?.aesirXEndpoint}
          loginApp={props?.loginApp}
          isLoggedApp={props?.isLoggedApp}
          gtagId={props?.gtagId}
          gtmId={props?.gtmId}
          layout={props?.layout}
          uuid={uuid}
          level={level}
          connection={connection}
          account={account}
          show={show}
          setShow={setShow}
          web3ID={web3ID}
          setWeb3ID={setWeb3ID}
          handleLevel={handleLevel}
          showRevoke={showRevoke}
          handleRevoke={handleRevoke}
        />
      </SSOEthereumProvider>
    </div>
  );
};
const ConsentComponentCustomApp = (props: any) => {
  const {
    endpoint,
    aesirXEndpoint,
    loginApp,
    isLoggedApp,
    gtagId,
    gtmId,
    layout,
    activeConnectorType,
    activeConnector,
    activeConnectorError,
    connectedAccounts,
    genesisHashes,
    setActiveConnectorType,
    network,
    uuid,
    level,
    connection,
    account,
    show,
    setShow,
    web3ID,
    setWeb3ID,
    handleLevel,
    showRevoke,
    handleRevoke,
  } = props;
  const { setConnection } = useConnection(connectedAccounts, genesisHashes);

  const { isConnecting } = useConnect(activeConnector, setConnection);

  const handleOnConnect = async (connectorType: ConnectorType, network = 'concordium') => {
    if (network === 'concordium') {
      setActiveConnectorType(connectorType);
    }
    setLoading('done');
  };

  const [consents, setConsents] = useState<number[]>([1, 2]);
  const [loading, setLoading] = useState('done');
  const [loadingCheckAccount, setLoadingCheckAccount] = useState(false);
  const [showExpandConsent, setShowExpandConsent] = useState(true);
  const [showExpandRevoke, setShowExpandRevoke] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(true);
  const [consentTier4, setConsentTier4] = useState<any>({});
  const [upgradeLayout, setUpgradeLayout] = useState<any>(false);
  const [upgradeShowDetail, setUpgradeShowDetail] = useState<any>(false);
  const [upgradeLevel, setUpgradeLevel] = useState<any>(0);
  const analyticsContext = useContext(AnalyticsContext);
  const { t } = useTranslation();
  const gRPCClient = useGrpcClient(network);

  // Metamask
  const { address, connector } =
    layout === 'simple-consent-mode' || layout === 'simple-web-2' || level === 1
      ? { address: '', connector: '' }
      : useAccount();
  const { signMessage }: any =
    layout === 'simple-consent-mode' || layout === 'simple-web-2' || level === 1
      ? { signMessage: {} }
      : useSignMessage({
          async onSuccess(data: any, variables: any) {
            const signature = Buffer.from(
              typeof data === 'object' && data !== null ? JSON.stringify(data) : data,
              'utf-8'
            ).toString('base64');
            const jwt = sessionStorage.getItem('aesirx-analytics-jwt');
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
                    jwt,
                    'metamask'
                  ));
              });
              setLoading('done');
              handleRevoke(false);
              setShowExpandConsent(false);
              setShow(true);
              setShowBackdrop(false);
              sessionStorage.removeItem('aesirx-analytics-allow');
            } else if (variables?.message.indexOf('Login with nonce') > -1) {
              const res = await verifySignature(aesirXEndpoint, 'metamask', address, data);
              sessionStorage.setItem('aesirx-analytics-jwt', res?.jwt);
              setLoadingCheckAccount(false);
              const nonce = await getNonce(
                endpoint,
                address,
                'Give consent Tier 4:{nonce} {domain} {time}',
                'metamask'
              );
              signMessage({ message: `${nonce}` });
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
                jwt,
                'metamask',
                gtagId,
                gtmId,
                layout
              );
              sessionStorage.setItem('aesirx-analytics-uuid', uuid);
              sessionStorage.setItem('aesirx-analytics-allow', '1');
              sessionStorage.setItem('aesirx-analytics-consent-type', 'metamask');

              setShow(false);
              setLoading('done');
              handleRevoke(true, level);
              setShowBackdrop(false);
            }
          },
          async onError(error: any) {
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
      let jwt = '';
      if (level > 2) {
        if (level === 4) {
          try {
            setLoadingCheckAccount(true);
            const nonceLogin = await getWalletNonce(
              aesirXEndpoint,
              account ? 'concordium' : 'metamask',
              account ?? address
            );
            if (nonceLogin) {
              try {
                if (account) {
                  const signature = await connection.signMessage(
                    account,
                    stringMessage(`${nonceLogin}`)
                  );
                  const convertedSignature =
                    typeof signature === 'object' && signature !== null
                      ? signature
                      : JSON.parse(signature);

                  if (signature) {
                    const data = await verifySignature(
                      aesirXEndpoint,
                      'concordium',
                      account,
                      convertedSignature
                    );
                    sessionStorage.setItem('aesirx-analytics-jwt', data?.jwt);
                    jwt = data?.jwt;
                    loginApp && !isLoggedApp && loginApp(data);
                    setLoadingCheckAccount(false);
                  }
                } else {
                  signMessage({ message: `${nonceLogin}` });
                }
              } catch (error) {
                setLoadingCheckAccount(false);
                toast(error.message);
              }
            }
          } catch (error) {
            SSOClick('.loginSSO');
            setLoadingCheckAccount(false);
            return;
          }
        }
        if (account) {
          // Concordium
          const signature = await getSignature(
            endpoint,
            account,
            connection,
            level === 3
              ? 'Give consent:{nonce} {domain} {time}'
              : 'Give consent Tier 4:{nonce} {domain} {time}'
          );
          setLoading('saving');
          await agreeConsents(
            endpoint,
            level,
            uuid,
            consents,
            account,
            signature,
            web3ID,
            jwt,
            'concordium',
            gtagId,
            gtmId,
            layout
          );
          sessionStorage.setItem('aesirx-analytics-consent-type', 'concordium');
        } else if (connector) {
          // Metamask
          if (level === 3) {
            const nonce = await getNonce(
              endpoint,
              address,
              level === 3
                ? 'Give consent:{nonce} {domain} {time}'
                : 'Give consent Tier 4:{nonce} {domain} {time}',
              'metamask'
            );
            signMessage({ message: `${nonce}` });
          }
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
            await agreeConsents(
              endpoint,
              1,
              uuid,
              consent,
              null,
              null,
              null,
              null,
              null,
              gtagId,
              gtmId,
              layout
            );
          } else if (
            !!existConsent?.consent_uuid &&
            existConsent?.expiration &&
            new Date(existConsent.expiration) < new Date()
          ) {
            await agreeConsents(
              endpoint,
              1,
              uuid,
              consent,
              null,
              null,
              null,
              null,
              null,
              gtagId,
              gtmId,
              layout
            );
          }
        });
      }

      if (flag && (account || level < 3)) {
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

  useEffect(() => {
    const init = async () => {
      if (Object.keys(consentTier4)?.length && (account || address)) {
        await consentTier4Init(consentTier4);
        setConsentTier4({});
      }
    };
    init();
  }, [consentTier4, account, address]);

  const consentTier4Init = async (response: any) => {
    let hasWeb3ID = true;
    if (response?.loginType === 'concordium') {
      const web3ID = await getWeb3ID(account, gRPCClient, network?.name);
      if (web3ID) {
        setWeb3ID(web3ID);
      } else {
        hasWeb3ID = false;
      }
    } else {
      const memberData = await getMember(aesirXEndpoint, response?.access_token);
      hasWeb3ID = memberData?.web3id ? true : false;
    }
    if (hasWeb3ID) {
      if (response?.loginType === 'concordium') {
        // Concordium
        sessionStorage.setItem('aesirx-analytics-consent-type', 'concordium');
        const signature = await getSignature(
          endpoint,
          account,
          connection,
          'Give consent Tier 4:{nonce} {domain} {time}'
        );
        await agreeConsents(
          endpoint,
          level,
          uuid,
          consents,
          account,
          signature,
          null,
          response?.jwt,
          'concordium',
          gtagId,
          gtmId,
          layout
        );
        setShow(false);
        handleRevoke(true, level);
        setLoading('done');
      } else if (response?.loginType === 'metamask') {
        // Metamask
        sessionStorage.setItem('aesirx-analytics-consent-type', 'metamask');
        const nonce = await getNonce(
          endpoint,
          address,
          'Give consent Tier 4:{nonce} {domain} {time}',
          'metamask'
        );
        signMessage({ message: `${nonce}` });
      }
    } else {
      handleLevel(3);
      toast("You haven't minted any WEB3 ID yet. Try to mint at https://dapp.shield.aesirx.io");
      setLoading('done');
    }
  };
  const onGetData = async (response: any) => {
    // on Login Tier 2 & 4
    try {
      setLoading('saving');
      const levelRevoke = sessionStorage.getItem('aesirx-analytics-revoke');
      sessionStorage.setItem('aesirx-analytics-jwt', response?.jwt);
      if (levelRevoke && levelRevoke !== '0') {
        // Revoke Consent
        sessionStorage.setItem(
          'aesirx-analytics-consent-type',
          response?.loginType === 'concordium' ? 'concordium' : 'metamask'
        );
        handleRevokeBtn();
      } else {
        // Agree Consent
        if (level === 4) {
          if (response?.loginType === 'concordium' && isDesktop) {
            setActiveConnectorType(BROWSER_WALLET);
          }
          setConsentTier4(response);
        } else {
          await agreeConsents(
            endpoint,
            level,
            uuid,
            consents,
            null,
            null,
            null,
            response?.jwt,
            'concordium',
            gtagId,
            gtmId,
            layout
          );
          setShow(false);
          handleRevoke(true, level);
          setLoading('done');
        }
      }
      loginApp && !isLoggedApp && loginApp(response);
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
    const hostUrl = endpoint ? endpoint : '';
    const root = hostUrl ? hostUrl.replace(/\/$/, '') : '';
    trackEvent(root, '', {
      event_name: 'Reject consent',
      event_type: 'reject-consent',
    });
  };
  const handleRevokeBtn = async () => {
    const levelRevoke = sessionStorage.getItem('aesirx-analytics-revoke');
    const consentType = sessionStorage.getItem('aesirx-analytics-consent-type');
    const jwt = sessionStorage.getItem('aesirx-analytics-jwt');
    try {
      let flag = true;

      if (levelRevoke !== '1') {
        if (parseInt(levelRevoke) > 2) {
          if (!jwt && (parseInt(levelRevoke) === 2 || parseInt(levelRevoke) === 4)) {
            SSOClick('.revokeLogin');
            return;
          }
          if (account && consentType !== 'metamask') {
            setLoading('sign');
            const signature = await getSignature(
              endpoint,
              account,
              connection,
              'Revoke consent:{nonce} {domain} {time}'
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
                  web3ID,
                  jwt
                ));
            });
            setLoading('done');
            handleRevoke(false);
          } else if (connector) {
            // Metamask
            setLoading('sign');
            setLoading('saving');
            const nonce = await getNonce(
              endpoint,
              address,
              'Revoke consent:{nonce} {domain} {time}',
              'metamask'
            );
            signMessage({ message: `${nonce}` });
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
                jwt
              ));
          });
          setLoading('done');
          handleRevoke(false);
        }

        if (flag && ((account && consentType !== 'metamask') || level < 3)) {
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
      const hostUrl = endpoint ? endpoint : '';
      const root = hostUrl ? hostUrl.replace(/\/$/, '') : '';
      trackEvent(root, '', {
        event_name: 'Revoke consent',
        event_type: 'revoke-consent',
      });
    } catch (error) {
      console.log(error);
      setLoading('done');
      toast.error(error?.response?.data?.error ?? error.message);
    }
  };

  const SSOClick = (selector: string) => {
    const element: HTMLElement = document.querySelector(selector) as HTMLElement;
    element.click();
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
    if (
      sessionStorage.getItem('aesirx-analytics-revoke') &&
      sessionStorage.getItem('aesirx-analytics-revoke') !== '0'
    ) {
      window.funcAfterConsent && window.funcAfterConsent();
    }
    (gtagId || gtmId) && loadConsentDefault(gtagId, gtmId);
  }, []);

  console.log('level', uuid, level, web3ID, account, loading);

  const ConsentLevelUprade = ({
    level,
    tier,
    levelname,
    term_custom,
    content_custom,
    isUpgrade = false,
  }: any) => {
    return (
      <div
        className={`consent_level mt-2 ${
          isUpgrade ? `cursor-pointer ${upgradeLevel === level ? 'active' : ''}` : ''
        } `}
        onClick={() => {
          setUpgradeLevel(level);
        }}
      >
        <div className="d-flex align-items-center justify-content-between flex-wrap">
          <div className="d-flex align-items-center">
            <div className={`status-tier tier-${level} rounded-circle`}></div>
            <div className="status-tier-text fw-semibold fs-14 text-primary">
              {tier} - {levelname}
            </div>
          </div>
          {!isUpgrade ? (
            <div className="fw-semibold fs-14 text-primary">{term_custom}</div>
          ) : (
            <>
              {upgradeShowDetail ? (
                <div className="fw-semibold fs-14 text-primary">{term_custom}</div>
              ) : (
                <></>
              )}
            </>
          )}
        </div>
        {!isUpgrade ? (
          <div className={`${isUpgrade ? 'consent_upgrade_content' : ''} mt-2`}>
            {content_custom}
          </div>
        ) : (
          <>{upgradeShowDetail ? <div className="mt-2">{content_custom}</div> : <></>}</>
        )}
        {isUpgrade ? (
          <>
            <div className="checkbox_img">
              <img
                width={'23px'}
                height={'23px'}
                src={upgradeLevel === level ? checkbox_active : checkbox}
              />
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    );
  };
  const loadConsentDefault = (gtagId: any, gtmId: any) => {
    window.dataLayer = window.dataLayer || [];
    function gtag( // eslint-disable-next-line @typescript-eslint/no-unused-vars
      p0: string, // eslint-disable-next-line @typescript-eslint/no-unused-vars
      p1: any, // eslint-disable-next-line @typescript-eslint/no-unused-vars
      p2?: any
    ) {
      // eslint-disable-next-line prefer-rest-params
      dataLayer.push(arguments);
    }
    gtag('consent', 'default', {
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      ad_storage: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500,
    });
    if (gtagId) {
      gtag('js', new Date());
      gtag('config', `${gtagId}`);
    }
    if (gtmId) {
      dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    }
    if (layout === 'advance-consent-mode') {
      gtagId && loadGtagScript(gtagId);
      gtmId && loadGtmScript(gtmId);
      gtag('set', 'url_passthrough', true);
      gtag('set', 'ads_data_redaction', true);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className={`offcanvas-backdrop fade ${showBackdrop && show ? 'show' : 'd-none'}`} />
      <div
        tabIndex={-1}
        className={`toast-container position-fixed m-md-3 ${
          showExpandRevoke ? 'top-50 start-50 translate-middle' : 'bottom-0 end-0'
        }`}
      >
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
          <div className="toast-body p-0 shadow mx-3 mx-md-0">
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
                      {t('txt_link')}
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
                            className="text-success text-decoration-underline manage-consent fs-14"
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
                              className={'text-white d-flex align-items-center revoke-btn fs-14'}
                            >
                              {t('txt_revoke_consent')}
                            </Button>
                          ) : (
                            <></>
                          )}
                          {(sessionStorage.getItem('aesirx-analytics-revoke') === '4' ||
                            sessionStorage.getItem('aesirx-analytics-revoke') === '2') && (
                            <div>
                              <Suspense fallback={<div>Loading...</div>}>
                                <SSOButton
                                  className="d-none revokeLogin"
                                  text={<>Login Revoke</>}
                                  ssoState={'noscopes'}
                                  onGetData={onGetData}
                                />
                              </Suspense>
                            </div>
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
      <div
        tabIndex={-1}
        className={`toast-container position-fixed m-md-3 ${
          showExpandConsent ? 'top-50 start-50 translate-middle' : 'bottom-0 end-0'
        }`}
      >
        <div
          className={`toast custom ${show ? 'show' : ''} ${showExpandConsent ? '' : 'minimize'}`}
        >
          <LoadingStatus loading={loading} />
          <div className="toast-body p-0 shadow mx-3 mx-md-0">
            {!showExpandConsent ? (
              <>
                <div className="minimize-shield-wrapper position-relative">
                  <img
                    className="cover-img position-absolute h-100 w-100 object-fit-cover"
                    src={bg}
                  />
                  <div
                    className="minimize-shield"
                    ref={analyticsContext?.ref}
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
              <div className="bg-white">
                {level ? (
                  <>
                    {upgradeLayout ? (
                      <>
                        <div className="bg-white rounded p-3 w-auto">
                          {loading === 'done' ? (
                            <>
                              <p className="mb-2 mb-lg-3">{t('txt_upgrade_consent_text')}</p>
                              <p className="fw-semibold text-dark">{t('txt_your_current_level')}</p>
                              <ConsentLevelUprade
                                level={level}
                                tier={t(`txt_tier_${level}_tier`)}
                                levelname={t(`txt_tier_${level}_levelname`)}
                                term_custom={t(`txt_tier_${level}_term_custom`)}
                                content_custom={t(`txt_tier_${level}_content_custom`)}
                              />
                              <div className="d-flex align-items-center justify-content-between w-100 mt-3 flex-wrap">
                                <p className="fw-semibold text-dark w-100 w-lg-auto mb-0">
                                  {t('txt_upgrade_consent_to')}
                                </p>
                                <div
                                  className="ms-auto read-more-btn fs-7 text-primary cursor-pointer"
                                  onClick={() => {
                                    setUpgradeShowDetail(!upgradeShowDetail ? true : false);
                                  }}
                                >
                                  {!upgradeShowDetail
                                    ? t('txt_show_details')
                                    : t('txt_hide_details')}{' '}
                                  <img
                                    src={arrow}
                                    className={`ms-1 ${upgradeShowDetail ? 'revert' : ''}`}
                                  />
                                </div>
                              </div>
                              <Form>
                                {level !== 1 && layout !== 'advance-consent-mode' && (
                                  <ConsentLevelUprade
                                    level={1}
                                    tier={t(`txt_tier_1_tier`)}
                                    levelname={t(`txt_tier_1_levelname`)}
                                    term_custom={t(`txt_tier_1_term_custom`)}
                                    content_custom={t(`txt_tier_1_content_custom`)}
                                    isUpgrade={true}
                                  />
                                )}
                                {level !== 2 && (
                                  <ConsentLevelUprade
                                    level={2}
                                    tier={t(`txt_tier_2_tier`)}
                                    levelname={t(`txt_tier_2_levelname`)}
                                    term_custom={t(`txt_tier_2_term_custom`)}
                                    content_custom={t(`txt_tier_2_content_custom`)}
                                    isUpgrade={true}
                                  />
                                )}
                                {level !== 3 && (
                                  <ConsentLevelUprade
                                    level={3}
                                    tier={t(`txt_tier_3_tier`)}
                                    levelname={t(`txt_tier_3_levelname`)}
                                    term_custom={t(`txt_tier_3_term_custom`)}
                                    content_custom={t(`txt_tier_3_content_custom`)}
                                    isUpgrade={true}
                                  />
                                )}
                                {level !== 4 && (
                                  <ConsentLevelUprade
                                    level={4}
                                    tier={t(`txt_tier_4_tier`)}
                                    levelname={t(`txt_tier_4_levelname`)}
                                    term_custom={t(`txt_tier_4_term_custom`)}
                                    content_custom={t(`txt_tier_4_content_custom`)}
                                    isUpgrade={true}
                                  />
                                )}
                              </Form>
                              <div className="d-flex w-100 flex-wrap flex-lg-nowrap justify-content-end mt-4">
                                <Button
                                  variant="outline-success"
                                  onClick={() => {
                                    setUpgradeLayout(false);
                                  }}
                                  className="d-flex align-items-center justify-content-center fs-14 w-100 w-lg-30 me-3 mb-2 mb-lg-0 rounded-pill py-3 text-dark"
                                >
                                  {t('txt_cancel')}
                                </Button>
                                <Button
                                  variant="success"
                                  onClick={() => {
                                    if (upgradeLevel) {
                                      handleLevel(upgradeLevel);
                                      setUpgradeLayout(false);
                                    } else {
                                      toast('Please choose upgrade level');
                                    }
                                  }}
                                  className="d-flex align-items-center justify-content-center fs-14 w-100 w-lg-30 me-3 rounded-pill py-3 text-white"
                                >
                                  {t('txt_change_consent')}
                                </Button>
                              </div>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <TermsComponent
                          level={level}
                          handleLevel={handleLevel}
                          isCustom={true}
                          layout={layout}
                        >
                          <Form className="mb-0 w-100">
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
                            <div className="d-flex w-100 flex-wrap flex-lg-nowrap">
                              {loading === 'done' ? (
                                <>
                                  {layout === 'simple-consent-mode' || layout === 'simple-web-2' ? (
                                    <></>
                                  ) : (
                                    <>
                                      <Button
                                        variant="outline-success"
                                        onClick={() => {
                                          setUpgradeLayout(true);
                                        }}
                                        className="d-flex align-items-center justify-content-center fs-14 w-100 me-3 mb-2 mb-lg-0 rounded-pill py-2 py-lg-3 text-dark"
                                      >
                                        {t('txt_change_consent')}
                                      </Button>{' '}
                                    </>
                                  )}
                                  <Button
                                    variant="outline-success"
                                    onClick={handleNotAllow}
                                    className="d-flex align-items-center justify-content-center fs-14 w-100 me-3 mb-2 mb-lg-0 rounded-pill py-2 py-lg-3 text-dark"
                                  >
                                    {t('txt_reject_consent')}
                                  </Button>
                                  <div
                                    className={`ssoBtnWrapper w-100 me-3 bg-success rounded-pill ${
                                      level === 2 || (level === 4 && !account && !address)
                                        ? ''
                                        : 'd-none'
                                    }`}
                                  >
                                    {layout !== 'simple-consent-mode' &&
                                      layout !== 'simple-web-2' &&
                                      level !== 1 && (
                                        <Suspense fallback={<div>Loading...</div>}>
                                          <SSOButton
                                            className="btn btn-success text-white d-flex align-items-center justify-content-center loginSSO rounded-pill py-2 py-lg-3 w-100"
                                            text={
                                              <>
                                                <img src={yes} className="me-1" />
                                                {t('txt_yes_i_consent')}
                                              </>
                                            }
                                            ssoState={'noscopes'}
                                            onGetData={onGetData}
                                            {...(level === 2 ? { noCreateAccount: true } : {})}
                                          />
                                        </Suspense>
                                      )}
                                  </div>
                                  {level === 2 || (level === 4 && !account && !address) ? (
                                    <></>
                                  ) : (
                                    <Button
                                      variant="success"
                                      onClick={handleAgree}
                                      className="w-100 me-3 text-white d-flex align-items-center justify-content-center fs-14 rounded-pill py-2 py-lg-3"
                                    >
                                      {loadingCheckAccount ? (
                                        <span
                                          className="spinner-border spinner-border-sm me-1"
                                          role="status"
                                          aria-hidden="true"
                                        ></span>
                                      ) : (
                                        <img src={yes} className="me-1" />
                                      )}
                                      {t('txt_yes_i_consent')}
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <></>
                              )}
                            </div>
                          </Form>
                        </TermsComponent>
                      </>
                    )}
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
              </div>
            )}
          </div>
        </div>
      </div>

      {!account && loading === 'connect' && (
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

export default ConsentComponentCustom;
