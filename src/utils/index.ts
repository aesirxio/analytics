import { trackerService } from './services';
import Bowser from 'bowser';

const createRequest = (endpoint: string, task: string) => {
  return `${endpoint}/visitor/v1/${task}`;
};

/* FUNCTION */
const initTracker = async (
  endpoint: string,
  url?: string,
  referrer?: string,
  user_agent?: string
) => {
  const { document } = window;
  const { pathname, search, origin } = location;
  url = `${origin}${pathname}${search}`;
  referrer = document.referrer;
  user_agent = window.navigator.userAgent;
  const browser = Bowser.parse(window.navigator.userAgent);
  const browser_name = browser?.browser?.name;
  const browser_version = browser?.browser?.version;
  const lang = window.navigator['userLanguage'] || window.navigator.language;
  const device = browser?.platform?.model ?? browser?.platform?.type;
  const domain = `${origin}`;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const attributes = [];
  for (const key of urlParams.keys()) {
    if (key.startsWith('utm_')) {
      urlParams.get(key) && attributes.push({ name: key, value: urlParams.get(key) });
    }
  }
  if (!urlParams.get('visitor_uuid')) {
    const ip = '';
    const response = await trackerService(createRequest(endpoint, 'init'), {
      url: url,
      referrer: referrer,
      user_agent: user_agent,
      ip: ip,
      domain: domain,
      browser_name: browser_name,
      browser_version: browser_version,
      lang: lang,
      device: device,
      event_name: 'visit',
      event_type: 'action',
      attributes: attributes,
    });
    return response;
  }
};

const startTracker = async (endpoint: string, visitor_uuid?: string, referrer?: string) => {
  const { location, document } = window;
  referrer = referrer
    ? location.protocol + '//' + location.host + referrer
    : document.referrer.split('?')[0];
  const url = location.protocol + '//' + location.host + location.pathname;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const responseStart = await trackerService(createRequest(endpoint, 'start'), {
    ...(urlParams.get('visitor_uuid') && {
      visitor_uuid: urlParams.get('visitor_uuid'),
    }),
    ...(visitor_uuid && {
      visitor_uuid: visitor_uuid,
    }),
    referrer: referrer === '/' ? '' : referrer,
    url: url,
  });

  return responseStart;
};

const endTracker = async (endpoint: string, event_uuid?: string, visitor_uuid?: string) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const responseEnd = await trackerService(createRequest(endpoint, 'end'), {
    ...(urlParams.get('event_uuid_start') && {
      event_uuid: urlParams.get('event_uuid_start'),
    }),
    ...(urlParams.get('visitor_uuid_start') && {
      visitor_uuid: urlParams.get('visitor_uuid_start'),
    }),
    ...(event_uuid && {
      event_uuid: event_uuid,
    }),
    ...(visitor_uuid && {
      visitor_uuid: visitor_uuid,
    }),
  });
  return responseEnd;
};

const trackEvent = async (
  endpoint: string,
  visitor_uuid: string,
  referrer?: string,
  data?: object
) => {
  const { location, document } = window;
  referrer = referrer
    ? location.protocol + '//' + location.host + referrer
    : document.referrer.split('?')[0];
  const url = location.protocol + '//' + location.host + location.pathname;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const responseStart = await trackerService(createRequest(endpoint, 'start'), {
    ...(urlParams.get('visitor_uuid') && {
      visitor_uuid: urlParams.get('visitor_uuid'),
    }),
    ...(visitor_uuid && {
      visitor_uuid: visitor_uuid,
    }),
    referrer: referrer === '/' ? '' : referrer,
    url: url,
    ...data,
  });

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

export { initTracker, startTracker, endTracker, trackEvent, insertParam, replaceUrl };
