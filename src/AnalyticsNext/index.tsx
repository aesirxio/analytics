import React, { ReactNode } from 'react';

import AnalyticsContextProvider from '../utils/AnalyticsContextProvider';
import AnalyticsHandle from './handle';
import { NextRouter } from 'next/router';

interface AnalyticsNext {
  router: NextRouter;
  attributes: any;
  children?: ReactNode;
}

const AnalyticsNext = ({ router, attributes, children }: AnalyticsNext) => {
  return (
    <>
      <AnalyticsContextProvider>
        <AnalyticsHandle router={router} attributes={attributes}>
          {children}
        </AnalyticsHandle>
      </AnalyticsContextProvider>
    </>
  );
};
export default AnalyticsNext;
