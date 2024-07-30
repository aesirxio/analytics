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
  isOptInReplaceAnalytics?: boolean;
  children?: ReactNode;
}

const AnalyticsNext = ({
  router,
  attributes,
  oldLayout = false,
  loginApp,
  isLoggedApp,
  isOptInReplaceAnalytics = false,
  children,
}: AnalyticsNext) => {
  const [layout, setLayout] = useState(process.env.NEXT_PUBLIC_CONSENT_LAYOUT ?? 'simple-web-2');
  const [gtagId, setGtagId] = useState(process.env.NEXT_PUBLIC_ANALYTICS_GTAG_ID);
  const [gtmId, setGtmId] = useState(process.env.NEXT_PUBLIC_ANALYTICS_GTM_ID);
  useEffect(() => {
    const init = async () => {
      const data: any = await getConsentTemplate(
        process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL,
        window.location.host
      );
      setLayout(data?.data?.template ?? process.env.NEXT_PUBLIC_CONSENT_LAYOUT);
      setGtagId(data?.data?.gtag_id ?? process.env.NEXT_PUBLIC_ANALYTICS_GTAG_ID);
      setGtmId(data?.data?.gtm_id ?? process.env.NEXT_PUBLIC_ANALYTICS_GTM_ID);
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
                  gtagId={gtagId}
                  gtmId={gtmId}
                />
              ) : (
                <ConsentComponentCustom
                  endpoint={process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL}
                  networkEnv={process.env.NEXT_PUBLIC_CONCORDIUM_NETWORK}
                  aesirXEndpoint={process.env.NEXT_PUBLIC_ENDPOINT_URL ?? 'https://api.aesirx.io'}
                  loginApp={loginApp}
                  isLoggedApp={isLoggedApp}
                  gtagId={gtagId}
                  gtmId={gtmId}
                  layout={layout}
                  isOptInReplaceAnalytics={isOptInReplaceAnalytics}
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
