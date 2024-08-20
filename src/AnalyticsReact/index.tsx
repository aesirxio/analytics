import React, { ReactNode, Suspense, useEffect, useState } from 'react';

import AnalyticsContextProvider from '../utils/AnalyticsContextProvider';
import AnalyticsHandle from './handle';
import { getConsentTemplate } from '../utils/consent';

const ConsentComponent = React.lazy(() => import('../Components/Consent'));
const ConsentComponentCustom = React.lazy(() => import('../Components/ConsentCustom'));

interface AnalyticsReact {
  location: { search: string; pathname: string };
  history: { replace: (_: object) => void };
  children?: ReactNode;
  oldLayout?: boolean;
  isOptInReplaceAnalytics?: boolean;
}

const AnalyticsReact = ({
  location,
  history,
  oldLayout = false,
  isOptInReplaceAnalytics = false,
  children,
}: AnalyticsReact) => {
  const [layout, setLayout] = useState(
    process.env.REACT_APP_CONSENT_LAYOUT ?? 'simple-consent-mode'
  );
  const [gtagId, setGtagId] = useState(process.env.REACT_APP_ANALYTICS_GTAG_ID);
  const [gtmId, setGtmId] = useState(process.env.REACT_APP_ANALYTICS_GTM_ID);
  const [customConsentText, setCustomConsentText] = useState(
    process.env.REACT_APP_ANALYTICS_CONSENT_TEXT
  );
  useEffect(() => {
    const init = async () => {
      const data: any = await getConsentTemplate(
        process.env.REACT_APP_ENDPOINT_ANALYTICS_URL,
        window.location.host
      );
      setLayout(data?.data?.template ?? process.env.REACT_APP_CONSENT_LAYOUT);
      setGtagId(data?.data?.gtag_id ?? process.env.REACT_APP_ANALYTICS_GTAG_ID);
      setGtmId(data?.data?.gtm_id ?? process.env.REACT_APP_ANALYTICS_GTM_ID);
      setCustomConsentText(
        data?.data?.consent_text ?? process.env.REACT_APP_ANALYTICS_CONSENT_TEXT
      );
    };
    init();
  }, []);
  return (
    <AnalyticsContextProvider>
      <AnalyticsHandle location={location} history={history}>
        {children}
        {process.env.REACT_APP_DISABLE_ANALYTICS_CONSENT !== 'true' && (
          <Suspense fallback={<></>}>
            {oldLayout || layout === 'original' ? (
              <ConsentComponent
                endpoint={process.env.REACT_APP_ENDPOINT_ANALYTICS_URL}
                networkEnv={process.env.REACT_APP_CONCORDIUM_NETWORK}
                aesirXEndpoint={process.env.REACT_APP_ENDPOINT_URL ?? 'https://api.aesirx.io'}
                gtagId={gtagId}
                gtmId={gtmId}
                customConsentText={customConsentText}
              />
            ) : (
              <ConsentComponentCustom
                endpoint={process.env.REACT_APP_ENDPOINT_ANALYTICS_URL}
                networkEnv={process.env.REACT_APP_CONCORDIUM_NETWORK}
                aesirXEndpoint={process.env.REACT_APP_ENDPOINT_URL ?? 'https://api.aesirx.io'}
                gtagId={gtagId}
                gtmId={gtmId}
                customConsentText={customConsentText}
                layout={layout}
                isOptInReplaceAnalytics={isOptInReplaceAnalytics}
              />
            )}
          </Suspense>
        )}
      </AnalyticsHandle>
    </AnalyticsContextProvider>
  );
};
export default AnalyticsReact;
