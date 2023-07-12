/* eslint-disable no-useless-catch */
import axios from 'axios';
import { WEB3ID_BACKEND } from './config';

const agreeConsents = async (
  endpoint: string,
  level: number,
  uuid: string,
  consent: number | number[],
  wallet?: string,
  signature?: string,
  web3id?: string,
  network = 'concordium'
) => {
  const url = `${endpoint}/consent/v1/level${level}/${uuid}`;

  try {
    switch (level) {
      case 1:
        await axios.post(`${url}/${consent}`);
        break;
      case 2:
        await axios.post(`${url}/${network}/${wallet}`, {
          signature: signature,
          consent: consent,
        });
        break;
      case 4:
        await axios.post(`${url}/${network}/${web3id}/${wallet}`, {
          signature: signature,
          consent: consent,
        });
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
  network = 'concordium'
) => {
  try {
    const nonce = (await axios.post(`${endpoint}/wallet/v1/${network}/${address}/nonce`))?.data
      .nonce;

    return getSignedNonce(nonce, address, provider);
  } catch (error) {
    throw error;
  }
};

const getSignedNonce = async (nonce: string, address: string, provider: any) => {
  const signature = await provider.signMessage(address, String(nonce));

  return Buffer.from(
    typeof signature === 'object' && signature !== null ? JSON.stringify(signature) : signature,
    'utf-8'
  ).toString('base64');
};

export { agreeConsents, getConsents, getSignature };
