import React, { ReactNode, useEffect, useState } from 'react';
import qs from 'query-string';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
import { initTracker, startTracker, endTracker } from '../utils/index';

interface AnalyticsHandle {
  location: { search: string; pathname: string };
  history: { push: (_: object) => void };
  children?: ReactNode;
}

const AnalyticsHandle = ({ location, history, children }: AnalyticsHandle) => {
  const AnalyticsStore = React.useContext(AnalyticsContext);
  const endPoint = process.env.REACT_APP_ENDPOINT_ANALYTICS_URL;
  const [prevRoute, setPrevRoute] = useState<string>(null);
  useEffect(() => {
    const init = async () => {
      if (AnalyticsStore.visitor_uuid_start) {
        await endTracker(
          endPoint,
          AnalyticsStore.event_uuid_start,
          AnalyticsStore.visitor_uuid_start
        );
      }
      if (!AnalyticsStore.event_uuid && !AnalyticsStore.visitor_uuid) {
        const urlParams = new URLSearchParams(window.location.search);
        const event_uuid = urlParams.get('event_uuid');
        const visitor_uuid = urlParams.get('visitor_uuid');
        if (event_uuid && visitor_uuid) {
          AnalyticsStore.setEventID(event_uuid);
          AnalyticsStore.setUUID(visitor_uuid);
        } else {
          const responseInit = await initTracker(endPoint);
          responseInit.event_uuid && AnalyticsStore.setEventID(responseInit.event_uuid);
          AnalyticsStore.setUUID(responseInit.visitor_uuid);
          // Add Params to URL
          const queryParams = qs.parse(location.search);
          const newQueries = {
            ...queryParams,
            event_uuid: responseInit.event_uuid,
            visitor_uuid: responseInit.visitor_uuid,
          };
          history.push({ search: qs.stringify(newQueries) });
        }
      } else {
        // Add Params to URL
        const queryParams = qs.parse(location.search);
        const newQueries = {
          ...queryParams,
          event_uuid: AnalyticsStore.event_uuid,
          visitor_uuid: AnalyticsStore.visitor_uuid,
        };
        history.push({ search: qs.stringify(newQueries) });

        const referrer = prevRoute ? prevRoute : '';
        const responseStart = await startTracker(
          endPoint,
          AnalyticsStore.event_uuid,
          AnalyticsStore.visitor_uuid,
          referrer
        );
        responseStart.event_uuid && AnalyticsStore.setEventIDStart(responseStart.event_uuid);
        responseStart.visitor_uuid && AnalyticsStore.setUUIDStart(responseStart.visitor_uuid);
        setPrevRoute(location.pathname);
      }
    };
    init();
  }, [location.pathname, AnalyticsStore.visitor_uuid, history]);

  return <>{children}</>;
};
export default AnalyticsHandle;
