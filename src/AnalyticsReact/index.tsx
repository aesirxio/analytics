import React, { ReactNode, Suspense } from 'react';

import AnalyticsContextProvider from '../utils/AnalyticsContextProvider';
import AnalyticsHandle from './handle';

const ConsentComponent = React.lazy(() => import('../Components/Consent'));

interface AnalyticsReact {
  location: { search: string; pathname: string };
  history: { replace: (_: object) => void };
  children?: ReactNode;
}

const AnalyticsReact = ({ location, history, children }: AnalyticsReact) => {
  return (
    <AnalyticsContextProvider>
      <AnalyticsHandle location={location} history={history}>
        {children}

        <Suspense fallback={<></>}>
          <ConsentComponent endpoint={process.env.REACT_APP_ENDPOINT_ANALYTICS_URL} />
        </Suspense>
      </AnalyticsHandle>
    </AnalyticsContextProvider>
  );
};
export default AnalyticsReact;
