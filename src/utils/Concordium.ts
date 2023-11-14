import {
  AccountAddress,
  ContractAddress,
  deserializeReceiveReturnValue,
  ReceiveName,
  ReturnValue,
  SchemaVersion,
  ConcordiumGRPCClient,
  ContractName,
  EntrypointName,
} from '@concordium/web-sdk';
import { NFT_SMARTCONTRACT } from './config';

const invokeSmartContract = async (
  account: any,
  name: any,
  index: any,
  subIndex: any,
  schema: any,
  method: any,
  rpcClient: ConcordiumGRPCClient
) => {
  try {
    const res = await rpcClient.invokeContract({
      invoker: AccountAddress.fromBase58(account),
      method: ReceiveName.fromString(`${name}.${method}`),
      parameter: undefined,
      contract: ContractAddress.create(index, subIndex),
    });

    if (!res || res.tag === 'failure' || !res.returnValue) {
      throw new Error(
        `RPC call 'invokeContract' on method '${name}.view' of contract '${method}' failed`
      );
    }
    const returnValue = await deserializeReceiveReturnValue(
      ReturnValue.toBuffer(res.returnValue),
      Buffer.from(schema, 'base64'),
      ContractName.fromString(name),
      EntrypointName.fromString(method),
      SchemaVersion.V2
    );

    console.log('invokeSmartContract', returnValue);

    return returnValue;
  } catch (error: any) {
    console.log('invokeSmartContract error', error);
    return null;
  }
};

const getWeb3ID = async (account: string, gRPCClient: ConcordiumGRPCClient) => {
  try {
    const dataNFT = await invokeSmartContract(
      account,
      NFT_SMARTCONTRACT.name,
      NFT_SMARTCONTRACT.index,
      NFT_SMARTCONTRACT.subIndex,
      NFT_SMARTCONTRACT.schema,
      'view',
      gRPCClient
    );
    const nft = dataNFT?.state?.find((arrVal: any) => account === arrVal[0]?.Account[0]);

    if (nft) {
      const tokens = nft[1]['owned_tokens'];
      if (tokens) {
        return true;
      }
    }
  } catch (error) {
    return false;
  }

  return false;
};

export { invokeSmartContract, getWeb3ID };
