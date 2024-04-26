import React, { ReactNode, useEffect, useState } from 'react';

import AnalyticsContextProvider from '../utils/AnalyticsContextProvider';
import AnalyticsHandle from './handle';
import { NextRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { getConsentTemplate } from '../utils/consent';

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
  const [layout, setLayout] = useState(process.env.NEXT_PUBLIC_CONSENT_LAYOUT);
  useEffect(() => {
    const init = async () => {
      const data: any = await getConsentTemplate(window.location.host);
      setLayout(data?.data?.template ?? process.env.NEXT_PUBLIC_CONSENT_LAYOUT);
    };
    init();
  }, []);
  return (
    <>
      <AnalyticsContextProvider>
        <AnalyticsHandle router={router} attributes={attributes}>
          {children}
          {process.env.NEXT_PUBLIC_DISABLE_ANALYTICS_CONSENT !== 'true' && (
            <>
              {oldLayout || layout === 'original' ? (
                <ConsentComponent
                  endpoint={process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL}
                  networkEnv={process.env.NEXT_PUBLIC_CONCORDIUM_NETWORK}
                  aesirXEndpoint={process.env.NEXT_PUBLIC_ENDPOINT_URL ?? 'https://api.aesirx.io'}
                  loginApp={loginApp}
                  isLoggedApp={isLoggedApp}
                  gtagId={process.env.NEXT_PUBLIC_ANALYTICS_GTAG_ID}
                  gtmId={process.env.NEXT_PUBLIC_ANALYTICS_GTM_ID}
                />
              ) : (
                <ConsentComponentCustom
                  endpoint={process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL}
                  networkEnv={process.env.NEXT_PUBLIC_CONCORDIUM_NETWORK}
                  aesirXEndpoint={process.env.NEXT_PUBLIC_ENDPOINT_URL ?? 'https://api.aesirx.io'}
                  loginApp={loginApp}
                  isLoggedApp={isLoggedApp}
                  gtagId={process.env.NEXT_PUBLIC_ANALYTICS_GTAG_ID}
                  gtmId={process.env.NEXT_PUBLIC_ANALYTICS_GTM_ID}
                  layout={layout}
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
