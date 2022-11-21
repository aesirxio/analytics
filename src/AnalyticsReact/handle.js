import React, { useEffect, useState } from 'react';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
import { initTracker, startTracker, endTracker } from '../utils/index';
const AnalyticsHandle = ({ pathname }) => {
  const AnalyticsStore = React.useContext(AnalyticsContext);
  const endPoint = process.env.REACT_APP_ENDPOINT_ANALYTICS_URL;
  const [prevRoute, setPrevRoute] = useState();
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
        const responseInit = await initTracker(endPoint);
        responseInit.event_uuid && AnalyticsStore.setEventID(responseInit.event_uuid);
        AnalyticsStore.setUUID(responseInit.visitor_uuid);
      } else {
        const referrer = prevRoute ? prevRoute : '';
        const responseStart = await startTracker(
          endPoint,
          AnalyticsStore.event_uuid,
          AnalyticsStore.visitor_uuid,
          referrer
        );
        responseStart.event_uuid && AnalyticsStore.setEventIDStart(responseStart.event_uuid);
        responseStart.visitor_uuid && AnalyticsStore.setUUIDStart(responseStart.visitor_uuid);
        setPrevRoute(pathname);
      }
    };
    init();
  }, [pathname, AnalyticsStore.visitor_uuid, history]);

  return <></>;
};
export default AnalyticsHandle;
