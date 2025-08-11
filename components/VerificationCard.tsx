import React from 'react';
import type { ExtractedIdData, Translations } from '../types';
import ShieldCheckIcon from './icons/ShieldCheckIcon';

interface VerificationCardProps {
  data: ExtractedIdData;
  onConfirm: () => void;
  onRetry: () => void;
  translations: Pick<Translations, 'confirmDetailsTitle' | 'confirmDetailsSubtitle' | 'dataFieldName' | 'dataFieldIdNumber' | 'dataFieldDob' | 'retryUploadButton' | 'confirmAndContinueButton'>;
}

const VerificationCard: React.FC<VerificationCardProps> = ({ data, onConfirm, onRetry, translations }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-md mx-auto my-4">
      <div className="flex flex-col items-center text-center">
        <ShieldCheckIcon className="w-12 h-12 text-green-500 mb-3" />
        <h3 className="text-lg font-semibold text-slate-800 mb-1">{translations.confirmDetailsTitle}</h3>
        <p className="text-sm text-slate-500 mb-6">{translations.confirmDetailsSubtitle}</p>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <p className="text-sm font-medium text-slate-500">{translations.dataFieldName}</p>
          <p className="text-base text-slate-800 text-right">{data.name || 'N/A'}</p>
        </div>
        <div className="flex justify-between items-baseline">
          <p className="text-sm font-medium text-slate-500">{translations.dataFieldIdNumber}</p>
          <p className="text-base text-slate-800 text-right">{data.idNumber || 'N/A'}</p>
        </div>
        <div className="flex justify-between items-baseline">
          <p className="text-sm font-medium text-slate-500">{translations.dataFieldDob}</p>
          <p className="text-base text-slate-800 text-right">{data.dob || 'N/A'}</p>
        </div>
      </div>
      <div className="mt-8 flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 w-full px-4 py-2.5 text-sm font-semibold text-slate-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {translations.retryUploadButton}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {translations.confirmAndContinueButton}
        </button>
      </div>
    </div>
  );
};

export default VerificationCard;