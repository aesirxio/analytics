import React, { ReactNode } from 'react';

import AnalyticsContextProvider from '../utils/AnalyticsContextProvider';
import AnalyticsHandle from './handle';
import { NextRouter } from 'next/router';

interface AnalyticsNext {
  router: NextRouter;
  children?: ReactNode;
}

const AnalyticsNext = ({ router, children }: AnalyticsNext) => {
  return (
    <>
      <AnalyticsContextProvider>
        <AnalyticsHandle router={router}>{children}</AnalyticsHandle>
      </AnalyticsContextProvider>
    </>
  );
};
export default AnalyticsNext;
