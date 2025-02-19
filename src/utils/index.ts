import { trackerService } from './services';
import Bowser from 'bowser';
import getFingerprint from '../lib/fingerprint';
const createRequest = (endpoint: string, task: string) => {
  return `${endpoint}/visitor/v1/${task}`;
};
const createRequestV2 = (endpoint: string, task: string) => {
  return `${endpoint}/visitor/v2/${task}`;
};

const rememberFlow = (endpoint: string, flow: string) => {
  return `${endpoint}/remember_flow/${flow}`;
};

const startTracker = async (
  endpoint: string,
  url?: string,
  referer?: string,
  user_agent?: string,
  attributesVisit?: any
) => {
  const allow = sessionStorage.getItem('aesirx-analytics-allow');
  const reject = sessionStorage.getItem('aesirx-analytics-rejected');

  if (allow === '0' || reject === 'true') {
    return null;
  }
  const { location, document } = window;
  const { pathname, search, origin } = location;
  url = `${origin}${pathname}${search}`;
  referer = referer
    ? location.protocol + '//' + location.host + referer
    : document.referrer
      ? document.referrer
      : window['referer']
        ? window['referer'] === '/'
          ? location.protocol + '//' + location.host
          : location.protocol + '//' + location.host + window['referer']
        : '';
  user_agent = window.navigator.userAgent;
  const browser = Bowser.parse(window.navigator.userAgent);
  const browser_name = browser?.browser?.name;
  const browser_version = browser?.browser?.version ?? '0';
  const lang = window.navigator['userLanguage'] || window.navigator.language;
  const device = browser?.platform?.model ?? browser?.platform?.type;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const ip = '';

  try {
    const fingerprint = getFingerprint();
    const attributes = [];
    for (const key of urlParams.keys()) {
      if (key.startsWith('utm_') || key.startsWith('gad_')) {
        urlParams.get(key) && attributes.push({ name: key, value: urlParams.get(key) });
      }
    }
    if (attributesVisit?.length) {
      attributesVisit?.forEach((element: any) => {
        element?.name && attributes.push({ name: element?.name, value: element?.value });
      });
    }
    const responseStart = await trackerService(createRequestV2(endpoint, 'start'), {
      fingerprint: fingerprint,
      url: url?.replace(/^(https?:\/\/)?(www\.)?/, '$1'),
      ...(referer &&
        (referer !== url || document.referrer) && {
          referer:
            referer !== url
              ? referer?.replace(/^(https?:\/\/)?(www\.)?/, '$1')
              : document.referrer?.replace(/^(https?:\/\/)?(www\.)?/, '$1'),
        }),
      user_agent: user_agent,
      ip: ip,
      browser_name: browser_name,
      browser_version: browser_version,
      lang: lang,
      device: device?.includes('iPhone') ? 'mobile' : device?.includes('iPad') ? 'tablet' : device,
      ...(attributes?.length && {
        event_name: 'visit',
        event_type: 'action',
        attributes: attributes,
      }),
    });
    if (
      window['aesirxTrackEcommerce'] === 'true' &&
      sessionStorage.getItem('aesirx-analytics-flow') !== (await responseStart)?.flow_uuid
    ) {
      sessionStorage.setItem('aesirx-analytics-flow', (await responseStart)?.flow_uuid);
      try {
        await trackerService(
          rememberFlow(window.location.origin, (await responseStart)?.flow_uuid),
          {}
        );
      } catch (error) {
        console.log('Remember Flow Error', error);
      }
    }
    return responseStart;
  } catch (error) {
    console.error('Analytics Error: ', error);
  }
};

const trackEvent = async (endpoint: string, referer?: string, data?: object) => {
  const allow = sessionStorage.getItem('aesirx-analytics-allow');
  const reject = sessionStorage.getItem('aesirx-analytics-rejected');
  if (allow === '0' || reject === 'true') {
    return null;
  }

  const { location, document } = window;
  referer = referer
    ? location.protocol + '//' + location.host + referer
    : document.referrer
      ? document.referrer
      : window['referer']
        ? window['referer'] === '/'
          ? location.protocol + '//' + location.host
          : location.protocol + '//' + location.host + window['referer']
        : '';
  const url = location.protocol + '//' + location.host + location.pathname;
  const user_agent = window.navigator.userAgent;
  const browser = Bowser.parse(window.navigator.userAgent);
  const browser_name = browser?.browser?.name;
  const browser_version = browser?.browser?.version ?? '0';
  const lang = window.navigator['userLanguage'] || window.navigator.language;
  const device = browser?.platform?.model ?? browser?.platform?.type;
  const ip = '';

  const fingerprint = getFingerprint();
  const headers = { type: 'application/json' };
  const blobData = new Blob(
    [
      JSON.stringify({
        fingerprint: fingerprint,
        url: url?.replace(/^(https?:\/\/)?(www\.)?/, '$1'),
        ...(referer !== '/' &&
          referer && {
            referer: referer?.replace(/^(https?:\/\/)?(www\.)?/, '$1'),
          }),
        user_agent: user_agent,
        ip: ip,
        browser_name: browser_name,
        browser_version: browser_version,
        lang: lang,
        device: device?.includes('iPhone')
          ? 'mobile'
          : device?.includes('iPad')
            ? 'tablet'
            : device,
        ...data,
      }),
    ],
    headers
  );
  const responseStart = navigator.sendBeacon(createRequestV2(endpoint, 'start'), blobData);

  return responseStart;
};

const endTracker = (endPoint: string, event_uuid: string, visitor_uuid: string) => {
  if (event_uuid && visitor_uuid) {
    const body = {
      event_uuid: event_uuid,
      visitor_uuid: visitor_uuid,
    };
    const headers = { type: 'application/json' };
    const blob = new Blob([JSON.stringify(body)], headers);
    navigator.sendBeacon(createRequest(endPoint, 'end'), blob);
  }
};

const endTrackerVisibilityState = (endPoint: string) => {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') {
      endTracker(endPoint, window['event_uuid'], window['visitor_uuid']);
    }
    if (document.visibilityState === 'visible') {
      const response = await startTracker(endPoint, '', '', '', window['attributes']);
      window['event_uuid'] = response?.event_uuid;
    }
  });
  window.addEventListener(
    'pagehide',
    (event) => {
      if (event.persisted) {
        endTracker(endPoint, window['event_uuid'], window['visitor_uuid']);
      }
    },
    false
  );
};

const unBlockScripts = () => {
  window['configBlockJS']._backupNodes = window['configBlockJS']?._backupNodes.filter(
    ({ position, node, uniqueID }: any) => {
      try {
        if (node.nodeName.toLowerCase() === 'script') {
          const scriptNode = document.createElement('script');
          scriptNode.src = node.src;
          scriptNode.type = 'text/javascript';
          document[position].appendChild(scriptNode);
        } else {
          const frame = document.getElementById(uniqueID);
          if (!frame) return false;
          const iframe: any = document.createElement('iframe');
          iframe.src = node.src;
          iframe.width = frame.offsetWidth;
          iframe.height = frame.offsetHeight;
          frame.parentNode.insertBefore(iframe, frame);
          frame.parentNode.removeChild(frame);
        }
        return false;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  );
};
export { startTracker, trackEvent, endTracker, endTrackerVisibilityState, unBlockScripts };
