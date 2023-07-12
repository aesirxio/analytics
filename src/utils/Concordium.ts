import {
  AccountAddress,
  deserializeReceiveReturnValue,
  SchemaVersion,
  toBuffer,
} from '@concordium/web-sdk';
import { NFT_SMARTCONTRACT, WHITELIST_SMARTCONTRACT } from './config';

const invokeSmartContract = async (
  provider: any,
  account: any,
  name: any,
  index: any,
  subIndex: any,
  schema: any,
  method: any
) => {
  try {
    const client = await provider.getJsonRpcClient();

    const rawReturnValue = await client.invokeContract({
      invoker: new AccountAddress(account),
      contract: { index: BigInt(index), subindex: BigInt(subIndex) },
      method: `${name}.${method}`,
    });

    const returnValue = await deserializeReceiveReturnValue(
      toBuffer(rawReturnValue.returnValue, 'hex'),
      toBuffer(schema, 'base64'),
      name,
      method,
      SchemaVersion.V2
    );

    console.log('invokeSmartContract', returnValue);

    return returnValue;
  } catch (error: any) {
    console.log('invokeSmartContract error', error);
    return null;
  }
};

const getWeb3ID = async (provider: any, account: string) => {
  try {
    const dataNFT = await invokeSmartContract(
      provider,
      account,
      NFT_SMARTCONTRACT.name,
      NFT_SMARTCONTRACT.index,
      NFT_SMARTCONTRACT.subIndex,
      NFT_SMARTCONTRACT.schema,
      'view'
    );
    const nft = dataNFT?.state?.find((arrVal: any) => account === arrVal[0]?.Account[0]);

    if (nft) {
      const tokens = nft[1]['owned_tokens'];

      if (tokens) {
        const data = await invokeSmartContract(
          provider,
          account,
          WHITELIST_SMARTCONTRACT.name,
          WHITELIST_SMARTCONTRACT.index,
          WHITELIST_SMARTCONTRACT.subIndex,
          WHITELIST_SMARTCONTRACT.schema,
          'view'
        );

        const web3id = data?.state?.filter((arrVal: any) => tokens.includes(arrVal[1]?.token));

        if (web3id && web3id[0][0]) {
          return web3id[0][0];
        }
      }
    }
  } catch (error) {
    return '';
  }

  return '';
};

export { invokeSmartContract, getWeb3ID };
