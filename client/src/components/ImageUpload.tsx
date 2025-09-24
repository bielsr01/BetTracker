import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isProcessing?: boolean;
}

export default function ImageUpload({ onImageUpload, isProcessing }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      onImageUpload(acceptedFiles[0]);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          onImageUpload(file);
        }
        break;
      }
    }
  }, [onImageUpload]);

  return (
    <Card className="p-8">
      <div
        {...getRootProps()}
        onPaste={handlePaste}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer
          hover-elevate
          ${isDragActive || dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
        data-testid="image-upload-zone"
        tabIndex={0}
      >
        <input {...getInputProps()} data-testid="input-file" />
        
        <div className="flex flex-col items-center gap-4">
          {isProcessing ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-lg font-medium">Processando imagem...</p>
              <p className="text-sm text-muted-foreground">
                Extraindo dados da imagem usando OCR
              </p>
            </>
          ) : (
            <>
              {isDragActive ? (
                <Image className="h-12 w-12 text-primary" />
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
              
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive 
                    ? 'Solte a imagem aqui'
                    : 'Arraste uma imagem ou cole (Ctrl+V)'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  Formatos suportados: PNG, JPG, JPEG, GIF, BMP, WebP
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="lg"
                data-testid="button-browse-files"
                onClick={(e) => e.stopPropagation()}
              >
                Ou clique para selecionar
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}