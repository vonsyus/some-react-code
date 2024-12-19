import { useEffect } from 'react';

export const useFadeIn: UseFadeIn = (ref, dataAttr, delay) => {
  useEffect(() => {
    if (!ref) return;
    const items = ref.querySelectorAll(`[${dataAttr}]`);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        if (delay) {
          setTimeout(() => ((target as HTMLElement).style.opacity = '1'), delay);
        } else {
          (target as HTMLElement).style.opacity = '1';
        }
        (target as HTMLElement).style.opacity = '1';
      });
    });
    items.forEach((item) => {
      observer.observe(item);
    });
    return () => {
      observer.unobserve(ref);
    };
  }, [dataAttr, ref]);
};

type UseFadeIn = (ref: HTMLElement | null, dataAttr: string, delay?: number) => void;
