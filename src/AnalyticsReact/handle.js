import React, { useEffect, useState } from 'react';
import { AnalyticsContext } from './AnalyticsContextProvider';
import { initTracker, startTracker, endTracker } from '../utils';
const AnalyticsHandle = ({ pathname }) => {
  const AnalyticsStore = React.useContext(AnalyticsContext);
  const endPoint = process.env.REACT_APP_ENDPOINT_ANALYTICS_URL;
  const [prevRoute, setPrevRoute] = useState();
  useEffect(() => {
    const init = async () => {
      if (AnalyticsStore.uuid_start) {
        await endTracker(endPoint, AnalyticsStore.event_id_start, AnalyticsStore.uuid_start);
      }
      if (!AnalyticsStore.event_id && !AnalyticsStore.uuid) {
        const responseInit = await initTracker(endPoint);
        responseInit.result.event_id && AnalyticsStore.setEventID(responseInit.result.event_id);
        AnalyticsStore.setUUID(responseInit.result.uuid);
      } else {
        const referrer = prevRoute ? prevRoute : '';
        const responseStart = await startTracker(
          endPoint,
          AnalyticsStore.event_id,
          AnalyticsStore.uuid,
          referrer
        );
        responseStart.result.event_id &&
          AnalyticsStore.setEventIDStart(responseStart.result.event_id);
        responseStart.result.uuid && AnalyticsStore.setUUIDStart(responseStart.result.uuid);
        setPrevRoute(pathname);
      }
    };
    init();
  }, [pathname, AnalyticsStore.uuid, history]);

  return <></>;
};
export default AnalyticsHandle;
