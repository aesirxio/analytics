import React, { ReactNode } from 'react';

import { AnalyticsContextProvider } from '../utils/AnalyticsContextProvider';
import AnalyticsHandle from './handle';

interface AnalyticsReact {
  router: {
    asPath: string;
    events: { on: () => void; off: () => void };
    replace: any;
    query: any;
    push: any;
  };
  children?: ReactNode;
}

const AnalyticsNext = ({ router, children }: AnalyticsReact) => {
  return (
    <>
      <AnalyticsContextProvider>
        <AnalyticsHandle router={router}>{children}</AnalyticsHandle>
      </AnalyticsContextProvider>
    </>
  );
};
export default AnalyticsNext;
