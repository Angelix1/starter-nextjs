import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import Header from '../components/header';


export default function Home() {
  return (<>
    <Header title="Music Player" description="Using NextJs for dynamic website" icon="/favicon.ico"/>          
    <div className={styles.container}>
      <main className={styles.main}>
        <p className={styles.description}>
          Try out streaming youtube video without Ads{' '}
          <Link href="api/stream" passHref>
            <code className={styles.code}>api/hello</code>
          </Link>
        </p>
      </main>
    </div>
  </>)
}
