export const initDynamicCursor = () => {
  let currentCursor: string | null = null;

  const updateCursor = (e: MouseEvent) => {
    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
    if (!target) return;

    if (target.hasAttribute("data-cursor")) {
      return;
    }


    let element = target;
    let bgColor: string | null = null;
    let maxDepth = 15;

    while (element && maxDepth > 0) {
      const computedStyle = window.getComputedStyle(element);
      bgColor = computedStyle.backgroundColor;


      if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
        const rgb = bgColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const r = parseInt(rgb[0]);
          const g = parseInt(rgb[1]);
          const b = parseInt(rgb[2]);
          const alpha = rgb.length > 3 ? parseFloat(rgb[3]) : 1;

          if (alpha < 0.5) {
            element = element.parentElement as HTMLElement;
            maxDepth--;
            continue;
          }


          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          const newCursor = luminance < 0.5
            ? 'url("/pawprint_white.png") 16 16, auto'
            : 'url("/pawprint.png") 16 16, auto';

          if (currentCursor !== newCursor) {
            document.documentElement.style.cursor = newCursor;
            currentCursor = newCursor;
          }
          return;
        }
      }

      element = element.parentElement as HTMLElement;
      maxDepth--;
    }

    if (currentCursor !== 'url("/pawprint.png") 16 16, auto') {
      document.documentElement.style.cursor = 'url("/pawprint.png") 16 16, auto';
      currentCursor = 'url("/pawprint.png") 16 16, auto';
    }
  };


  let ticking = false;
  const throttledUpdate = (e: MouseEvent) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateCursor(e);
        ticking = false;
      });
      ticking = true;
    }
  };

  document.addEventListener("mousemove", throttledUpdate, { passive: true });

  return () => {
    document.removeEventListener("mousemove", throttledUpdate);
    document.documentElement.style.cursor = '';
    currentCursor = null;
  };
};
