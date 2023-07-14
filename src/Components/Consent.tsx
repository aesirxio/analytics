/* eslint-disable no-case-declarations */
import { agreeConsents, getSignature } from '../utils/consent';
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import useConsentStatus from '../Hooks/useConsentStatus';
import '../style.scss';
import { TermsComponent } from './Terms';
import { ToastContainer, toast } from 'react-toastify';

import yes from '../Assets/yes.svg';
import no from '../Assets/no.svg';

import ContentLoader from 'react-content-loader';

const ConsentComponent = ({ endpoint }: any) => {
  const [uuid, level, provider, show, setShow, web3ID, handleLevel] = useConsentStatus(endpoint);
  const [consents, setConsents] = useState<number[]>([1, 2]);
  const [loading, setLoading] = useState('done');

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
      } else {
        setLoading('saving');
        consents.forEach(async (consent) => {
          await agreeConsents(endpoint, 1, uuid, consent);
        });
      }

      sessionStorage.setItem('aesirx-analytics-uuid', uuid);
      sessionStorage.setItem('aesirx-analytics-allow', '1');

      setShow(false);
      setLoading('done');
    } catch (error) {
      console.log(error);

      setShow(false);
      setLoading('done');
      toast.error(error.message);
    }
  };

  const handleNotAllow = () => {
    sessionStorage.setItem('aesirx-analytics-uuid', uuid);
    sessionStorage.setItem('aesirx-analytics-allow', '0');
    setShow(false);
  };

  console.log('level', uuid, level, web3ID);

  return (
    <div className="aesirx">
      <ToastContainer />
      <div className={`offcanvas-backdrop fade ${show ? 'show' : 'd-none'}`} />
      <div tabIndex={-1} className={`toast-container position-fixed bottom-0 end-0 p-3`}>
        <div className={`toast ${show ? 'show' : ''}`}>
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
                        <Button
                          variant="success"
                          onClick={handleAgree}
                          className="me-1 text-white d-flex align-items-center"
                        >
                          <img src={yes} className="me-2" />
                          Yes, I consent
                        </Button>
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
                      <Button variant="success" disabled className="d-flex align-items-center">
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Please connect your Concordium wallet
                      </Button>
                    ) : loading === 'sign' ? (
                      <Button variant="success" disabled className="d-flex align-items-center">
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Please sign the message on your wallet twice and wait for it to be saved.
                      </Button>
                    ) : (
                      <Button variant="success" disabled className="d-flex align-items-center">
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
        </div>
      </div>
    </div>
  );
};

export default ConsentComponent;
