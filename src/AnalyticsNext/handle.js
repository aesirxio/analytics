import React, { useCallback, useEffect, useState } from 'react';
import { AnalyticsContext } from './AnalyticsContextProvider';
import { initTracker, startTracker, endTracker } from '../utils';
const AnalyticsHandle = ({ router }) => {
  const AnalyticsStore = React.useContext(AnalyticsContext);
  const endPoint = process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL;
  const [prevRoute, setPrevRoute] = useState(router.asPath);
  const handleStartTracker = useCallback(
    async (prevRoute) => {
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
    },
    [AnalyticsStore, endPoint]
  );

  useEffect(() => {
    const init = async () => {
      if (!AnalyticsStore.event_id && !AnalyticsStore.uuid) {
        const responseInit = await initTracker(endPoint);
        responseInit.result.event_id && AnalyticsStore.setEventID(responseInit.result.event_id);
        AnalyticsStore.setUUID(responseInit.result.uuid);
      } else {
        await handleStartTracker();
      }
    };
    init();
  }, [AnalyticsStore.uuid]);

  useEffect(() => {
    const handleRouteChange = async () => {
      if (AnalyticsStore.uuid_start) {
        await endTracker(endPoint, AnalyticsStore.event_id_start, AnalyticsStore.uuid_start);
        await handleStartTracker(prevRoute);
      }
      setPrevRoute(router.asPath);
    };
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, AnalyticsStore.uuid_start, router.asPath]);

  return <></>;
};
export default AnalyticsHandle;
