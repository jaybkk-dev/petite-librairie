import { useEffect, useState } from 'react';
import { TabBar, type Tab } from './components/TabBar';
import { useStore } from './store';
import { Library } from './views/Library';
import { Suggestions } from './views/Suggestions';
import { Reader } from './views/Reader';
import { Settings } from './views/Settings';
import { BookDetail } from './views/BookDetail';
import './App.css';

type Route =
  | { kind: 'tab'; tab: Tab }
  | { kind: 'detail'; bookId: string }
  | { kind: 'reader'; bookId: string };

export function App() {
  const { configured, triggerAcquisition } = useStore();
  const [route, setRoute] = useState<Route>(() => ({
    kind: 'tab',
    tab: configured ? 'bibliotheque' : 'reglages',
  }));

  // If config is wiped while running, force user back to Réglages.
  useEffect(() => {
    if (!configured) setRoute({ kind: 'tab', tab: 'reglages' });
  }, [configured]);

  const goToTab = (tab: Tab) => {
    if (!configured && tab !== 'reglages') return;
    setRoute({ kind: 'tab', tab });
  };

  const openBook = (bookId: string) => setRoute({ kind: 'detail', bookId });
  const openReader = (bookId: string) => setRoute({ kind: 'reader', bookId });
  const backToLibrary = () => setRoute({ kind: 'tab', tab: 'bibliotheque' });
  const acquire = async (bookId: string) => {
    try {
      await triggerAcquisition(bookId);
      window.alert(
        "Agent d'acquisition lancé. Les options apparaîtront dans la fiche dans 1–2 minutes.",
      );
    } catch (err) {
      window.alert(
        `Échec du lancement de l'agent : ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  if (route.kind === 'reader') {
    return <Reader bookId={route.bookId} onClose={() => setRoute({ kind: 'detail', bookId: route.bookId })} />;
  }

  const activeTab: Tab = route.kind === 'tab' ? route.tab : 'bibliotheque';

  return (
    <div className="app">
      <main className="app__main">
        {route.kind === 'detail' ? (
          <BookDetail
            bookId={route.bookId}
            onBack={backToLibrary}
            onOpenReader={() => openReader(route.bookId)}
            onAcquire={() => acquire(route.bookId)}
          />
        ) : route.tab === 'bibliotheque' ? (
          <Library onOpenBook={openBook} onOpenReader={openReader} onAcquire={acquire} />
        ) : route.tab === 'suggestions' ? (
          <Suggestions />
        ) : route.tab === 'lecture' ? (
          <LectureRedirect onOpenReader={openReader} />
        ) : (
          <Settings />
        )}
      </main>
      <TabBar active={activeTab} onChange={goToTab} />
    </div>
  );
}

function LectureRedirect({ onOpenReader }: { onOpenReader: (id: string) => void }) {
  const { data } = useStore();
  const lastReadId = data.prefs.lastReadId;
  const lastRead = lastReadId
    ? data.books.find((b) => b.id === lastReadId && b.epubPath)
    : undefined;
  const enCours = data.books.find((b) => b.status === 'en-cours' && b.epubPath);
  const target = lastRead ?? enCours;

  useEffect(() => {
    if (target) onOpenReader(target.id);
  }, [target?.id, onOpenReader]);

  if (target) return null;

  return (
    <div className="empty">
      <p className="empty__text">Aucune lecture en cours.</p>
    </div>
  );
}
