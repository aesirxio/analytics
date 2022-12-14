import React, { useCallback, useEffect, useState } from 'react';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
import { initTracker, startTracker, endTracker } from '../utils/index';
const AnalyticsHandle = ({ router }) => {
  const AnalyticsStore = React.useContext(AnalyticsContext);
  const endPoint = process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL;
  const [prevRoute, setPrevRoute] = useState(router.asPath);
  const handleStartTracker = useCallback(
    async (prevRoute) => {
      const referrer = prevRoute ? prevRoute : '';
      const responseStart = await startTracker(
        endPoint,
        AnalyticsStore.event_uuid,
        AnalyticsStore.visitor_uuid,
        referrer
      );
      responseStart.event_uuid && AnalyticsStore.setEventIDStart(responseStart.event_uuid);
      responseStart.visitor_uuid && AnalyticsStore.setUUIDStart(responseStart.visitor_uuid);
    },
    [AnalyticsStore, endPoint]
  );

  useEffect(() => {
    const init = async () => {
      if (!AnalyticsStore.event_uuid && !AnalyticsStore.visitor_uuid) {
        const responseInit = await initTracker(endPoint);
        responseInit.event_uuid && AnalyticsStore.setEventID(responseInit.event_uuid);
        AnalyticsStore.setUUID(responseInit.visitor_uuid);
      } else {
        await handleStartTracker();
      }
    };
    init();
  }, [AnalyticsStore.visitor_uuid]);

  useEffect(() => {
    const handleRouteChange = async () => {
      if (AnalyticsStore.visitor_uuid_start) {
        await endTracker(
          endPoint,
          AnalyticsStore.event_uuid_start,
          AnalyticsStore.visitor_uuid_start
        );
        await handleStartTracker(prevRoute);
      }
      setPrevRoute(router.asPath);
    };
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, AnalyticsStore.visitor_uuid_start, router.asPath]);

  return <></>;
};
export default AnalyticsHandle;
