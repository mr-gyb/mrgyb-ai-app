import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContentUploader from './ContentUploader';

const ContentUpload: React.FC = () => {
  const navigate = useNavigate();

  const handleUpload = async (content) => {
    console.log('Uploaded content:', content);
    // Here you would typically process the uploaded content
    // For now, we'll just navigate to the edit page
    navigate('/edit');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <ContentUploader onUpload={handleUpload} />
    </div>
  );
};

export default ContentUpload;