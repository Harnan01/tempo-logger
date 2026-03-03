import styles from '@/styles/components/header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>⚡</div>
      <div className={styles.title}>Tempo AutoLogger</div>
      <div className={styles.subtitle}>git commits → AI worklogs → Tempo API</div>
    </header>
  );
}
