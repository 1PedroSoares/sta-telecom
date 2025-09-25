import { useEffect, useRef, useState } from 'react';

export const useScrollReveal = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '50px 0px -50px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return { ref, isVisible };
};

export const useScrollRevealStagger = (threshold = 0.1) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const createRef = (index: number) => (el: HTMLDivElement | null) => {
    refs.current[index] = el;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = refs.current.findIndex(ref => ref === entry.target);
            if (index !== -1) {
              setVisibleItems(prev => new Set([...prev, index]));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: '50px 0px -50px 0px'
      }
    );

    refs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      refs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [threshold]);

  return { createRef, visibleItems };
};