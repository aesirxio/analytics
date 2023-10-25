import React, { Fragment, useState } from 'react';
import bg from '../Assets/bg.png';
import aesirx from '../Assets/aesirx.svg';
import shield_of_privacy from '../Assets/shield_of_privacy.png';
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
    logos: [shield_of_privacy],
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
    logos: [shield_of_privacy],
  },
  {
    level: 4,
    tier: 'txt_tier_4_tier',
    name: 'txt_tier_4_name',
    levelname: 'txt_tier_4_levelname',
    content: 'txt_tier_4_content',
    term: 'txt_tier_4_term',
    upgradetext: 'txt_tier_4_upgradetext',
    logos: [shield_of_privacy, concordium],
  },
];

const TermsComponent = ({ children, level, handleLevel }: any) => {
  const { t } = useTranslation();
  const handleReadmore = (status: boolean) => {
    setShowReadmore(status);
  };
  const [showReadmore, setShowReadmore] = useState(true);
  return (
    <>
      {terms.map(
        (term, key) =>
          term.level === level && (
            <Fragment key={key}>
              <div className="rounded-top d-flex justify-content-between bg-white p-3 fw-medium flex-wrap border-bottom">
                <div className="text-primary">{t(term.name)}</div>
                <div className="d-flex align-items-center fs-14 text-primary">
                  <div className={`status-tier tier-${term.level} rounded-circle`}></div>
                  <div className="status-tier-text">
                    {t(term.tier)} - {t(term.levelname)}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white">
                <span className="text-dark fw-medium">{t(term.content)}</span>{' '}
                <span className="">{t(term.term)}</span>
                <div className="read-more d-flex justify-content-between align-items-center">
                  {term.upgrade && (
                    <a
                      className="fs-14 text-success fw-bold"
                      href="#"
                      onClick={() => handleLevel(terms[key + 1].level)}
                    >
                      {t(term.upgrade)}
                    </a>
                  )}
                  <div
                    className="ms-auto read-more-btn"
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
                      <div className="mb-3">
                        {term.upgrade && t(term.upgrade)}
                        {t(term.upgradetext)}
                        <div className="fs-14 fst-italic">* {t('txt_no_collect')}</div>
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
