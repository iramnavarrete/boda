import type { Metadata } from "next";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta
          name="description"
          content="Te invitamos a la fiesta de XV años de Megan Ileana"
        />
        <link rel="canonical" href="https://xv.megan.co" />
        <link rel="preload" href="/img/gallery/sello.png" as="image" />
        <link rel="preload" href="/lottie/envolpe.json" as="json" />
        <link rel="preload" href="/img/bg-1.webp" as="image" />
        <link rel="preload" href="/img/gallery/1.webp" as="image" />
        <link rel="preload" href="/img/gallery/2.webp" as="image" />
        <link rel="preload" href="/img/gallery/3.webp" as="image" />
        <link rel="preload" href="/img/gallery/4.webp" as="image" />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Invitación XV Años Megan Ileana" />
        <meta
          property="og:description"
          content="Te invitamos a la fiesta de XV años de Megan Ileana"
        />
        <meta property="og:url" content="https://xvmegan.co" />
        <meta
          property="article:modified_time"
          content="2024-07-27T15:40:01-06:00"
        />
        <meta property="og:image" content="https://xvmegan.co/img/bg-1.webp" />
        <meta property="og:image:width" content="630" />
        <meta property="og:image:height" content="420" />
        <meta property="og:image:type" content="image/webp" />
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
