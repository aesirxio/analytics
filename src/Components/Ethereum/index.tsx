import React from 'react';

import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import {
  arbitrum,
  arbitrumGoerli,
  aurora,
  auroraTestnet,
  avalanche,
  avalancheFuji,
  baseGoerli,
  bronos,
  bronosTestnet,
  bsc,
  bscTestnet,
  canto,
  celo,
  celoAlfajores,
  crossbell,
  evmos,
  evmosTestnet,
  fantom,
  fantomTestnet,
  filecoin,
  filecoinCalibration,
  filecoinHyperspace,
  foundry,
  gnosis,
  gnosisChiado,
  goerli,
  hardhat,
  harmonyOne,
  iotex,
  iotexTestnet,
  localhost,
  mainnet,
  metis,
  metisGoerli,
  moonbaseAlpha,
  moonbeam,
  moonriver,
  okc,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  polygonZkEvmTestnet,
  sepolia,
  taraxa,
  taraxaTestnet,
  telos,
  telosTestnet,
  zkSync,
  zkSyncTestnet,
} from 'wagmi/chains';

const chains = [
  arbitrum,
  arbitrumGoerli,
  aurora,
  auroraTestnet,
  avalanche,
  avalancheFuji,
  baseGoerli,
  bronos,
  bronosTestnet,
  bsc,
  bscTestnet,
  canto,
  celo,
  celoAlfajores,
  crossbell,
  evmos,
  evmosTestnet,
  fantom,
  fantomTestnet,
  filecoin,
  filecoinCalibration,
  filecoinHyperspace,
  foundry,
  gnosis,
  gnosisChiado,
  goerli,
  hardhat,
  harmonyOne,
  iotex,
  iotexTestnet,
  localhost,
  mainnet,
  metis,
  metisGoerli,
  moonbaseAlpha,
  moonbeam,
  moonriver,
  okc,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  polygonZkEvmTestnet,
  sepolia,
  taraxa,
  taraxaTestnet,
  telos,
  telosTestnet,
  zkSync,
  zkSyncTestnet,
];

import { Web3Modal } from '@web3modal/react';
import { CONCORDIUM_WALLET_CONNECT_PROJECT_ID } from '@concordium/react-components';

const SSOEthereumProvider = ({ children, layout, level }: any) => {
  const projectId = CONCORDIUM_WALLET_CONNECT_PROJECT_ID;

  const { publicClient, webSocketPublicClient } = configureChains(chains, [
    w3mProvider({ projectId }),
  ]);
  const wagmiConfig: any =
    layout === 'simple-consent-mode' || layout === 'simple-web-2' || level === 1
      ? {}
      : createConfig({
          autoConnect: true,
          connectors: w3mConnectors({ projectId, chains }),
          publicClient,
          webSocketPublicClient,
        });

  const ethereumClient = new EthereumClient(wagmiConfig, chains);
  return (
    <>
      {layout === 'simple-consent-mode' || layout === 'simple-web-2' || level === 1 ? (
        <>{children}</>
      ) : (
        <>
          <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
          <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
        </>
      )}
    </>
  );
};

export default SSOEthereumProvider;
