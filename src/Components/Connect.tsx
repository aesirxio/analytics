import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { isMobile, isDesktop } from 'react-device-detect';
import { BROWSER_WALLET, WALLET_CONNECT } from '../Hooks/config';
import concordium_logo from '../Assets/concordium_logo.png';

const ConnectModal = ({
  isConnecting,
  handleOnConnect,
  activeConnectorError,
  activeConnectorType,
  activeConnector,
}: any) => {
  const [show, setShow] = useState(true);

  const handleClose = () => setShow(false);

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Body>
          {' '}
          <div className="pb-4 px-4 block-wallet rounded-top">
            <div className="px-3 text-center">
              <h3 className="fs-3 fw-semibold mt-2 mb-4 text-primary">
                Please connect to your wallet
              </h3>
              <div className="d-flex flex-row flex-wrap">
                {isDesktop && (
                  <button
                    disabled={isConnecting}
                    className="btn btn-dark btn-concordium flex-grow-1 fw-medium py-2 px-4 fs-18 lh-sm text-white d-flex align-items-center justify-content-center mb-3"
                    onClick={() => handleOnConnect(BROWSER_WALLET)}
                  >
                    {isConnecting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Connecting
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

                <button
                  className="btn btn-dark btn-concordium flex-grow-1 fw-medium py-2 px-4 fs-18 lh-sm text-white d-flex align-items-center justify-content-center"
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
              </div>{' '}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ConnectModal;
