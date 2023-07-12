/* eslint-disable no-case-declarations */
import { agreeConsents, getSignature } from '../utils/consent';
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import useConsentStatus from '../Hooks/useConsentStatus';
import '../style.scss';
import { TermsComponent } from './Terms';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/scss/main.scss';

const ConsentComponent = ({ endpoint }: any) => {
  const [uuid, level, provider, show, setShow] = useConsentStatus(endpoint);
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
      if (level > 1) {
        setLoading('connect');
        const address = await provider.connect();
        setLoading('sign');
        const signature = await getSignature(endpoint, address, provider);

        setLoading('saving');

        await agreeConsents(endpoint, level, uuid, consents, address, signature);
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
      toast.error(error.message);
      setShow(false);
      setLoading('done');
    }
  };

  const handleNotAllow = () => {
    sessionStorage.setItem('aesirx-analytics-uuid', uuid);
    sessionStorage.setItem('aesirx-analytics-allow', '0');
    setShow(false);
  };

  console.log('level', uuid, level);

  return (
    <div className="aesirx">
      <ToastContainer />
      <div className={`offcanvas-backdrop fade ${show ? 'show' : 'd-none'}`} />
      <div tabIndex={-1} className={`toast-container position-fixed bottom-0 end-0 p-3`}>
        <div className={`toast ${show ? 'show' : ''}`}>
          <div className="toast-body p-3">
            {level ? (
              <>
                <TermsComponent level={level} />

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
                        <Button variant="success" onClick={handleAgree} className="me-1">
                          Yes, I Consent
                        </Button>
                        <Button variant="secondary" onClick={handleNotAllow}>
                          Reject Consent
                        </Button>
                      </>
                    ) : loading === 'connect' ? (
                      <Button variant="primary" disabled>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Please connect your Concordium wallet
                      </Button>
                    ) : loading === 'sign' ? (
                      <Button variant="primary" disabled>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Please sign the message on your wallet twice and wait for it to be saved.
                      </Button>
                    ) : (
                      <Button variant="primary" disabled>
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

                <p className="fw-bold">
                  * We do not collect any personal data, only user insights.
                </p>

                <TermsComponent level={level} upgrade={true} />
              </>
            ) : (
              <>Loading...</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentComponent;
