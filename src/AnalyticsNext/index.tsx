import React, { ReactNode } from 'react';

import AnalyticsContextProvider from '../utils/AnalyticsContextProvider';
import AnalyticsHandle from './handle';
import { NextRouter } from 'next/router';
import dynamic from 'next/dynamic';

const ConsentComponent = dynamic(() => import('../Components/Consent'), { ssr: false });
const ConsentComponentCustom = dynamic(() => import('../Components/ConsentCustom'), { ssr: false });

interface AnalyticsNext {
  router: NextRouter;
  attributes: any;
  oldLayout?: boolean;
  loginApp?: any;
  isLoggedApp?: boolean;
  children?: ReactNode;
}

const AnalyticsNext = ({
  router,
  attributes,
  oldLayout = false,
  loginApp,
  isLoggedApp,
  children,
}: AnalyticsNext) => {
  return (
    <>
      <AnalyticsContextProvider>
        <AnalyticsHandle router={router} attributes={attributes}>
          {children}
          {process.env.NEXT_PUBLIC_DISABLE_ANALYTICS_CONSENT !== 'true' && (
            <>
              {oldLayout ? (
                <ConsentComponent
                  endpoint={process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL}
                  networkEnv={process.env.NEXT_PUBLIC_CONCORDIUM_NETWORK}
                  aesirXEndpoint={process.env.NEXT_PUBLIC_ENDPOINT_URL ?? 'https://api.aesirx.io'}
                  loginApp={loginApp}
                  isLoggedApp={isLoggedApp}
                />
              ) : (
                <ConsentComponentCustom
                  endpoint={process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL}
                  networkEnv={process.env.NEXT_PUBLIC_CONCORDIUM_NETWORK}
                  aesirXEndpoint={process.env.NEXT_PUBLIC_ENDPOINT_URL ?? 'https://api.aesirx.io'}
                  loginApp={loginApp}
                  isLoggedApp={isLoggedApp}
                />
              )}
            </>
          )}
        </AnalyticsHandle>
      </AnalyticsContextProvider>
    </>
  );
};
export default AnalyticsNext;
