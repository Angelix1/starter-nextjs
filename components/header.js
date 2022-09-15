import Head from 'next/head';

export default function Header({ title, description, icon }) {
  return (<>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description}/>
      <link rel="icon" href={icon} />
    </Head>
  </>)
}
