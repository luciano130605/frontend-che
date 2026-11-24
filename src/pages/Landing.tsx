import { useSession } from "../auth";
import MemberHome from "../components/MemberHome";
import Header from "../components/landing/Header";
import Hero from "../components/landing/Hero";
import Problem from "../components/landing/Problem";
import Mensaje from "../components/landing/Mensaje";
import Precios from "../components/landing/Precios";
import CTA from "../components/landing/CTA";
import Cookies from "../components/landing/Cookies";

import ScrollProgress from "../components/scroll/ScrollProgress";
import ScrollToTop from "../components/scroll/ScrollToTop";
import ComoFunciona from "../components/landing/ComoFunciona";

export default function Landing() {
  const session = useSession();
  if (session) return <MemberHome key={session.token} />;
  return (
    <div className="relative">
      <ScrollProgress />

      <Header />

      <main id="top">
        <Hero />


        <section className="py-20 sm:py-24 md:py-28">
          <Problem />
        </section>

        <section className="py-20 sm:py-24 md:py-28">
          <ComoFunciona />
        </section>
        <div className="mx-auto w-full max-w-[1124px] border-t border-che-ink/10" />

        <section className="py-20 sm:py-24 md:py-28">
          <Mensaje />
        </section>
        <div className="mx-auto w-full max-w-[1124px] border-t border-che-ink/10" />
        <section className="py-20 sm:py-24 md:py-28">
          <Precios />
        </section>

        <section className="py-20 sm:py-24 md:py-28">
          <CTA />
        </section>



      </main>
      <ScrollToTop className="flex sm:hidden" />

      <Cookies />

    </div>
  );
}