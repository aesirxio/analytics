import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
import { initTracker, startTracker, replaceUrl, removeParam, endTracker, endTrackerVisibilityState } from '../utils/index';

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
  const [prevRoute, setPrevRoute] = useState<string>('');
  const handleStartTracker = useCallback(
    async (prevRoute: string) => {
      const referer = prevRoute ? prevRoute : '';
      const responseStart = await startTracker(endPoint, AnalyticsStore.visitor_uuid, referer);
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
        await handleStartTracker(removeParam('visitor_uuid', router.asPath));
      }
    };
    init();
  }, [AnalyticsStore.visitor_uuid]);

  useEffect(() => {
    const handleRouteChange = async () => {
      const { visitor_uuid } = router.query;
      visitor_uuid && setPrevRoute(removeParam('visitor_uuid', router.asPath));
      if (AnalyticsStore.visitor_uuid_start && !visitor_uuid) {
        endTracker(endPoint, AnalyticsStore.event_uuid_start,AnalyticsStore.visitor_uuid_start);
        await handleStartTracker(prevRoute);
      }
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    const urlParams = new URLSearchParams(window.location.search);
    const visitor_uuid = urlParams.get('visitor_uuid');
    const state = urlParams.get('state');
    const code = urlParams.get('code');
    if (!visitor_uuid && !state && !code) {
      router.replace(
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
