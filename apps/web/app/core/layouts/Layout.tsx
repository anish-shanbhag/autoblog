import { Head, BlitzLayout } from "blitz";

// eslint-disable-next-line
const Layout: BlitzLayout<{ title?: string }> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title || "web"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {children}
    </>
  );
};

export default Layout;
