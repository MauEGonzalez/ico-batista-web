import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.brand}>ICO BATISTA</p>
      <a href="https://www.instagram.com/byicobatista" target="_blank" rel="noreferrer">
        @byicobatista
      </a>
    </footer>
  );
}
