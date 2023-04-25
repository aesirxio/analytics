import React, { ReactNode, useEffect, useState } from 'react';
import qs from 'query-string';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
import { initTracker, startTracker, replaceUrl, endTracker, endTrackerVisibilityState } from '../utils/index';

interface AnalyticsHandle {
  location: { search: string; pathname: string };
  history: { replace: (_: object) => void };
  children?: ReactNode;
}

const AnalyticsHandle = ({ location, history, children }: AnalyticsHandle) => {
  const AnalyticsStore = React.useContext(AnalyticsContext);
  const endPoint = process.env.REACT_APP_ENDPOINT_ANALYTICS_URL;
  const [prevRoute, setPrevRoute] = useState<string>(location.pathname);
  useEffect(() => {
    const init = async () => {
      if (AnalyticsStore.visitor_uuid_start) {
        endTracker(endPoint, AnalyticsStore.event_uuid_start, AnalyticsStore.visitor_uuid_start);
      }

      if (!AnalyticsStore.visitor_uuid) {
        const urlParams = new URLSearchParams(window.location.search);
        const visitor_uuid = urlParams.get('visitor_uuid');
        if (visitor_uuid) {
          AnalyticsStore.setUUID(visitor_uuid);
        } else {
          const responseInit = await initTracker(endPoint);
          responseInit.visitor_uuid && AnalyticsStore.setUUID(responseInit.visitor_uuid);
          // Add Params to URL
          const queryParams = qs.parse(location.search);
          const newQueries = {
            ...queryParams,
            visitor_uuid: responseInit.visitor_uuid,
          };
          history.replace({ search: qs.stringify(newQueries) });
        }
      } else {
        // Add Params to URL
        const queryParams = qs.parse(location.search);
        const newQueries = {
          ...queryParams,
          visitor_uuid: AnalyticsStore.visitor_uuid,
        };
        history.replace({ search: qs.stringify(newQueries) });

        const referer = prevRoute ? prevRoute : '';
        const responseStart = await startTracker(endPoint, AnalyticsStore.visitor_uuid, referer);
        responseStart.event_uuid && AnalyticsStore.setEventIDStart(responseStart.event_uuid);
        responseStart.visitor_uuid && AnalyticsStore.setUUIDStart(responseStart.visitor_uuid);
        setPrevRoute(location.pathname);

        replaceUrl(AnalyticsStore.visitor_uuid);
      }
    };
    init();
  }, [location.pathname, AnalyticsStore.visitor_uuid, history]);

  useEffect(() => {
    const init = async () => {
      endTrackerVisibilityState(endPoint);
    };
    init();
  }, []);

  useEffect(() => {
    const init = async () => {
      window['event_uuid_start'] = AnalyticsStore.event_uuid_start
      window['visitor_uuid_start'] = AnalyticsStore.visitor_uuid_start
    };
    init();
  }, [AnalyticsStore.event_uuid_start, AnalyticsStore.visitor_uuid_start]);

  return <>{children}</>;
};
export default AnalyticsHandle;
