import React, { ReactNode, Suspense } from 'react';

import AnalyticsContextProvider from '../utils/AnalyticsContextProvider';
import AnalyticsHandle from './handle';
import { NextRouter } from 'next/router';

const ConsentComponent = React.lazy(() => import('../Components/Consent'));

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
          <Suspense fallback={<></>}>
            <ConsentComponent endpoint={process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL} />
          </Suspense>
        </AnalyticsHandle>
      </AnalyticsContextProvider>
    </>
  );
};
export default AnalyticsNext;
