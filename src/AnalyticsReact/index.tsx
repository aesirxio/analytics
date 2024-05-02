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
}

const AnalyticsReact = ({ location, history, oldLayout = false, children }: AnalyticsReact) => {
  const [layout, setLayout] = useState(process.env.REACT_APP_CONSENT_LAYOUT);
  const [gtagId, setGtagId] = useState(process.env.REACT_APP_ANALYTICS_GTAG_ID);
  const [gtmId, setGtmId] = useState(process.env.REACT_APP_ANALYTICS_GTM_ID);
  useEffect(() => {
    const init = async () => {
      const data: any = await getConsentTemplate(window.location.host);
      setLayout(data?.data?.template ?? process.env.REACT_APP_CONSENT_LAYOUT);
      setGtagId(data?.data?.gtagID ?? process.env.REACT_APP_ANALYTICS_GTAG_ID);
      setGtmId(data?.data?.gtmID ?? process.env.REACT_APP_ANALYTICS_GTM_ID);
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
              />
            ) : (
              <ConsentComponentCustom
                endpoint={process.env.REACT_APP_ENDPOINT_ANALYTICS_URL}
                networkEnv={process.env.REACT_APP_CONCORDIUM_NETWORK}
                aesirXEndpoint={process.env.REACT_APP_ENDPOINT_URL ?? 'https://api.aesirx.io'}
                gtagId={gtagId}
                gtmId={gtmId}
                layout={layout}
              />
            )}
          </Suspense>
        )}
      </AnalyticsHandle>
    </AnalyticsContextProvider>
  );
};
export default AnalyticsReact;
