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
  customLayout: boolean;
  children?: ReactNode;
}

const AnalyticsNext = ({ router, attributes, customLayout = false, children }: AnalyticsNext) => {
  console.log('customLayout', customLayout);
  return (
    <>
      <AnalyticsContextProvider>
        <AnalyticsHandle router={router} attributes={attributes}>
          {children}
          {process.env.NEXT_PUBLIC_DISABLE_ANALYTICS_CONSENT !== 'true' && (
            <>
              {customLayout ? (
                <ConsentComponentCustom
                  endpoint={process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL}
                  networkEnv={process.env.NEXT_PUBLIC_CONCORDIUM_NETWORK}
                  aesirXEndpoint={process.env.NEXT_PUBLIC_ENDPOINT_URL ?? 'https://api.aesirx.io'}
                />
              ) : (
                <ConsentComponent
                  endpoint={process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL}
                  networkEnv={process.env.NEXT_PUBLIC_CONCORDIUM_NETWORK}
                  aesirXEndpoint={process.env.NEXT_PUBLIC_ENDPOINT_URL ?? 'https://api.aesirx.io'}
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
