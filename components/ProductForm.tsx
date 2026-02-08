import React from 'react';
import { ProductDetails } from '../types';
import { Users, FileText } from 'lucide-react';

interface ProductFormProps {
  details: ProductDetails;
  onChange: (details: ProductDetails) => void;
  disabled?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ details, onChange, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...details, [name]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={details.name}
            onChange={handleChange}
            disabled={disabled}
            placeholder="e.g., Ergonomic Bamboo Laptop Stand"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors disabled:bg-slate-50 disabled:text-slate-500 placeholder:text-slate-300"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-red-400"/> Description</span>
          </label>
          <textarea
            name="description"
            value={details.description}
            onChange={handleChange}
            disabled={disabled}
            rows={3}
            placeholder="Describe your product's key features, materials, and benefits..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors resize-none disabled:bg-slate-50 disabled:text-slate-500 placeholder:text-slate-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
             <span className="flex items-center gap-1"><Users className="w-3 h-3 text-red-400"/> Target Audience</span>
          </label>
          <input
            type="text"
            name="targetAudience"
            value={details.targetAudience}
            onChange={handleChange}
            disabled={disabled}
            placeholder="e.g., Remote workers, Digital Nomads"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors disabled:bg-slate-50 disabled:text-slate-500 placeholder:text-slate-300"
          />
        </div>
      </div>
    </div>
  );
};