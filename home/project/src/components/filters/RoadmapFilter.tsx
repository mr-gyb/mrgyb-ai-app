import React, { useState } from 'react';
import { Filter, X, FileText, PieChart, BarChart2, TrendingUp, Package, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoadmapFilter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const assets = [
    { id: 'businessplan', icon: FileText, label: 'Business Plan', path: '/templates/business-plan' },
    { id: 'investordeck', icon: PieChart, label: 'Investor Deck', path: '/templates/investor-deck' },
    { id: 'marketanalysis', icon: BarChart2, label: 'Market Analysis', path: '/templates/market-analysis' },
    { id: 'marketingsales', icon: TrendingUp, label: 'Marketing/Sales Plan', path: '/templates/marketing-sales' },
    { id: 'fulfilmentplan', icon: Package, label: 'Fulfilment Plan', path: '/templates/fulfilment-plan' },
    { id: 'mediaplan', icon: Film, label: 'Media Plan', path: '/templates/media-plan' }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-navy-blue text-white p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
      >
        <Filter size={24} />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-navy-blue rounded-lg shadow-xl p-6 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-navy-blue dark:text-white">Assets</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-2">
            {assets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => handleNavigate(asset.path)}
                className="w-full flex items-center p-3 text-left hover:bg-gray-50 dark:hover:bg-navy-blue/50 rounded-lg transition-colors"
              >
                <asset.icon size={20} className="mr-3 text-navy-blue dark:text-gold" />
                <span className="text-navy-blue dark:text-white font-medium">{asset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapFilter;