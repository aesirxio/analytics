import React, { ReactNode } from 'react';

import { AnalyticsContextProvider } from '../utils/AnalyticsContextProvider';
import AnalyticsHandle from './handle';

interface AnalyticsReact {
  pathname: string;
  children?: ReactNode;
}

const AnalyticsReact = ({ pathname, children }: AnalyticsReact) => {
  return (
    <AnalyticsContextProvider>
      <AnalyticsHandle pathname={pathname}>{children}</AnalyticsHandle>
    </AnalyticsContextProvider>
  );
};
export default AnalyticsReact;
