import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="description" content="Value App" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />

        <link
          rel="stylesheet"
          href="https://cdn.moyasar.com/mpf/1.13.0/moyasar.css"
        />
        <script
          src="https://cdn.moyasar.com/mpf/1.13.0/moyasar.js"
          async
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
