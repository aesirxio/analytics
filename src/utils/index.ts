import { trackerService } from './services';
import Bowser from 'bowser';

const createRequest = (endpoint: string, task: string) => {
  return `${endpoint}/visitor/v1/${task}`;
};

/* FUNCTION */
const initTracker = async (
  endpoint: string,
  url?: string,
  referer?: string,
  user_agent?: string
) => {
  const { document } = window;
  const { pathname, search, origin } = location;
  url = `${origin}${pathname}${search}`;
  referer = document.referrer;
  user_agent = window.navigator.userAgent;
  const browser = Bowser.parse(window.navigator.userAgent);
  const browser_name = browser?.browser?.name;
  const browser_version = browser?.browser?.version ?? '0';
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
    try {
      const response = await trackerService(createRequest(endpoint, 'init'), {
        url: url,
        referer: referer,
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
    } catch (error) {
      window.alert('Analytics Error: ' + error);
      throw error;
    }
  }
};

const startTracker = async (endpoint: string, visitor_uuid?: string, referer?: string) => {
  const { location, document } = window;
  const { pathname, origin } = location;
  referer = referer
    ? location.protocol + '//' + location.host + referer
    : document.referrer
    ? removeParam('visitor_uuid', document.referrer)
    : `${origin}${pathname}`;
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
    referer: referer === '/' ? '' : referer,
    url: url,
  });

  return responseStart;
};

const trackEvent = async (
  endpoint: string,
  visitor_uuid: string,
  referer?: string,
  data?: object
) => {
  const { location, document } = window;
  referer = referer
    ? location.protocol + '//' + location.host + referer
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
    referer: referer === '/' ? '' : referer,
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

const endTracker = async (endpoint: string, event_uuid?: string, visitor_uuid?: string) => {
  const responseEnd = await trackerService(createRequest(endpoint, 'end'), {
    ...(event_uuid && {
      event_uuid: event_uuid,
    }),
    ...(visitor_uuid && {
      visitor_uuid: visitor_uuid,
    }),
  });
  return responseEnd;
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

export { initTracker, startTracker, trackEvent, insertParam, replaceUrl, endTracker, removeParam };
