import React from 'react';
import { Button } from 'react-bootstrap';

const LoadingStatus = ({ loading }: any) => {
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
            <span className="text">Please connect your Concordium wallet</span>
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
              Please sign the message on your wallet twice and wait for it to be saved.
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
            <span className="text">Saving...</span>
          </Button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export { LoadingStatus };
