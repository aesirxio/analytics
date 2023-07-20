import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
import { startTracker, endTracker, endTrackerVisibilityState } from '../utils/index';

interface AnalyticsHandle {
  router: any;
  children?: ReactNode;
}

const AnalyticsHandle = ({ router, children }: AnalyticsHandle) => {
  const AnalyticsStore = React.useContext(AnalyticsContext);
  const endPoint = process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL;
  const [prevRoute, setPrevRoute] = useState<string>('');
  const handleStartTracker = useCallback(
    async (prevRoute: string) => {
      const referer = prevRoute ? prevRoute : '';
      window['referer'] = referer;
      const responseStart = await startTracker(endPoint, '', referer);
      responseStart?.event_uuid && AnalyticsStore.setEventID(responseStart.event_uuid);
      responseStart?.visitor_uuid && AnalyticsStore.setUUID(responseStart.visitor_uuid);
    },
    [AnalyticsStore, endPoint]
  );

  useEffect(() => {
    const init = async () => {
      if (!AnalyticsStore.visitor_uuid) {
        await handleStartTracker(router.asPath);
      }
    };
    init();
  }, [AnalyticsStore.visitor_uuid]);

  useEffect(() => {
    const handleRouteChange = async () => {
      setPrevRoute(router.asPath);
      if (AnalyticsStore.visitor_uuid) {
        endTracker(endPoint, window['event_uuid'], AnalyticsStore.visitor_uuid);
        await handleStartTracker(prevRoute);
      }
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, router.asPath, router.query]);
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
