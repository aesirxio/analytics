import React, { Fragment } from 'react';

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
  },
  // {
  //   level: 2,
  //   tier: 'Tier 2',
  //   name: 'AesirX WEB3 ID',
  //   levelname: 'Medium',
  //   content:
  //     'Ideal for personalized online experiences & secure consent management across sessions & platforms.',
  //   term: 'You consent to data use across multiple sess`ions.',
  //   upgrade: 'Upgrade to Tier 3 Consent - High ',
  //   upgradetext:
  //     '& add on Wallet-Based Decentralized Consent to give explicit consent for data collection & processing for the most secure, private & personalized experience.',
  // },
  {
    level: 3,
    tier: 'Tier 2',
    name: 'Wallet-Based / Decentralized',
    levelname: 'High',
    content: 'Utilize your Web3 Wallet for greater control over your data.',
    term: 'You consent for your data to be used, which can be revoked at any time you choose.',
    upgrade: 'Upgrade to Tier 3 Consent - Super Advanced (our highest tier!)',
    upgradetext:
      ' & add on AesirX WEB3 ID to give explicit consent for data collection & processing for the most secure, private & personalized experience.',
  },
  {
    level: 4,
    tier: 'Tier 3',
    name: 'Combined Wallet + AesirX WEB3 ID',
    levelname: 'Super Advanced',
    content:
      'Use your Web3 Wallet + AesirX WEB3 ID & get full multi-site control of your data use. Consent or revoke permissions at any time for true decentralized data ownership.',
    term: 'You consent for your data to be used, which can be revoked at any time you choose.',
    upgradetext: 'The most personalized and privacy-preserving experience!',
  },
];

const TermsComponent = ({ level, upgrade, handleLevel }: any) => {
  return (
    <>
      {terms.map(
        (term, key) =>
          term.level === level &&
          (upgrade ? (
            <Fragment key={key}>
              <p key={key} className="fst-italic">
                {term.upgrade && (
                  <a href="#" onClick={() => handleLevel(terms[key + 1].level)}>
                    {term.upgrade}
                  </a>
                )}
                {term.upgradetext}
              </p>
            </Fragment>
          ) : (
            <Fragment key={key}>
              <span>
                {term.tier}
                <br />
                <span className="fs-5">
                  <strong>{term.name}</strong>
                </span>
                <br />
                Level - {term.levelname}.
              </span>
              <p className="fw-bold">{term.content}</p>
              <p>{term.term}</p>
            </Fragment>
          ))
      )}
    </>
  );
};

export { TermsComponent };
