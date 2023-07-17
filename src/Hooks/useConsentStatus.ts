import { useCallback, useContext, useEffect, useState } from 'react';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
import { getConsents } from '../utils/consent';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import { getWeb3ID } from '../utils/Concordium';
import { toast } from 'react-toastify';

const useConsentStatus = (endpoint?: string) => {
  const [show, setShow] = useState(false);
  const [level, setLevel] = useState<number>();
  const [provider, setProvider] = useState(null);
  const [web3ID, setWeb3ID] = useState<string>();

  const analyticsContext = useContext(AnalyticsContext);

  useEffect(() => {
    const allow = localStorage.getItem('aesirx-analytics-allow');
    const currentUuid = localStorage.getItem('aesirx-analytics-uuid');

    if (
      analyticsContext.visitor_uuid &&
      (allow === null || analyticsContext.visitor_uuid !== currentUuid)
    ) {
      (async () => {
        const consentList = await getConsents(endpoint, analyticsContext.visitor_uuid);

        if (consentList?.length === 0) {
          setShow(true);
          localStorage.removeItem('aesirx-analytics-allow');
        } else {
          if (level > 1) {
            localStorage.setItem('aesirx-analytics-uuid', analyticsContext.visitor_uuid);
            localStorage.setItem('aesirx-analytics-allow', '1');
          }

          consentList.forEach((consent: any) => {
            if (consent.expiration && new Date(consent.expiration) < new Date()) {
              setShow(true);
              localStorage.removeItem('aesirx-analytics-allow');
              return;
            } else {
              localStorage.setItem('aesirx-analytics-uuid', analyticsContext.visitor_uuid);
              localStorage.setItem('aesirx-analytics-allow', '1');
            }
          });
        }
      })();
    }
  }, [analyticsContext.visitor_uuid]);

  useEffect(() => {
    (async () => {
      try {
        let l = level;
        const provider = await detectConcordiumProvider(100);

        if (provider) {
          provider.on('accountDisconnected', () => {
            setLevel(3);
          });

          provider.on('accountChanged', () => setLevel(4));

          l = 3;
          let web3ID = '';
          const accountAddress = await provider.getMostRecentlySelectedAccount();

          if (accountAddress) {
            web3ID = await getWeb3ID(provider, accountAddress);

            console.log(web3ID);

            if (web3ID) {
              l = 4;
            }
          }

          setProvider(provider);
          setLevel(l);
          setWeb3ID(web3ID);
        }
      } catch (error) {
        setLevel(level ?? 1);
        console.error(error);
      }
    })();
  }, [level]);

  const handleLevel = useCallback(
    async (_level: number) => {
      if (_level === 2) {
        setLevel(_level);
      } else if (_level === 3) {
        try {
          await detectConcordiumProvider(100);
          setLevel(_level);
        } catch (error) {
          setLevel(1);
          toast('Browser Wallet extension not detected');
        }
      } else if (_level === 4) {
        setLevel(null);

        try {
          const accountAddress = await provider.connect();
          const web3ID = await getWeb3ID(provider, accountAddress);

          if (web3ID) {
            setLevel(_level);
            setWeb3ID(web3ID);
          } else {
            throw new Error('no web3id');
          }
        } catch (error) {
          setLevel(3);
          toast("You haven't minted any WEB3 ID yet. Try to mint at https://dapp.web3id.aesirx.io");
        }
      }
    },
    [level]
  );

  return [analyticsContext.visitor_uuid, level, provider, show, setShow, web3ID, handleLevel];
};

export default useConsentStatus;
