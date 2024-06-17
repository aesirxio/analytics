import React, { ReactNode, useEffect } from 'react';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
import { startTracker, endTracker, endTrackerVisibilityState } from '../utils/index';

interface AnalyticsHandle {
  location: { search: string; pathname: string };
  history: { replace: (_: object) => void };
  children?: ReactNode;
}

const AnalyticsHandle = ({ location, history, children }: AnalyticsHandle) => {
  const AnalyticsStore = React.useContext(AnalyticsContext);
  const endPoint = process.env.REACT_APP_ENDPOINT_ANALYTICS_URL;
  useEffect(() => {
    const init = async () => {
      if (!AnalyticsStore.visitor_uuid) {
        const referer = location.pathname ? location.pathname : '';
        window['referer'] = referer;
        const responseStart = await startTracker(endPoint, '', referer);
        responseStart?.event_uuid && AnalyticsStore.setEventID(responseStart.event_uuid);
        responseStart?.visitor_uuid && AnalyticsStore.setUUID(responseStart.visitor_uuid);
      } else {
        endTracker(endPoint, window['event_uuid'], AnalyticsStore.visitor_uuid);
      }
    };
    init();
  }, [location.pathname, history]);

  useEffect(() => {
    const init = async () => {
      endTrackerVisibilityState(endPoint);
    };
    init();
  }, []);

  useEffect(() => {
    const init = async () => {
      window['event_uuid'] = AnalyticsStore.event_uuid;
      window['visitor_uuid'] = AnalyticsStore.visitor_uuid;
    };
    init();
  }, [AnalyticsStore.event_uuid, AnalyticsStore.visitor_uuid]);

  return <>{children}</>;
};
export default AnalyticsHandle;
