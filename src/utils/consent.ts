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
  network = 'concordium',
  gtagId?: string,
  gtmId?: string,
  layout?: string
) => {
  const url = `${endpoint}/consent/v1/level${level}/${uuid}`;
  const urlV2 = `${endpoint}/consent/v2/level${level}/${uuid}`;
  if (sessionStorage.getItem('consentGranted') !== 'true') {
    gtagId && consentModeGrant(true, gtagId, layout);
    gtmId && consentModeGrant(false, gtmId, layout);
  }
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

declare const dataLayer: any[];
const consentModeGrant = async (isGtag: any, id: any, layout: any) => {
  if (layout !== 'advance-consent-mode') {
    isGtag ? loadGtagScript(id) : loadGtmScript(id);
  }
  sessionStorage.setItem('consentGranted', 'true');
  function gtag( // eslint-disable-next-line @typescript-eslint/no-unused-vars
    p0: any, // eslint-disable-next-line @typescript-eslint/no-unused-vars
    p1: any, // eslint-disable-next-line @typescript-eslint/no-unused-vars
    p2: any
  ) {
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  }
  gtag('consent', 'update', {
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    ad_storage: 'granted',
    analytics_storage: 'granted',
  });
};

const loadGtagScript = (gtagId: any) => {
  // Load gtag.js script.
  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;

  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(gtagScript, firstScript);
};

const loadGtmScript = (gtmId: any) => {
  // Load Tag Manager script.
  const gtmScript = document.createElement('script');
  gtmScript.async = true;
  gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;

  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(gtmScript, firstScript);
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
  sessionStorage.setItem('consentGranted', 'false');
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

const getMember = async (endpoint: string, accessToken: string) => {
  try {
    const member = await axios.get(
      `${endpoint}/index.php?webserviceClient=site&webserviceVersion=1.0.0&option=persona&api=hal&task=getTokenByUser`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken,
        },
      }
    );

    if (member?.data?.result?.member_id) {
      const data = await axios.get(
        `${endpoint}/index.php?webserviceClient=site&webserviceVersion=1.0.0&option=member&api=hal&id=${member?.data?.result?.member_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken,
          },
        }
      );
      return data?.data;
    }
  } catch (error) {
    console.log('getMember', error);
    throw error;
  }
};
const getWalletNonce = async (endpoint: any, wallet: any, publicAddress: any) => {
  try {
    const reqAuthFormData = {
      publicAddress: publicAddress,
      wallet: wallet,
      text: `Login with nonce: {}`,
    };

    const config = {
      method: 'post',
      url: `${endpoint}/index.php?webserviceClient=site&webserviceVersion=1.0.0&option=member&task=getWalletNonce&api=hal`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: reqAuthFormData,
    };
    const { data } = await axios(config);

    if (data.result) {
      return data.result;
    }
    throw false;
  } catch (error) {
    throw error;
  }
};

const verifySignature = async (
  endpoint: any,
  wallet: any,
  publicAddress: string,
  signature: any
) => {
  try {
    // Get return
    const returnParams = new URLSearchParams(window.location.search)?.get('return');

    const reqAuthFormData = {
      wallet: wallet,
      publicAddress: publicAddress,
      signature: signature,
    };

    const config = {
      method: 'post',
      url: `${endpoint}/index.php?webserviceClient=site&webserviceVersion=1.0.0&option=member&task=walletLogin&api=hal&return=${
        returnParams ?? null
      }`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: reqAuthFormData,
    };

    const { data } = await axios(config);
    if (data?.result) {
      return data?.result;
    } else {
      throw false;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getConsentTemplate = async (domain: any) => {
  try {
    const endpointWeb3 = 'https://dev.web3id.backend.aesirx.io:8002';
    const data = await axios.get(`${endpointWeb3}/datastream/template/${domain}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (data) {
      return data;
    }
  } catch (error) {
    console.log('error',error);
  }
};

export {
  agreeConsents,
  getConsents,
  getSignature,
  getNonce,
  revokeConsents,
  getMember,
  getWalletNonce,
  verifySignature,
  loadGtagScript,
  loadGtmScript,
  getConsentTemplate,
};
