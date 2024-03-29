/* eslint-disable react/function-component-definition */

import Head from "next/head";
import React, { FC } from "react";

const Layout: FC<{ title?: string; children?: React.ReactNode }> = ({
  title,
  children,
}) => {
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
