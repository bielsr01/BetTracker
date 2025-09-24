import ImageUpload from '../ImageUpload';

export default function ImageUploadExample() {
  const handleImageUpload = (file: File) => {
    console.log('Image uploaded:', file.name);
    // Mock processing delay
    setTimeout(() => {
      console.log('OCR processing completed');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ImageUpload 
        onImageUpload={handleImageUpload} 
        isProcessing={false}
      />
    </div>
  );
}