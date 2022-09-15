import '../styles/globals.css';
import '../styles/sidebar.css';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  return (
      <Component {...pageProps} />
  );
}
