import React, { Fragment, useState } from 'react';
import bg from '../Assets/bg.png';
import aesirx from '../Assets/aesirx.svg';
import web3id from '../Assets/web3id.svg';
import concordium from '../Assets/concordium.svg';
import upgrade from '../Assets/upgrade.svg';
import privacy from '../Assets/privacy.svg';
import arrow from '../Assets/arrow.svg';
import { useTranslation } from 'react-i18next';

const terms = [
  {
    level: 1,
    tier: 'txt_tier_1_tier',
    name: 'txt_tier_1_name',
    levelname: 'txt_tier_1_levelname',
    content: 'txt_tier_1_content',
    term: 'txt_tier_1_term',
    upgrade: 'txt_tier_1_upgrade',
    upgradetext: 'txt_tier_1_upgradetext',
    logos: [aesirx],
  },
  {
    level: 2,
    tier: 'txt_tier_2_tier',
    name: 'txt_tier_2_name',
    levelname: 'txt_tier_2_levelname',
    content: 'txt_tier_2_content',
    term: 'txt_tier_2_term',
    upgrade: 'txt_tier_2_upgrade',
    upgradetext: 'txt_tier_2_upgradetext',
    logos: [aesirx, web3id],
  },
  {
    level: 3,
    tier: 'txt_tier_3_tier',
    name: 'txt_tier_3_name',
    levelname: 'txt_tier_3_levelname',
    content: 'txt_tier_3_content',
    term: 'txt_tier_3_term',
    upgrade: 'txt_tier_3_upgrade',
    upgradetext: 'txt_tier_3_upgradetext',
    logos: [aesirx, web3id],
  },
  {
    level: 4,
    tier: 'txt_tier_4_tier',
    name: 'txt_tier_4_name',
    levelname: 'txt_tier_4_levelname',
    content: 'txt_tier_4_content',
    term: 'txt_tier_4_term',
    upgradetext: 'txt_tier_4_upgradetext',
    logos: [aesirx, web3id, concordium],
  },
];

const TermsComponent = ({ children, level, handleLevel }: any) => {
  const { t } = useTranslation();
  const handleReadmore = (status: boolean) => {
    setShowReadmore(status);
  };
  const [showReadmore, setShowReadmore] = useState(false);
  return (
    <>
      {terms.map(
        (term, key) =>
          term.level === level && (
            <Fragment key={key}>
              <div className="rounded-top d-flex justify-content-between bg-light p-3 fw-bold flex-wrap">
                <div>{t(term.name)}</div>
                <div className="d-flex align-items-center">
                  <div className={`status-tier tier-${term.level} rounded-circle`}></div>
                  {t(term.tier)} - {t(term.levelname)}
                </div>
              </div>
              <div className="p-3 bg-white">
                <span className="fw-bold">{t(term.content)}</span>{' '}
                <span className="fw-light">{t(term.term)}</span>
                <div className="read-more">
                  <div
                    className="read-more-btn"
                    onClick={() => {
                      handleReadmore(!showReadmore ? true : false);
                    }}
                  >
                    {!showReadmore ? t('txt_show_details') : t('txt_hide_details')}{' '}
                    <img src={arrow} className={`ms-1 ${showReadmore ? 'revert' : ''}`} />
                  </div>
                </div>
              </div>
              <div className="rounded-bottom position-relative overflow-hidden text-white">
                <img className="position-absolute h-100 w-100 object-fit-cover" src={bg} />
                <img
                  className="position-absolute h-100 w-100 object-fit-cover lightning flash-effect"
                  src={bg}
                />
                <div className="position-relative p-3">
                  {showReadmore && (
                    <>
                      <div className="d-flex align-items-center">
                        {term.logos.map((logo, i) => (
                          <Fragment key={i}>
                            <img className="me-2" src={logo} alt={t(term.levelname)} />
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
                              {t(term.upgrade)}
                            </a>
                          )}
                          {t(term.upgradetext)}
                          <div className="fst-italic">{t('txt_no_collect')}</div>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <div className="me-2">
                      <img src={privacy} alt={t(term.name)} /> {t('txt_shield_of_privacy')}
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
