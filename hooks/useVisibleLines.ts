import { useEffect } from 'react';

export const useAddVisibleClass: UseAddVisibleClass = (ref, dataAttr, className, delay) => {
  useEffect(() => {
    if (!ref) return;
    const items = ref.querySelectorAll(`[${dataAttr}]`);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        if (delay) {
          setTimeout(() => (target as HTMLElement).classList.add(className), delay);
        } else {
          (target as HTMLElement).classList.add(className);
        }
      });
    });
    items.forEach((item) => {
      observer.observe(item);
    });
    return () => {
      observer.unobserve(ref);
    };
  }, [className, dataAttr, ref]);
};

type UseAddVisibleClass = (ref: HTMLElement | null, dataAttr: string, className: string, delay?: number) => void;
