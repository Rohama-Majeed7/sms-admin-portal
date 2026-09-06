import React from 'react';
import { Construction } from 'lucide-react';

const PlaceholderPage: React.FC<{ title: string; description?: string }> = ({
  title,
  description = 'This section is under development.',
}) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
      <Construction size={36} className="text-slate-400" />
    </div>
    <h2 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</h2>
    <p className="text-slate-500 text-sm max-w-sm">{description}</p>
  </div>
);

export default PlaceholderPage;
