
export const WORKER_MAIN = `
  self.onmessage = async function(e) {
    const { id, type, params } = e.data;
    
    try {
      const size = params.size || 512;
      const canvas = new OffscreenCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('No context');

      // Dispatch to domain-specific generators
      if (type.includes('concrete') || type === 'grid' || type === 'brick' || type === 'marble' || type === 'carpet' || type === 'city-window') {
          generateArch(ctx, type, params, size);
      } else if (type.includes('metal') || type.startsWith('tech-')) {
          generateTech(ctx, type, params, size);
      } else {
          generateNature(ctx, type, params, size);
      }

      const bitmap = await canvas.transferToImageBitmap();
      self.postMessage({ id, bitmap }, [bitmap]);

    } catch (err) {
      console.error('TextureWorker Error:', err);
      // Fallback: Return 1x1 pink pixel
      const errCanvas = new OffscreenCanvas(1,1);
      const errCtx = errCanvas.getContext('2d');
      errCtx.fillStyle = '#ff00ff';
      errCtx.fillRect(0,0,1,1);
      const empty = await errCanvas.transferToImageBitmap();
      self.postMessage({ id, bitmap: empty }, [empty]);
    }
  };
`;