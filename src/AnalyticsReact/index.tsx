import React, { ReactNode } from 'react';

import AnalyticsContextProvider from '../utils/AnalyticsContextProvider';
import AnalyticsHandle from './handle';

interface AnalyticsReact {
  location: { search: string; pathname: string };
  history: { replace: (_: object) => void };
  children?: ReactNode;
  oldLayout?: boolean;
  isOptInReplaceAnalytics?: boolean;
}

const AnalyticsReact = ({ location, history, children }: AnalyticsReact) => {
  return (
    <AnalyticsContextProvider>
      <AnalyticsHandle location={location} history={history}>
        {children}
      </AnalyticsHandle>
    </AnalyticsContextProvider>
  );
};
export default AnalyticsReact;
