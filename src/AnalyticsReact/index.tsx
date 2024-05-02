import React, { ReactNode, Suspense } from 'react';

import AnalyticsContextProvider from '../utils/AnalyticsContextProvider';
import AnalyticsHandle from './handle';

const ConsentComponent = React.lazy(() => import('../Components/Consent'));
const ConsentComponentCustom = React.lazy(() => import('../Components/ConsentCustom'));

interface AnalyticsReact {
  location: { search: string; pathname: string };
  history: { replace: (_: object) => void };
  children?: ReactNode;
  oldLayout?: boolean;
}

const AnalyticsReact = ({ location, history, oldLayout = false, children }: AnalyticsReact) => {
  return (
    <AnalyticsContextProvider>
      <AnalyticsHandle location={location} history={history}>
        {children}
        {process.env.REACT_APP_DISABLE_ANALYTICS_CONSENT !== 'true' && (
          <Suspense fallback={<></>}>
            {oldLayout ? (
              <ConsentComponent
                endpoint={process.env.REACT_APP_ENDPOINT_ANALYTICS_URL}
                networkEnv={process.env.REACT_APP_CONCORDIUM_NETWORK}
                aesirXEndpoint={process.env.REACT_APP_ENDPOINT_URL ?? 'https://api.aesirx.io'}
              />
            ) : (
              <ConsentComponentCustom
                endpoint={process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL}
                networkEnv={process.env.NEXT_PUBLIC_CONCORDIUM_NETWORK}
                aesirXEndpoint={process.env.NEXT_PUBLIC_ENDPOINT_URL ?? 'https://api.aesirx.io'}
              />
            )}
          </Suspense>
        )}
      </AnalyticsHandle>
    </AnalyticsContextProvider>
  );
};
export default AnalyticsReact;
