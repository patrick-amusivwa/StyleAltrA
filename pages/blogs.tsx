import Link from "next/link";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import Skeleton from "react-loading-skeleton";

import AppHeader from "../components/Header/AppHeader";
import Footer from "../components/Footer/Footer";

const blogSkeletons = [1, 2, 3];

const Blogs = () => {
  const t = useTranslations("Others");

  return (
    <>
      <AppHeader title="StyleAltra Journal" />
      <main id="main-content" className="app-max-width app-x-padding py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl mb-3">StyleAltra Journal</h1>
          <p className="text-gray400">Kenyan style stories are coming soon.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {blogSkeletons.map((skeleton) => (
            <article key={skeleton} className="border border-gray200 p-6">
              <Skeleton width="34%" height={16} className="mb-6" />
              <Skeleton width="86%" height={30} className="mb-4" />
              <Skeleton width="100%" height={16} className="mb-2" />
              <Skeleton width="82%" height={16} className="mb-8" />
              <Skeleton width={96} height={16} />
            </article>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/">
            <a className="underline font-bold hover:text-gray500">
              {t("go_back_to")} home page
            </a>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    messages: (await import(`../messages/common/${locale}.json`)).default,
  },
});

export default Blogs;
