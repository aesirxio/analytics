import { useContext, useEffect, useState } from 'react';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
import { getConsents } from '../utils/consent';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import { getWeb3ID } from '../utils/Concordium';

const useConsentStatus = (endpoint?: string) => {
  const [show, setShow] = useState(false);
  const [level, setLevel] = useState<number>();
  const [provider, setProvider] = useState(null);

  const analyticsContext = useContext(AnalyticsContext);

  useEffect(() => {
    const allow = sessionStorage.getItem('aesirx-analytics-allow');
    const currentUuid = sessionStorage.getItem('aesirx-analytics-uuid');

    if (
      analyticsContext.visitor_uuid &&
      (allow === null || analyticsContext.visitor_uuid !== currentUuid)
    ) {
      (async () => {
        const consentList = await getConsents(endpoint, analyticsContext.visitor_uuid);

        if (consentList?.length === 0) {
          setShow(true);
          sessionStorage.removeItem('aesirx-analytics-allow');
        } else {
          if (level > 1) {
            sessionStorage.setItem('aesirx-analytics-uuid', analyticsContext.visitor_uuid);
            sessionStorage.setItem('aesirx-analytics-allow', '1');
          }

          consentList.forEach((consent: any) => {
            if (consent.expiration && new Date(consent.expiration) < new Date()) {
              setShow(true);
              sessionStorage.removeItem('aesirx-analytics-allow');
              return;
            } else {
              sessionStorage.setItem('aesirx-analytics-uuid', analyticsContext.visitor_uuid);
              sessionStorage.setItem('aesirx-analytics-allow', '1');
            }
          });
        }
      })();
    }
  }, [analyticsContext.visitor_uuid]);

  useEffect(() => {
    (async () => {
      try {
        let l = 1;
        const provider = await detectConcordiumProvider(100);

        if (provider) {
          l = 3;
          const accountAddress = await provider.getMostRecentlySelectedAccount();

          if (accountAddress) {
            const web3ID = await getWeb3ID(provider, accountAddress);

            if (web3ID) {
              l = 4;
            }
          }

          setProvider(provider);
          setLevel(l);
        }
      } catch (error) {
        setLevel(1);
        console.error(error);
      }
    })();
  }, []);

  return [analyticsContext.visitor_uuid, level, provider, show, setShow, setLevel];
};

export default useConsentStatus;
