/* eslint-disable no-useless-catch */
import { stringMessage } from '@concordium/react-components';
import axios from 'axios';

const agreeConsents = async (
  endpoint: string,
  level: number,
  uuid: string,
  consent: number | number[],
  wallet?: string,
  signature?: string,
  web3id?: string,
  jwt?: string,
  network = 'concordium'
) => {
  const url = `${endpoint}/consent/v1/level${level}/${uuid}`;
  const urlV2 = `${endpoint}/consent/v2/level${level}/${uuid}`;

  try {
    switch (level) {
      case 1:
        await axios.post(`${url}/${consent}`);
        break;
      case 2:
        await axios.post(
          `${url}`,
          { consent: [1, 2] },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + jwt,
            },
          }
        );
        break;
      case 3:
        await axios.post(`${url}/${network}/${wallet}`, {
          signature: signature,
          consent: consent,
        });
        break;
      case 4:
        await axios.post(
          `${urlV2}/${network}/${wallet}`,
          {
            signature: signature,
            consent: consent,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + jwt,
            },
          }
        );
        break;

      default:
        break;
    }
  } catch (error) {
    throw error;
  }
};

const getConsents = async (endpoint: string, uuid: string) => {
  try {
    const response = (await axios.get(`${endpoint}/visitor/v1/${uuid}`))?.data?.visitor_consents;

    return response;
  } catch (error) {
    throw error;
  }
};

const getSignature = async (
  endpoint: string,
  address: string,
  provider: any,
  text: string,
  network = 'concordium'
) => {
  try {
    const nonce = await getNonce(endpoint, address, text, network);

    return getSignedNonce(nonce, address, provider);
  } catch (error) {
    throw error;
  }
};

const getNonce = async (
  endpoint: string,
  address: string,
  text: string,
  network = 'concordium'
) => {
  try {
    const nonce = (
      await axios.post(`${endpoint}/wallet/v1/${network}/${address}/nonce`, { text: text })
    )?.data.nonce;

    return nonce;
  } catch (error) {
    throw error;
  }
};

const getSignedNonce = async (nonce: string, address: string, provider: any) => {
  const signature = await provider.signMessage(address, stringMessage(`${nonce}`));

  return Buffer.from(
    typeof signature === 'object' && signature !== null ? JSON.stringify(signature) : signature,
    'utf-8'
  ).toString('base64');
};

const revokeConsents = async (
  endpoint: string,
  level: string,
  uuid: string,
  wallet?: string,
  signature?: string,
  web3id?: string,
  jwt?: string,
  network = 'concordium'
) => {
  const url = `${endpoint}/consent/v1/level${level}/revoke/${uuid}`;
  const urlV2 = `${endpoint}/consent/v2/level${level}/revoke/${uuid}`;
  try {
    switch (level) {
      case '2':
        await axios.put(`${url}`, null, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + jwt,
          },
        });
        break;
      case '3':
        await axios.put(`${url}/${network}/${wallet}`, {
          signature: signature,
        });
        break;
      case '4':
        await axios.put(
          `${urlV2}/${network}/${wallet}`,
          {
            signature: signature,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + jwt,
            },
          }
        );
        break;

      default:
        break;
    }
  } catch (error) {
    throw error;
  }
};

export { agreeConsents, getConsents, getSignature, getNonce, revokeConsents };
