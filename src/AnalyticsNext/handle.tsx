import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
import { initTracker, startTracker, replaceUrl } from '../utils/index';

interface AnalyticsHandle {
  router: {
    asPath: string;
    events: { on: (_: string, __: () => void) => void; off: (_: string, __: () => void) => void };
    replace: any;
    query: any;
    push: any;
  };
  children?: ReactNode;
}

const AnalyticsHandle = ({ router, children }: AnalyticsHandle) => {
  const AnalyticsStore = React.useContext(AnalyticsContext);
  const endPoint = process.env.NEXT_PUBLIC_ENDPOINT_ANALYTICS_URL;
  const [prevRoute, setPrevRoute] = useState<string>(router.asPath);
  const handleStartTracker = useCallback(
    async (prevRoute: string) => {
      const referrer = prevRoute ? prevRoute : '';
      const responseStart = await startTracker(endPoint, AnalyticsStore.visitor_uuid, referrer);
      responseStart.event_uuid && AnalyticsStore.setEventIDStart(responseStart.event_uuid);
      responseStart.visitor_uuid && AnalyticsStore.setUUIDStart(responseStart.visitor_uuid);
    },
    [AnalyticsStore, endPoint]
  );

  useEffect(() => {
    const init = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const visitor_uuid = urlParams.get('visitor_uuid');
      if (!AnalyticsStore.visitor_uuid) {
        if (visitor_uuid) {
          AnalyticsStore.setUUID(visitor_uuid);
        } else {
          const responseInit = await initTracker(endPoint);
          responseInit?.visitor_uuid && AnalyticsStore.setUUID(responseInit?.visitor_uuid);
        }
      } else {
        await handleStartTracker(prevRoute);
      }
    };
    init();
  }, [AnalyticsStore.visitor_uuid]);

  useEffect(() => {
    const handleRouteChange = async () => {
      const { visitor_uuid } = router.query;
      if (AnalyticsStore.visitor_uuid_start && !visitor_uuid) {
        await handleStartTracker(prevRoute);
      }
      setPrevRoute(router.asPath);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    const urlParams = new URLSearchParams(window.location.search);
    const visitor_uuid = urlParams.get('visitor_uuid');
    const state = urlParams.get('state');
    const code = urlParams.get('code');
    if (!visitor_uuid && !state && !code) {
      router.push(
        {
          query: {
            ...router.query,
            visitor_uuid: AnalyticsStore.visitor_uuid,
          },
        },
        undefined,
        {
          shallow: true,
        }
      );
    }
    visitor_uuid && replaceUrl(visitor_uuid);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, AnalyticsStore.visitor_uuid_start, router.asPath]);

  return <>{children}</>;
};
export default AnalyticsHandle;