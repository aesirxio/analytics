import React, { ReactNode } from 'react';

import AnalyticsContextProvider from '../utils/AnalyticsContextProvider';
import AnalyticsHandle from './handle';
import { NextRouter } from 'next/router';
import dynamic from 'next/dynamic';

const ConsentComponent = dynamic(() => import('../Components/Consent'), { ssr: false });

interface AnalyticsNext {
  router: NextRouter;
  children?: ReactNode;
}

const AnalyticsNext = ({ router, children }: AnalyticsNext) => {
  return (
    <>
      <AnalyticsContextProvider>
        <AnalyticsHandle router={router}>
          {children}
          {process.env.NEXT_PUBLIC_DISABLE_ANALYTICS_CONSENT !== 'true' && (
            <ConsentComponent
              endpoint={process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL}
              aesirXEndpoint={process.env.NEXT_PUBLIC_ENDPOINT_URL ?? 'https://api.aesirx.io'}
            />
          )}
        </AnalyticsHandle>
      </AnalyticsContextProvider>
    </>
  );
};
export default AnalyticsNext;
