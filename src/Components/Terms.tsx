import React, { Fragment, useState } from 'react';
import bg from '../Assets/bg.png';
import aesirx from '../Assets/aesirx.svg';
import shield_of_privacy from '../Assets/shield_of_privacy.png';
import concordium from '../Assets/concordium.svg';
import privacy from '../Assets/privacy.svg';
import arrow from '../Assets/arrow.svg';
import check_line from '../Assets/check_line.svg';
import check_circle from '../Assets/check_circle.svg';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs } from 'react-bootstrap';
const terms = [
  {
    level: 1,
    tier: 'txt_tier_1_tier',
    name: 'txt_tier_1_name',
    levelname: 'txt_tier_1_levelname',
    content: 'txt_tier_1_content',
    content_custom: 'txt_tier_1_content_custom',
    term: 'txt_tier_1_term',
    term_custom: 'txt_tier_1_term_custom',
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
    content_custom: 'txt_tier_2_content_custom',
    term: 'txt_tier_2_term',
    term_custom: 'txt_tier_2_term_custom',
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
    content_custom: 'txt_tier_3_content_custom',
    term: 'txt_tier_3_term',
    term_custom: 'txt_tier_3_term_custom',
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
    content_custom: 'txt_tier_4_content_custom',
    term: 'txt_tier_4_term',
    term_custom: 'txt_tier_4_term_custom',
    upgradetext: 'txt_tier_4_upgradetext',
    logos: [shield_of_privacy, concordium],
  },
];

const TermsComponent = ({ children, level, handleLevel, isCustom = false }: any) => {
  const { t } = useTranslation();
  const handleReadmore = (status: boolean) => {
    setShowReadmore(status);
  };
  const [showReadmore, setShowReadmore] = useState(false);
  const [activeTab, setActiveTab] = useState('consent');
  return (
    <>
      {terms.map(
        (term, key) =>
          term.level === level && (
            <Fragment key={key}>
              <div
                className={`rounded-top d-flex align-items-center justify-content-between p-2 p-lg-3 fw-medium flex-wrap  ${
                  isCustom
                    ? 'py-2 py-lg-3 px-4 header-consent-bg'
                    : 'p-2 p-lg-3 border-bottom bg-white'
                }`}
                style={{
                  ...(isCustom && {
                    borderBottom: '1px solid #DEDEDE',
                  }),
                }}
              >
                <div className="text-primary text-nowrap">
                  {isCustom ? t('txt_take_full_control') : t(term.name)}
                </div>
                <div className="d-flex align-items-center fs-14 text-primary">
                  {isCustom ? (
                    <>
                      <div className="minimize-shield-wrapper position-relative">
                        <img
                          className="cover-img position-absolute h-100 w-100 object-fit-cover z-1"
                          src={bg}
                        />
                        <div className="minimize-shield position-relative z-2 py-2">
                          <img src={privacy} alt="Shield of Privacy" />
                          {t('txt_shield_of_privacy')}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`status-tier tier-${term.level} rounded-circle`}></div>
                      <div className="status-tier-text">
                        {t(term.tier)} - {t(term.levelname)}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className={`pb-3 ${isCustom ? 'pt-0' : ''} bg-white`}>
                {isCustom ? (
                  <>
                    <Tabs
                      id="consent_info_tab"
                      activeKey={activeTab}
                      onSelect={(k) => setActiveTab(k)}
                      className="mb-2 mb-lg-3 w-100 flex-nowrap consent_info_tab"
                    >
                      <Tab eventKey="consent" title="Consent" className="w-100 px-3">
                        <p className="mb-2 mb-lg-3">{t('txt_consent_to_data')}</p>
                        <div className="d-flex align-items-center flex-wrap">
                          <div className="me-10px">{t('txt_ethical_compliant')}</div>
                          <div className="d-flex align-items-center">
                            <div className="item_compliant fw-semibold d-flex align-items-center">
                              <img src={check_line} width={24} height={24} />
                              GDPR
                            </div>
                            <div className="item_compliant fw-semibold d-flex align-items-center ms-10px">
                              <img src={check_line} width={24} height={24} />
                              CCPA
                            </div>
                          </div>
                        </div>
                        <div className="fw-semibold mt-2 mt-lg-3 mb-0 text-dark">
                          {t('txt_your_current_level')}
                        </div>
                        <ConsentLevel
                          level={term.level}
                          tier={t(term.tier)}
                          levelname={t(term.levelname)}
                          term_custom={t(term.term_custom)}
                          content_custom={t(term.content_custom)}
                        />
                      </Tab>
                      <Tab eventKey="detail" title="Detail" className="px-3">
                        <div className="about_section">
                          <div className="d-flex align-items-start">
                            <span>
                              <img src={check_circle} width={'14px'} height={'15px'} />
                            </span>
                            <div className="ms-10px">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: t('txt_detail_1', {
                                    interpolation: { escapeValue: false },
                                  }),
                                }}
                              />
                            </div>
                          </div>
                          <div className="d-flex align-items-start">
                            <span>
                              <img src={check_circle} width={'14px'} height={'15px'} />
                            </span>
                            <div className="ms-10px">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: t('txt_detail_2', {
                                    interpolation: { escapeValue: false },
                                  }),
                                }}
                              />
                            </div>
                          </div>
                          <div className="d-flex align-items-start">
                            <span>
                              <img src={check_circle} width={'14px'} height={'15px'} />
                            </span>
                            <div className="ms-10px">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: t('txt_detail_3', {
                                    interpolation: { escapeValue: false },
                                  }),
                                }}
                              />
                            </div>
                          </div>
                          <div className="fw-semibold mt-3 mb-2 text-dark">
                            {t('txt_understanding_your_consent')}
                          </div>
                          <div className="mb-0">{t('txt_this_website_uses')}</div>
                          <ConsentLevel
                            level={1}
                            tier={t('txt_tier_1_tier')}
                            levelname={t('txt_tier_1_levelname')}
                            term_custom={t('txt_tier_1_term_custom')}
                            content_custom={t('txt_tier_1_content_custom')}
                          />
                          <ConsentLevel
                            level={2}
                            tier={t('txt_tier_2_tier')}
                            levelname={t('txt_tier_2_levelname')}
                            term_custom={t('txt_tier_2_term_custom')}
                            content_custom={t('txt_tier_2_content_custom')}
                          />
                          <ConsentLevel
                            level={3}
                            tier={t('txt_tier_3_tier')}
                            levelname={t('txt_tier_3_levelname')}
                            term_custom={t('txt_tier_3_term_custom')}
                            content_custom={t('txt_tier_3_content_custom')}
                          />
                          <ConsentLevel
                            level={4}
                            tier={t('txt_tier_4_tier')}
                            levelname={t('txt_tier_4_levelname')}
                            term_custom={t('txt_tier_4_term_custom')}
                            content_custom={t('txt_tier_4_content_custom')}
                          />
                        </div>
                      </Tab>
                      <Tab eventKey="about" title="About" className="px-3">
                        <div className="d-flex align-items-start">
                          <span>
                            <img src={check_circle} width={'14px'} height={'15px'} />
                          </span>
                          <div className="ms-10px">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: t('txt_about_1', {
                                  interpolation: { escapeValue: false },
                                }),
                              }}
                            />
                          </div>
                        </div>
                        <div className="d-flex align-items-start">
                          <span>
                            <img src={check_circle} width={'14px'} height={'15px'} />
                          </span>
                          <div className="ms-10px">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: t('txt_about_2', {
                                  interpolation: { escapeValue: false },
                                }),
                              }}
                            />
                          </div>
                        </div>
                        <div className="d-flex align-items-start">
                          <span>
                            <img src={check_circle} width={'14px'} height={'15px'} />
                          </span>
                          <div className="ms-10px">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: t('txt_about_3', {
                                  interpolation: { escapeValue: false },
                                }),
                              }}
                            />
                          </div>
                        </div>
                        <div className="d-flex align-items-start">
                          <span>
                            <img src={check_circle} width={'14px'} height={'15px'} />
                          </span>
                          <div className="ms-10px">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: t('txt_about_4', {
                                  interpolation: { escapeValue: false },
                                }),
                              }}
                            />
                          </div>
                        </div>
                        <div className="d-flex align-items-center mt-3 flex-wrap">
                          <div className="me-10px">{t('txt_ethical_compliant')}</div>
                          <div className="d-flex align-items-center">
                            <div className="item_compliant fw-semibold d-flex align-items-center">
                              <img src={check_line} width={24} height={24} />
                              GDPR
                            </div>
                            <div className="item_compliant fw-semibold d-flex align-items-center ms-10px">
                              <img src={check_line} width={24} height={24} />
                              CCPA
                            </div>
                          </div>
                        </div>
                      </Tab>
                    </Tabs>
                  </>
                ) : (
                  <>
                    <span className="text-dark fw-medium">{t(term.content)}</span>{' '}
                    <span className="">{t(term.term)}</span>
                    <div className="read-more d-flex justify-content-between align-items-center flex-wrap">
                      {term.upgrade && (
                        <a
                          className="fs-14 text-success fw-bold mb-1"
                          href="#"
                          onClick={() => handleLevel(terms[key + 1].level)}
                        >
                          {t(term.upgrade)}
                        </a>
                      )}
                      <div
                        className="ms-auto read-more-btn mb-1"
                        onClick={() => {
                          handleReadmore(!showReadmore ? true : false);
                        }}
                      >
                        {!showReadmore ? t('txt_show_details') : t('txt_hide_details')}{' '}
                        <img src={arrow} className={`ms-1 ${showReadmore ? 'revert' : ''}`} />
                      </div>
                    </div>
                  </>
                )}
              </div>
              {isCustom ? (
                <div className="rounded-bottom position-relative overflow-hidden text-white bg-white">
                  <div className="position-relative pt-2 pt-lg-3 p-3">
                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                      {children}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-bottom position-relative overflow-hidden text-white">
                  <img className="position-absolute h-100 w-100 object-fit-cover" src={bg} />
                  <img
                    className="position-absolute h-100 w-100 object-fit-cover lightning flash-effect"
                    src={bg}
                  />
                  <div className="position-relative pt-2 pt-lg-3 p-3">
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
              )}
            </Fragment>
          )
      )}
    </>
  );
};

const ConsentLevel = ({ level, tier, levelname, term_custom, content_custom }: any) => {
  return (
    <div className="consent_level mt-2 mt-lg-3">
      <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
        <div className="d-flex align-items-center">
          <div className={`status-tier tier-${level} rounded-circle`}></div>
          <div className="status-tier-text fw-semibold fs-14 text-primary">
            {tier} - {levelname}
          </div>
        </div>
        <div className="fw-semibold fs-14 text-primary">{term_custom}</div>
      </div>
      <div>{content_custom}</div>
    </div>
  );
};

export { TermsComponent };
