
import React from 'react';
import { HierarchicalCategorySelector } from './HierarchicalCategorySelector';

interface SmartCategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  currentCategoryId?: string;
  required?: boolean;
}

export const SmartCategorySelector = ({ 
  value, 
  onChange, 
  currentCategoryId,
  required = false 
}: SmartCategorySelectorProps) => {
  return (
    <HierarchicalCategorySelector
      value={value}
      onChange={onChange}
      preselectedCategoryId={currentCategoryId}
      required={required}
    />
  );
};
