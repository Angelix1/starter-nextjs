import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import Header from '../components/header';


export default function Home() {
  return (<>
    <Header title="Home" description="Using NextJs for dynamic website" icon="/favicon.ico"/>
    <div className={styles.container}>
      <br></br>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://google.com">Angel's Website!</a>
        </h1>
        <br></br>
        <div className={styles.grid}>
          <a href="/stream" className={styles.card}>
            <h2>Stream &rarr;</h2>
            <h3>Stream Youtube Music without Ads for free.</h3>
          </a>
        </div>
      </main>
    </div>
  </>)
}
