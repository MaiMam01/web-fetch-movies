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
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/top" element={<Landing />} />
          <Route path="/anime/:malId" element={<AnimeDetail />} />
          <Route path="/anime/:malId/scenes" element={<Scenes />} />
          <Route path="/scenes" element={<Scenes />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/characters/:id" element={<CharacterDetail />} />
          <Route path="/voice-actors" element={<VoiceActors />} />
          <Route path="/voice-actors/:id" element={<VoiceActorDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
