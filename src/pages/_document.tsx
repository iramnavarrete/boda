import type { Metadata } from "next";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta
          name="description"
          content="Te invitamos celebrar la unión de Josué & Yaneth"
        />
        <link rel="canonical" href="https://bodajy.info" />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Invitación Boda Josué & Yaneth" />
        <meta
          property="og:description"
          content="Te invitamos a celebrar nuestra unión en este maravilloso día"
        />
        <meta property="og:url" content="https://bodajy.info" />
        <meta
          property="article:modified_time"
          content="2025-07-14T14:48:01-06:00"
        />
        <meta property="og:image" content="https://bodajy.info/img/cover.png" />
        <meta property="og:image:width" content="630" />
        <meta property="og:image:height" content="420" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:label1" content="Tiempo de lectura" />
        <meta name="twitter:data1" content="3 minutos" />
      </Head>
      <body className="overflow-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
