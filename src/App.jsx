import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Landing from "./pages/Landing.jsx";
import AnimeDetail from "./pages/AnimeDetail.jsx";
import Scenes from "./pages/Scenes.jsx";
import Characters from "./pages/Characters.jsx";
import CharacterDetail from "./pages/CharacterDetail.jsx";
import VoiceActors from "./pages/VoiceActors.jsx";
import VoiceActorDetail from "./pages/VoiceActorDetail.jsx";
import Categories from "./pages/Categories.jsx";
import CategoryDetail from "./pages/CategoryDetail.jsx";
import Stories from "./pages/Stories.jsx";
import SceneDetail from "./pages/SceneDetail.jsx";
import Search from "./pages/Search.jsx";
import About from "./pages/About.jsx";
import Community from "./pages/Community.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col text-zinc-100">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/top" element={<Landing />} />
          <Route path="/anime/:malId" element={<AnimeDetail />} />
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
      </main>
      <Footer />
    </div>
  );
}
