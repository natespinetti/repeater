import React, { useEffect, useState } from 'react';
import { MultipleEntryReferenceEditor } from '@contentful/field-editor-reference';
import { ValidationError } from '@contentful/app-sdk';
import { generateKey } from '../../components/utility/generateKey';
import { ContentfulComponentsFieldsAndFunctions } from 'components/types';

type EntryReference = {
  sys: {
    id: string;
    type: 'Link';
    linkType: 'Entry';
  };
};

const Reference = ({
  item,
  items,
  setItems,
  index,
  fieldIndex,
  sdk,
  fieldName,
  options
}: ContentfulComponentsFieldsAndFunctions) => {
  const rawValue = item.fields?.[fieldIndex]?.value;
  const value: EntryReference[] = Array.isArray(rawValue) ? rawValue : [];
  const [canAddMore, setCanAddMore] = useState(true);

  // Optional: limit to 2 assets max
  useEffect(() => {
    return sdk.field.onValueChanged((newVal) => {
      const updatedItems = Array.isArray(newVal) ? newVal : [];
      const item = updatedItems[index]; // Get current item (row) by index
      const fields = item?.fields ?? [];
  
      // Find the media field by key or type
      const referenceField = fields.find(
        (field: any) =>
          field?.key === generateKey('reference', fieldName) || field?.type === 'reference'
      );
  
      const referenceLinks = Array.isArray(referenceField?.value) ? referenceField.value : [];
      console.log(referenceLinks);
      const maxAllowed = parseInt(options?.[0] || '10');
      console.log(maxAllowed);
  
      console.log(canAddMore);
      setCanAddMore(referenceLinks.length < maxAllowed);
    });
  }, [sdk.field]);
  

  return (
    <>
  <div className={`reference-wrapper-${index}`}>
    {!canAddMore && (
      <style>
        {`
          .reference-wrapper-${index} [data-test-id="create-entry-link-button"],
          .reference-wrapper-${index} [data-test-id="linkEditor.linkExisting"] {
            display: none !important;
          }
        `}
      </style>
    )}

    <MultipleEntryReferenceEditor
      viewType="link"
      parameters={{
        instance: {
          showCreateEntityAction: true,
          showLinkEntityAction: true,
        },
      }}      
      isInitiallyDisabled={false}
      hasCardEditActions={true}
      hasCardMoveActions={true}
      sdk={{
        ...sdk,
        field: {
            ...sdk.field,
            getValue: () => value,
            setValue: async (newValue) => {
              const updatedItems = [...items];
              const updatedFields = [...(updatedItems[index].fields || [])];
          
              updatedFields[fieldIndex] = {
                key: generateKey('reference', fieldName),
                type: 'reference',
                value: newValue,
              };

              const maxAllowed = parseInt(options?.[0] || '10');
              if (Array.isArray(newValue) && newValue.length <= maxAllowed) {
                setCanAddMore(false);
              }
          
              updatedItems[index] = {
                ...updatedItems[index],
                fields: updatedFields,
              };
          
              setItems(updatedItems);
              return sdk.field.setValue(updatedItems);
            },
            getIsDisabled: () => false, // ✅ Fix added here
            onIsDisabledChanged: (callback: (isDisabled: boolean) => void) => () => {},
            onSchemaErrorsChanged: (callback: (errors: ValidationError[]) => void) => () => {},
            onValueChanged(callback) {
              return () => {};
            },
          }          
      }}
    />
    </div>
    </>
  );
};

export default Reference;
