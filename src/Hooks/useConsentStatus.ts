import { useCallback, useContext, useEffect, useState } from 'react';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
import { getConsents } from '../utils/consent';
import { getWeb3ID } from '../utils/Concordium';
import { toast } from 'react-toastify';
import { isMobile, isDesktop, osName, OsTypes } from 'react-device-detect';
import { BROWSER_WALLET, WALLET_CONNECT } from './config';
import {
  MAINNET,
  useConnection,
  useConnect,
  WalletConnectionProps,
  withJsonRpcClient,
} from '@concordium/react-components';
const useConsentStatus = (endpoint?: string, props?: WalletConnectionProps) => {
  const [show, setShow] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);
  const [level, setLevel] = useState<any>();
  const [web3ID, setWeb3ID] = useState<string>();

  const analyticsContext = useContext(AnalyticsContext);

  const {
    activeConnector,
    activeConnectorError,
    network,
    connectedAccounts,
    genesisHashes,
    setActiveConnectorType,
  } = props;

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
            handleRevoke(true, '1');
          }

          consentList.forEach((consent: any) => {
            if (consent.expiration && new Date(consent.expiration) < new Date()) {
              setShow(true);
              sessionStorage.removeItem('aesirx-analytics-allow');
              return;
            } else {
              sessionStorage.setItem('aesirx-analytics-uuid', analyticsContext.visitor_uuid);
              sessionStorage.setItem('aesirx-analytics-allow', '1');
              if (consent) {
                const revokeTier = !consent?.consent_uuid
                  ? '1'
                  : consent?.web3id && consent?.address
                  ? '4'
                  : consent?.address && !consent?.web3id
                  ? '3'
                  : '2';
                handleRevoke(true, revokeTier);
              }
            }
          });
        }
      })();
    }
  }, [analyticsContext.visitor_uuid]);

  const { connection, setConnection, account, genesisHash } = useConnection(
    connectedAccounts,
    genesisHashes
  );

  const { connect, connectError } = useConnect(activeConnector, setConnection);

  const [, setRpcGenesisHash] = useState();
  const [, setRpcError] = useState('');

  useEffect(() => {
    if (connection) {
      setRpcGenesisHash(undefined);
      withJsonRpcClient(connection, async (rpc) => {
        const status = await rpc.getConsensusStatus();
        return status.genesisBlock;
      })
        .then((hash: any) => {
          const network = 'mainnet';

          let r = false;

          switch (network) {
            // case 'testnet':
            //   r = hash === TESTNET.genesisHash;
            //   break;

            default:
              r = hash === MAINNET.genesisHash;
          }

          if (!r) {
            const network = 'mainnet';
            throw new Error(`Please change the network to ${network} in Wallet`);
          }

          setRpcGenesisHash(hash);
          setRpcError('');
        })
        .catch((err) => {
          setRpcGenesisHash(undefined);
          toast(err.message);
          setRpcError(err.message);
        });
    }
  }, [connection, genesisHash, network]);

  useEffect(() => {
    if (activeConnector) {
      connect();
    }
  }, [activeConnector]);

  useEffect(() => {
    if (connectError) {
      toast.error(connectError);
    }
  }, [connectError]);

  useEffect(() => {
    if (isDesktop) {
      setActiveConnectorType(BROWSER_WALLET);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let l = level;
        if (connection) {
          setLevel(null);
          l = 3;
          let web3ID = '';
          if (account) {
            web3ID = await getWeb3ID(connection, account);

            if (web3ID) {
              l = 4;
            }
          }
          setLevel(l);
          setWeb3ID(web3ID);
        } else {
          setLevel(level ?? 1);
        }
      } catch (error) {
        setLevel(level ?? 1);
        console.error(error);
      }
    })();
  }, [account]);

  const handleLevel = useCallback(
    async (_level: number) => {
      if (_level === 2) {
        setLevel(_level);
      } else if (_level === 3) {
        try {
          if (isDesktop) {
            setActiveConnectorType(BROWSER_WALLET);
            setLevel(null);
          }
          if (osName === OsTypes?.IOS && isMobile) {
            setLevel(1);
            toast('Wallet Connect not support on IOS');
          } else if (isMobile) {
            setActiveConnectorType(WALLET_CONNECT);
            setLevel(null);
          }
          if (activeConnectorError) {
            setLevel(1);
            toast('Browser Wallet extension not detected');
          } else {
            setLevel(_level);
          }
        } catch (error) {
          setLevel(1);
          toast('Browser Wallet extension not detected');
        }
      } else if (_level === 4) {
        setLevel(null);

        try {
          const web3ID = await getWeb3ID(connection, account);

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

  const handleRevoke = (status: boolean, level: string) => {
    sessionStorage.setItem('aesirx-analytics-revoke', level ? level : '0');
    setShowRevoke(status);
  };

  return [
    analyticsContext.visitor_uuid,
    level,
    connection,
    account,
    show,
    setShow,
    web3ID,
    handleLevel,
    showRevoke,
    handleRevoke,
  ];
};

export default useConsentStatus;
