import React from 'react';

const TermsComponent = ({ wallet }: any) => {
  return (
    <ul className="ps-3">
      <li>We need to use your personal data to provide you with better service.</li>
      <li>We will not share your personal data with any third parties, including our partners.</li>
      {!wallet && <li>Your personal data will be deleted after 30 minutes.</li>}
      <li>You can consent to the sharing of your personal data by clicking &quot;Allow&quot;.</li>
    </ul>
  );
};

export default TermsComponent;
