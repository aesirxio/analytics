import React, { Fragment } from 'react';
import bg from '../Assets/bg.png';
import aesirx from '../Assets/aesirx.svg';
import web3id from '../Assets/web3id.svg';
import concordium from '../Assets/concordium.svg';
import upgrade from '../Assets/upgrade.svg';
import privacy from '../Assets/privacy.svg';

const terms = [
  {
    level: 1,
    tier: 'Tier 1',
    name: 'Session-Based',
    levelname: 'Basic',
    content:
      "Ideal for new site visitors or if you don't want your data stored beyond your current visit.",
    term: 'You consent to data collection for a 30-minute session only.',
    upgrade: 'Upgrade to Tier 2 Consent - Medium',
    upgradetext:
      ' & add on a Web3 Wallet for greater data control & consent or revoke at any time you choose.',
    logos: [aesirx],
  },
  {
    level: 2,
    tier: 'Tier 2',
    name: 'AesirX WEB3 ID',
    levelname: 'Medium',
    content:
      'Ideal for personalized online experiences & secure consent management across sessions & platforms.',
    term: 'You consent to data use across multiple sessions.',
    upgrade: 'Upgrade to Tier 3 Consent - High ',
    upgradetext:
      '& add on Wallet-Based Decentralized Consent to give explicit consent for data collection & processing for the most secure, private & personalized experience.',
    logos: [aesirx, web3id],
  },
  {
    level: 3,
    tier: 'Tier 3',
    name: 'Decentralized Wallet',
    levelname: 'High',
    content: 'Utilize your Web3 Wallet for greater control over your data.',
    term: 'You consent for your data to be used, which can be revoked at any time you choose.',
    upgrade: 'Upgrade to Tier 4 Consent - Super Advanced (our highest tier!)',
    upgradetext:
      ' & add on AesirX WEB3 ID to give explicit consent for data collection & processing for the most secure, private & personalized experience.',
    logos: [aesirx, web3id],
  },
  {
    level: 4,
    tier: 'Tier 4',
    name: 'Combined Wallet + AesirX WEB3 ID',
    levelname: 'Super Advanced',
    content:
      'Use your Web3 Wallet + AesirX WEB3 ID & get full multi-site control of your data use. Consent or revoke permissions at any time for true decentralized data ownership.',
    term: 'You consent for your data to be used, which can be revoked at any time you choose.',
    upgradetext: 'The most personalized and privacy-preserving experience!',
    logos: [aesirx, web3id, concordium],
  },
];

const TermsComponent = ({ children, level, handleLevel }: any) => {
  return (
    <>
      {terms.map(
        (term, key) =>
          term.level === level && (
            <Fragment key={key}>
              <div className="rounded-top d-flex justify-content-between bg-light p-3 fw-bold">
                <div>{term.name}</div>
                <div className="d-flex align-items-center">
                  <div className={`status-tier tier-${term.level} rounded-circle`}></div>
                  {term.tier} - {term.levelname}
                </div>
              </div>
              <div className="p-3 bg-white">
                <span className="fw-bold">{term.content}</span>{' '}
                <span className="fw-light">{term.term}</span>
              </div>
              <div className="rounded-bottom position-relative overflow-hidden text-white">
                <img className="position-absolute h-100 w-100 object-fit-cover" src={bg} />
                <div className="position-relative p-3">
                  <div className="d-flex align-items-center">
                    {term.logos.map((logo, i) => (
                      <Fragment key={i}>
                        <img className="me-2" src={logo} alt={term.levelname} />
                      </Fragment>
                    ))}
                  </div>
                  <div className="d-flex align-items-start my-3">
                    <img src={upgrade} />
                    <div className="ms-3">
                      {term.upgrade && (
                        <a
                          className="text-white"
                          href="#"
                          onClick={() => handleLevel(terms[key + 1].level)}
                        >
                          {term.upgrade}
                        </a>
                      )}
                      {term.upgradetext}
                      <div className="fst-italic">
                        We do not collect any personal data, only user insights.
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <div className="me-2">
                      <img src={privacy} alt={term.name} /> Shield of Privacy
                    </div>
                    {children}
                  </div>
                </div>
              </div>
            </Fragment>
          )
      )}
    </>
  );
};

export { TermsComponent };
