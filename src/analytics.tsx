import {
  cleanHostName,
  endTrackerVisibilityState,
  escapeRegex,
  getYoutubeID,
  randomString,
  startTracker,
  trackEvent,
} from './utils';
import {
  addToCartAnalytics,
  checkoutAnalytics,
  searchAnalytics,
  viewProductAnalytics,
} from './utils/woocommerce';
import React, { useEffect, useState } from 'react';

import { createRoot } from 'react-dom/client';
import { AnalyticsContext } from './utils/AnalyticsContextProvider';
import ConsentComponent from './Components/Consent';
import ConsentComponentCustom from './Components/ConsentCustom';
import OptinConsent from './Components/OptInConsent';
import { Buffer } from 'buffer';
import { appLanguages } from './translations';
import { AesirXI18nextProvider } from './utils/I18nextProvider';
import { getConsentTemplate } from './utils/consent';

window.Buffer = Buffer;
declare global {
  interface Window {
    process: any;
    funcAfterConsent: any;
    funcAfterReject: any;
    configBlockJS: any;
  }
}
const ConsentPopup = ({ visitor_uuid, event_uuid }: any) => {
  window.process = { env: '' };
  const [layout, setLayout] = useState(window['consentLayout'] ?? 'simple-consent-mode');
  const [gtagId, setGtagId] = useState(window['analyticsGtagId']);
  const [gtmId, setGtmId] = useState(window['analyticsGtmId']);
  const [customConsentText, setCustomConsentText] = useState(window['analyticsConsentText']);
  useEffect(() => {
    const init = async () => {
      const data: any = await getConsentTemplate(
        window['aesirx1stparty'] ?? '',
        window.location.host
      );
      setLayout(data?.data?.template ?? window['consentLayout']);
      setGtagId(data?.data?.gtag_id ?? window['analyticsGtagId']);
      setGtmId(data?.data?.gtm_id ?? window['analyticsGtmId']);
      setCustomConsentText(data?.data?.consent_text ?? window['analyticsConsentText']);
    };
    init();
  }, []);
  return (
    <AnalyticsContext.Provider
      value={{
        event_uuid: event_uuid,
        visitor_uuid: visitor_uuid ?? sessionStorage.getItem('aesirx-analytics-uuid'),
        setEventID: undefined,
        setUUID: undefined,
        ref: undefined,
      }}
    >
      <AesirXI18nextProvider appLanguages={appLanguages}>
        {layout === 'original' ? (
          <ConsentComponent
            endpoint={window['aesirx1stparty'] ?? ''}
            networkEnv={window['concordiumNetwork'] ?? ''}
            aesirXEndpoint={window['aesirxEndpoint'] ?? 'https://api.aesirx.io'}
            gtagId={gtagId}
            gtmId={gtmId}
            customConsentText={customConsentText}
          />
        ) : (
          <ConsentComponentCustom
            endpoint={window['aesirx1stparty'] ?? ''}
            networkEnv={window['concordiumNetwork'] ?? ''}
            aesirXEndpoint={window['aesirxEndpoint'] ?? 'https://api.aesirx.io'}
            languageSwitcher={window['languageSwitcher'] ?? ''}
            gtagId={gtagId}
            gtmId={gtmId}
            layout={layout}
            customConsentText={customConsentText}
          />
        )}
      </AesirXI18nextProvider>
    </AnalyticsContext.Provider>
  );
};
let rootElement: any = {};
window.addEventListener('DOMContentLoaded', function () {
  const container = document.body?.appendChild(document.createElement('DIV'));
  rootElement = createRoot(container);
});
const AesirAnalytics = () => {
  const hook = (_this: object, method: string, callback: (_: string) => void) => {
    const orig = _this[method];

    return (...args: []) => {
      callback.apply(null, args);

      return orig.apply(_this, args);
    };
  };

  /* Handle history changes */

  const handlePush = async (url: string) => {
    if (!url) return;
    const { pathname, search, origin } = location;
    url = `${origin}${pathname}${search}`;
    const newUrl = url.toString();

    if (newUrl.substring(0, 4) === 'http') {
      url = '/' + newUrl.split('/').splice(3).join('/');
    } else {
      url = newUrl;
    }
  };

  /* Global */

  if (!window['tracker']) {
    const tracker = (eventValue: string) => eventValue;
    tracker.startTracker = startTracker;

    window['tracker'] = tracker;
  }

  /* Start */

  history.pushState = hook(history, 'pushState', handlePush);
  history.replaceState = hook(history, 'replaceState', handlePush);

  const hostUrl = window['aesirx1stparty'] ? window['aesirx1stparty'] : '';

  const root = hostUrl ? hostUrl.replace(/\/$/, '') : '';

  const { currentScript } = document;
  if (!currentScript) return;
  const _data = 'data-';
  const _false = 'false';
  const attr = currentScript.getAttribute.bind(currentScript);
  const dataEvents = attr(_data + 'aesirx-event-name') !== _false;
  const eventSelect = '[data-aesirx-event-name]';

  const update = async () => {
    if (document.readyState === 'complete') {
      const responseStart = await startTracker(root);
      if (responseStart) {
        window['event_uuid'] = responseStart.event_uuid;
        window['visitor_uuid'] = responseStart.visitor_uuid;
      }
      const isOptInReplaceAnalytics = window['optInConsentData']
        ? JSON.parse(window?.optInConsentData)?.some((obj: any) =>
            Object.keys(obj).includes('replaceAnalyticsConsent')
          )
        : false;
      if (window['disableAnalyticsConsent'] !== 'true' || !isOptInReplaceAnalytics) {
        rootElement.render(
          <>
            {!isOptInReplaceAnalytics && (
              <ConsentPopup
                event_uuid={responseStart?.visitor_uuid}
                visitor_uuid={responseStart?.visitor_uuid}
              />
            )}
            {window['optInConsentData'] && (
              <AesirXI18nextProvider appLanguages={appLanguages}>
                <OptinConsent />
              </AesirXI18nextProvider>
            )}
          </>
        );
      }

      if (dataEvents) {
        addEvents(document);
      }
    }
  };

  document.addEventListener('readystatechange', update, true);

  endTrackerVisibilityState(root);

  /* Handle events */

  const addEvents = (node: Document) => {
    const elements = node.querySelectorAll(eventSelect);
    Array.prototype.forEach.call(elements, addEvent);
  };

  const addEvent = (element: HTMLInputElement) => {
    element.addEventListener(
      'click',
      () => {
        const attribute: object[] = [];
        Object.keys(element.dataset).forEach((key) => {
          if (key.startsWith('aesirxEventAttribute')) {
            attribute.push({
              name: key.replace('aesirxEventAttribute', '').toLowerCase(),
              value: element.dataset[key],
            });
          }
        });
        trackEvent(root, '', {
          event_name: element.dataset.aesirxEventName,
          event_type: element.dataset.aesirxEventType,
          attributes: attribute,
        });
      },
      true
    );
  };

  update();
};

const WoocommerceAnalytics = () => {
  addToCartAnalytics();
  searchAnalytics();
  checkoutAnalytics();
  viewProductAnalytics();
};

AesirAnalytics();
document.addEventListener('DOMContentLoaded', () => {
  if (
    document.body.classList.contains('woocommerce-js') ||
    document.body.classList.contains('woocommerce-no-js')
  ) {
    WoocommerceAnalytics();
  }
});
const configBlockJS: any = {
  _providersToBlock: [],
  categories: [],
  _shortCodes: [],
  _backupNodes: [],
};
window.configBlockJS = configBlockJS;
const addProviderToList = (node: any, cleanedHostname: any) => {
  const nodeCategory = node.hasAttribute('data-cookieyes') && node.getAttribute('data-cookieyes');
  if (!nodeCategory) return;
  const categoryName = nodeCategory.replace('cookieyes-', '');
  const provider = configBlockJS?._providersToBlock?.find(({ re }: any) => re === cleanedHostname);
  if (!provider) {
    configBlockJS._providersToBlock.push({
      re: cleanedHostname,
      categories: [categoryName],
      fullPath: false,
    });
  } else if (!provider.isOverridden) {
    provider.categories = [categoryName];
    provider.isOverridden = true;
  } else if (!provider.categories.includes(categoryName)) provider.categories.push(categoryName);
};

const addPlaceholder = (htmlElm: any, uniqueID: any) => {
  const shortCodeData = configBlockJS._shortCodes.find(
    (code: any) => code.key === 'cky_video_placeholder'
  );
  const videoPlaceHolderDataCode = shortCodeData.content;
  const { offsetWidth, offsetHeight } = htmlElm;
  if (offsetWidth === 0 || offsetHeight === 0) return;
  htmlElm.insertAdjacentHTML(
    'beforebegin',
    `${videoPlaceHolderDataCode}`.replace('[UNIQUEID]', uniqueID)
  );
  const addedNode = document.getElementById(uniqueID);
  addedNode.style.width = `${offsetWidth}px`;
  addedNode.style.height = `${offsetHeight}px`;
  const innerTextElement: any = document.querySelector(
    `#${uniqueID} .video-placeholder-text-normal`
  );
  innerTextElement.style.display = 'none';
  const youtubeID = getYoutubeID(htmlElm.src);
  if (!youtubeID) return;
  addedNode.classList.replace('video-placeholder-normal', 'video-placeholder-youtube');
  addedNode.style.backgroundImage = `linear-gradient(rgba(76,72,72,.7),rgba(76,72,72,.7)),url('https://img.youtube.com/vi/${youtubeID}/maxresdefault.jpg')`;
  innerTextElement.classList.replace(
    'video-placeholder-text-normal',
    'video-placeholder-text-youtube'
  );
};
const shouldBlockProvider = (formattedRE: any) => {
  const provider = configBlockJS._providersToBlock.find(({ re }: any) =>
    new RegExp(escapeRegex(re)).test(formattedRE)
  );
  if (sessionStorage.getItem('aesirx-analytics-allow')) return false;
  return provider && true;
};

const blockScripts = (mutations: any) => {
  for (const { addedNodes } of mutations) {
    for (const node of addedNodes) {
      if (
        !node.src ||
        !node.nodeName ||
        !['script', 'iframe'].includes(node.nodeName.toLowerCase())
      )
        continue;
      try {
        const urlToParse = node.src.startsWith('//')
          ? `${window.location.protocol}${node.src}`
          : node.src;
        const { hostname, pathname } = new URL(urlToParse);
        const cleanedHostname = cleanHostName(`${hostname}${pathname}`);
        addProviderToList(node, cleanedHostname);
        if (!shouldBlockProvider(cleanedHostname)) continue;
        const uniqueID = randomString(8, false);
        if (node.nodeName.toLowerCase() === 'iframe') addPlaceholder(node, uniqueID);
        else {
          node.type = 'javascript/blocked';
          const scriptEventListener = function (event: any) {
            event.preventDefault();
            node.removeEventListener('beforescriptexecute', scriptEventListener);
          };
          node.addEventListener('beforescriptexecute', scriptEventListener);
        }
        const position =
          document.head.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY
            ? 'head'
            : 'body';
        node.remove();
        configBlockJS._backupNodes.push({
          position: position,
          node: node.cloneNode(),
          uniqueID,
        });
      } catch (error) {}
    }
  }
};

window['trackEventAnalytics'] = trackEvent;
const _nodeListObserver = new MutationObserver(blockScripts);
_nodeListObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});
