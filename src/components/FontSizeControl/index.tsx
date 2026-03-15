import { useRef, useEffect } from 'react';
import styles from './FontSizeControl.module.css';

interface Props {
  fontSize: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function FontSizeControl({ fontSize, onIncrease, onDecrease }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Keep refs to callbacks so the wheel listener never needs to be re-registered
  const increaseRef = useRef(onIncrease);
  const decreaseRef = useRef(onDecrease);
  increaseRef.current = onIncrease;
  decreaseRef.current = onDecrease;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) increaseRef.current();
      else decreaseRef.current();
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  return (
    <div ref={ref} className={styles.control} tabIndex={0}>
      <button className={styles.btn} onClick={onDecrease} title="缩小字体">−</button>
      <span className={styles.size}>{fontSize}px</span>
      <button className={styles.btn} onClick={onIncrease} title="放大字体">+</button>
    </div>
  );
}
