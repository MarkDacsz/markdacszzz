import React, { Suspense, lazy } from "react";
import { Route, Routes} from "react-router-dom";
import withRouter from "../hooks/withRouter"
import { Socialicons } from "../components/socialicons";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const Home = lazy(() => import("../pages/home").then((module) => ({ default: module.Home })));
const Portfolio = lazy(() => import("../pages/portfolio").then((module) => ({ default: module.Portfolio })));
const ContactUs = lazy(() => import("../pages/contact").then((module) => ({ default: module.ContactUs })));
const About = lazy(() => import("../pages/about").then((module) => ({ default: module.About })));
// Temporarily disable the Games page by routing to Home instead of loading the mini-game.
// const Games = lazy(() => import("../pages/games").then((module) => ({ default: module.Games })));

const PageFallback = () => (
  <div className="page-loading" aria-label="Loading page content" />
);

const AnimatedRoutes = withRouter(({ location }) => (
  <TransitionGroup>
    <CSSTransition
      key={location.key}
      timeout={{
        enter: 400,
        exit: 400,
      }}
      classNames="page"
      unmountOnExit
    >
      <Suspense fallback={<PageFallback />}>
        <Routes location={location}>
          <Route exact path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          {/* <Route path="/games" element={<Home />} /> */}
          <Route path="/contact" element={<ContactUs />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </CSSTransition>
  </TransitionGroup>
));

function AppRoutes() {
  return (
    <div className="s_c">
      <AnimatedRoutes />
      <Socialicons />
    </div>
  );
}

export default AppRoutes;
