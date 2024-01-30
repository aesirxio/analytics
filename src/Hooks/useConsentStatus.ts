import { useCallback, useContext, useEffect, useState } from 'react';
import { AnalyticsContext } from '../utils/AnalyticsContextProvider';
import { getConsents } from '../utils/consent';
import { getWeb3ID } from '../utils/Concordium';
import { toast } from 'react-toastify';
import {
  MAINNET,
  useConnection,
  useConnect,
  WalletConnectionProps,
  useGrpcClient,
  TESTNET,
} from '@concordium/react-components';
import { BROWSER_WALLET } from './config';
import { isDesktop } from 'react-device-detect';
import { useAccount } from 'wagmi';
import { BlockHash } from '@concordium/web-sdk';

const useConsentStatus = (endpoint?: string, props?: WalletConnectionProps) => {
  const [show, setShow] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);
  const [level, setLevel] = useState<any>();
  const [web3ID, setWeb3ID] = useState<boolean>();

  const analyticsContext = useContext(AnalyticsContext);

  const { activeConnector, network, connectedAccounts, genesisHashes, setActiveConnectorType } =
    props;

  const { address, connector } = useAccount();
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
                  ? ''
                  : consent?.web3id && consent?.address
                  ? '4'
                  : consent?.address && !consent?.web3id
                  ? '3'
                  : '2';
                revokeTier ? handleRevoke(true, revokeTier) : setShow(true);
              }
            }
          });
        }
      })();
    }
  }, [analyticsContext.visitor_uuid]);

  const { connection, setConnection, account } = useConnection(connectedAccounts, genesisHashes);

  const { connect, connectError } = useConnect(activeConnector, setConnection);

  const [, setRpcGenesisHash] = useState();
  const [, setRpcError] = useState('');
  const rpc = useGrpcClient(network);

  useEffect(() => {
    if (rpc) {
      setRpcGenesisHash(undefined);
      rpc
        .getConsensusStatus()
        .then((status) => {
          return status.genesisBlock;
        })
        .then((hash: any) => {
          let r = false;
          switch (network?.name) {
            case 'testnet':
              r = BlockHash.toHexString(hash) === TESTNET.genesisHash;
              break;

            default:
              r = BlockHash.toHexString(hash) === MAINNET.genesisHash;
          }
          if (!r) {
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
  }, [rpc]);

  useEffect(() => {
    const initConnector = async () => {
      if (
        isDesktop &&
        sessionStorage.getItem('aesirx-analytics-revoke') !== '1' &&
        sessionStorage.getItem('aesirx-analytics-revoke') !== '2'
      ) {
        window.addEventListener('load', async function () {
          const address = (await window['concordium']?.requestAccounts()) ?? [];
          if (window['concordium'] && address?.length) {
            setActiveConnectorType(BROWSER_WALLET);
          }
        });
      }
    };
    initConnector();
  }, []);

  useEffect(() => {
    if (activeConnector) {
      connect();
    }
  }, [activeConnector]);

  useEffect(() => {
    if (
      connectError &&
      connectError !==
        'A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received'
    ) {
      toast.error(connectError);
    }
  }, [connectError]);

  useEffect(() => {
    (async () => {
      try {
        let l = level;
        if (rpc) {
          // Concordium
          if (l < 3) {
            setLevel(null);
            l = 3;
            let web3ID = false;
            if (account && sessionStorage.getItem('aesirx-analytics-consent-type') !== 'metamask') {
              web3ID = await getWeb3ID(account, rpc, network?.name);
              if (web3ID === true) {
                l = 4;
              }
            }
            setWeb3ID(web3ID);
            setLevel(l);
          }
        } else if (connector) {
          // Metamask
          if (l < 3) {
            l = 3;
            const web3ID = false;
            setWeb3ID(web3ID);
            setLevel(l);
          } else {
            if (l === 4) {
              setLevel(4);
            } else {
              setLevel(3);
            }
          }
        } else {
          setLevel(level ?? 1);
        }
      } catch (error) {
        setLevel(level ?? 1);
        console.error(error);
      }
    })();
  }, [account, address, connector]);

  const handleLevel = useCallback(
    async (_level: number) => {
      setLevel(_level);
      if (_level > 3 && isDesktop && !connection && window['concordium']) {
        setActiveConnectorType(BROWSER_WALLET);
      }
    },
    [level]
  );

  const handleRevoke = (status: boolean, level: string) => {
    sessionStorage.setItem('aesirx-analytics-revoke', level ? level : '0');
    setShowRevoke(status);
    if (level && level !== '0') {
      window.funcAfterConsent && window.funcAfterConsent();
    }
  };

  return [
    analyticsContext.visitor_uuid,
    level,
    connection,
    account,
    show,
    setShow,
    web3ID,
    setWeb3ID,
    handleLevel,
    showRevoke,
    handleRevoke,
  ];
};

export default useConsentStatus;
