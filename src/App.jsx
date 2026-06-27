import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import RoutePrefetcher from "./components/RoutePrefetcher.jsx";

// Landing is the entry point — keep eager so it streams without a flash.
import Landing from "./pages/Landing.jsx";

// All non-landing routes are split out into their own chunks.
const AnimeDetail = lazy(() => import("./pages/AnimeDetail.jsx"));
const EpisodeDetail = lazy(() => import("./pages/EpisodeDetail.jsx"));
const Scenes = lazy(() => import("./pages/Scenes.jsx"));
const Characters = lazy(() => import("./pages/Characters.jsx"));
const CharacterDetail = lazy(() => import("./pages/CharacterDetail.jsx"));
const VoiceActors = lazy(() => import("./pages/VoiceActors.jsx"));
const VoiceActorDetail = lazy(() => import("./pages/VoiceActorDetail.jsx"));
const Categories = lazy(() => import("./pages/Categories.jsx"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail.jsx"));
const Stories = lazy(() => import("./pages/Stories.jsx"));
const SceneDetail = lazy(() => import("./pages/SceneDetail.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Community = lazy(() => import("./pages/Community.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="page-container py-10"
    >
      <div className="h-48 animate-pulse rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] animate-pulse rounded-xl bg-zinc-900/60 ring-1 ring-zinc-800"
          />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col text-zinc-100">
      <ScrollProgress />
      <ScrollToTop />
      <RoutePrefetcher />
      <Header />
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/top" element={<Landing />} />
              <Route path="/anime/:malId" element={<AnimeDetail />} />
              <Route path="/anime/:malId/episode/:epNum" element={<EpisodeDetail />} />
              <Route path="/anime/:malId/scenes" element={<Scenes />} />
              <Route path="/scenes" element={<Scenes />} />
              <Route path="/scenes/:id" element={<SceneDetail />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/characters" element={<Characters />} />
              <Route path="/characters/:id" element={<CharacterDetail />} />
              <Route path="/voice-actors" element={<VoiceActors />} />
              <Route path="/voice-actors/:id" element={<VoiceActorDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:id" element={<CategoryDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/:username" element={<Community />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<About />} />
              <Route path="/faq" element={<About />} />
              <Route path="/status" element={<About />} />
              <Route path="/request" element={<About />} />
              <Route path="/feedback" element={<About />} />
              <Route path="/cookie-policy" element={<About />} />
              <Route path="/dmca" element={<About />} />
              <Route path="/privacy" element={<About />} />
              <Route path="/terms" element={<About />} />
              <Route path="/safety" element={<About />} />
              <Route path="/studios" element={<About />} />
              <Route path="/a-z" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
