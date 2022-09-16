import Head from 'next/head';

export default function Header({ title, description, icon }) {
  return (<>
    <Head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
      <meta name="description" content={description}/>
      <link rel="icon" href={icon} />
    </Head>
  </>)
}