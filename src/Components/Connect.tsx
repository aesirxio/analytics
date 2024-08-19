import React, { Suspense, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { isMobile, isDesktop, OsTypes, osName } from 'react-device-detect';
import { BROWSER_WALLET, WALLET_CONNECT } from '../Hooks/config';
import concordium_logo from '../Assets/concordium_logo.png';
import { useTranslation } from 'react-i18next';
import ConnectMetamask from './Ethereum/connect';
import { useAccount } from 'wagmi';
const ConnectModal = ({
  isConnecting,
  handleOnConnect,
  activeConnectorError,
  activeConnectorType,
  activeConnector,
}: any) => {
  const [show, setShow] = useState(true);

  const handleClose = () => setShow(false);
  const { t } = useTranslation();
  return (
    <>
      <Modal
        className="aesirxconsent aesirxconsent-modal"
        show={show}
        onHide={handleClose}
        centered
      >
        <Modal.Body className="aesirxconsent">
          <div className="p-4 block-wallet rounded-top">
            <div className="px-3 text-center">
              <h3 className="fs-3 fw-semibold mt-2 mb-4 text-primary">
                {t('txt_please_connect_your_wallet')}
              </h3>
              <div className="mb-3">
                <Suspense fallback={<>Loading...</>}>
                  <SSOEthereumApp handleOnConnect={handleOnConnect} />
                </Suspense>
              </div>
              <div className="d-flex flex-row flex-wrap">
                {isDesktop && (
                  <button
                    disabled={isConnecting}
                    className="btn btn-primary btn-concordium flex-grow-1 fw-medium py-2 px-4 lh-sm text-white d-flex align-items-center justify-content-start mb-3"
                    onClick={() => handleOnConnect(BROWSER_WALLET)}
                  >
                    {isConnecting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        {t('txt_connecting')}
                      </>
                    ) : (
                      <>
                        {' '}
                        <img
                          src={concordium_logo}
                          className="me-3 align-text-bottom"
                          alt="Concordium"
                        />
                        Concordium Browser Wallet
                      </>
                    )}
                  </button>
                )}
                {osName !== OsTypes?.IOS ? (
                  <>
                    <button
                      className="btn btn-primary btn-concordium flex-grow-1 fw-medium py-2 px-4 lh-sm text-white d-flex align-items-center justify-content-start text-start"
                      onClick={() => handleOnConnect(WALLET_CONNECT)}
                    >
                      {!activeConnectorError && activeConnectorType && !activeConnector ? (
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        <>
                          {' '}
                          <img
                            src={concordium_logo}
                            className="me-3 align-text-bottom"
                            alt="Concordium"
                          />
                          {isMobile
                            ? 'Concordium or CryptoX'
                            : 'QR Code (Concordium Mobile or CryptoX Mobile)'}
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <></>
                )}
              </div>{' '}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

const SSOEthereumApp = ({ handleOnConnect }: any) => {
  const { isConnected } = useAccount({
    onConnect() {
      handleOnConnect('', 'metamask');
    },
  });

  return isConnected ? <></> : <ConnectMetamask />;
};

export default ConnectModal;
