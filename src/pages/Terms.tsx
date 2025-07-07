import React from 'react';
import { InlineContentEditor } from '@/components/admin/InlineContentEditor';

const Terms = () => {
  return (
    <InlineContentEditor
      settingKey="terms_content"
      title="Terms & Conditions"
      defaultContent=""
    />
  );
};

export default Terms;