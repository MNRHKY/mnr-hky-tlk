import React from 'react';
import { InlineContentEditor } from '@/components/admin/InlineContentEditor';

const defaultPrivacyContent = `
# Privacy Policy

## Information We Collect
We collect information you provide directly to us, such as when you create an account, post content, or contact us.

## How We Use Your Information
We use the information we collect to provide, maintain, and improve our services.

## Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.

## Data Security
We implement appropriate security measures to protect your personal information.

## Contact Us
If you have any questions about this Privacy Policy, please contact us.

*This is a basic privacy policy template. Please customize it according to your specific needs and legal requirements.*
`;

const Privacy = () => {
  return (
    <InlineContentEditor
      settingKey="privacy_content"
      title="Privacy Policy"
      defaultContent={defaultPrivacyContent}
    />
  );
};

export default Privacy;