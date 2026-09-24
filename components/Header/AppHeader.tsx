import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { siteConfig } from "../../data/siteConfig";

type Props = {
  title?: string;
  desc?: string;
  keywords?: string;
};

const defaultDesc = siteConfig.description;
const defaultKeywords = siteConfig.keywords;

const AppHeader: React.FC<Props> = ({
  title = siteConfig.name,
  desc = defaultDesc,
  keywords = defaultKeywords,
}) => {
  const router = useRouter();
  const pageUrl = `${siteConfig.canonicalUrl}${router.asPath}`;

  return (
    <Head>
      <title>{title}</title>

      <meta content={desc} name="description" key="description" />
      <meta content={keywords} name="keywords" key="keywords" />
      <meta property="og:url" content={pageUrl} key="og_url" />
      <meta property="og:type" content="website" key="og_type" />
      <meta property="og:site_name" content={siteConfig.name} key="og_site_name" />
      <meta
        property="og:image"
        content={`${siteConfig.canonicalUrl}/STYLEALTRALOGO.png`}
        key="og_image"
      />
      <meta property="og:image:width" content="527" key="og_image_width" />
      <meta property="og:image:height" content="180" key="og_image_height" />
      <meta property="og:image:type" content="image/png" key="og_image_type" />
      <meta
        property="og:image:alt"
        content="StyleAltra Kenyan fashion"
        key="og_image_alt"
      />
      <meta property="og:description" content={desc} key="og_description" />
      <meta property="og:title" content={title} key="og_title" />
      <meta name="twitter:site" content="@StyleAltra" key="twitter_site" />
      <meta name="twitter:card" content="summary_large_image" key="twitter_card" />
      <meta
        name="twitter:image"
        content={`${siteConfig.canonicalUrl}/STYLEALTRALOGO.png`}
        key="twitter_image"
      />
      <meta
        name="twitter:image:alt"
        content="StyleAltra Kenyan fashion"
        key="twitter_image_alt"
      />
      <meta name="twitter:title" content={title} key="twitter_title" />
      <meta
        name="twitter:description"
        content={desc}
        key="twitter_description"
      />
    </Head>
  );
};

export default AppHeader;
