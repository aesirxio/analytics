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

  if (allow === '0') {
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
      if (key.startsWith('utm_')) {
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
      device: device?.includes("iPhone") ? "mobile" : device?.includes("iPad") ? "tablet" : device,
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

  if (allow === '0') {
    return null;
  }

  const { location, document } = window;
  referer = referer
    ? location.protocol + '//' + location.host + referer
    : document.referrer.split('?')[0];
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
        device: device?.includes("iPhone") ? "mobile" : device?.includes("iPad") ? "tablet" : device,
        ...data,
      }),
    ],
    headers
  );
  const responseStart = navigator.sendBeacon(createRequestV2(endpoint, 'start'), blobData);

  return responseStart;
};

const insertParam = (key: string, value: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.pushState({ path: url.href }, '', url.href);
};

// Replace for NextJS, ReactJS
const getParameterByName = (name: string, url = window.location.href) => {
  if (url) {
    const params = new URL(url);
    return params.searchParams.get(name);
  }
  return;
};
const replaceUrl = (visitor_uuid: string) => {
  const anchors = document.getElementsByTagName('a');
  for (let i = 0; i < anchors.length; i++) {
    const visitorIdParams = getParameterByName('visitor_uuid', anchors[i].href);
    if (anchors[i].href) {
      const url = new URL(anchors[i].href);
      !visitorIdParams && visitor_uuid && url.searchParams.append('visitor_uuid', visitor_uuid);
      anchors[i].href = url.href;
    }
  }
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
      const response = await startTracker(endPoint);
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

function removeParam(key: string, sourceURL: string) {
  let rtn = sourceURL.split('?')[0],
    param,
    params_arr = [];
  const queryString = sourceURL.indexOf('?') !== -1 ? sourceURL.split('?')[1] : '';
  if (queryString !== '') {
    params_arr = queryString.split('&');
    for (let i = params_arr.length - 1; i >= 0; i -= 1) {
      param = params_arr[i].split('=')[0];
      if (param === key) {
        params_arr.splice(i, 1);
      }
    }
    if (params_arr.length) rtn = rtn + '?' + params_arr.join('&');
  }
  return rtn;
}

const shortenString = (str: string) => {
  return str.substring(0, 6) + '...' + str.substring(str.length - 4);
};

export {
  startTracker,
  trackEvent,
  insertParam,
  replaceUrl,
  endTracker,
  endTrackerVisibilityState,
  removeParam,
  shortenString,
};
