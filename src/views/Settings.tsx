import { useState } from 'react';
import { useStore } from '../store';
import { checkRepo, GitHubError } from '../lib/github';
import type { Book, SyncConfig } from '../types';
import { Brand } from '../components/Brand';
import './Settings.css';

const TEST_BOOK: Book = {
  id: '24-ernaux-la-place',
  n: '24',
  title: 'La place',
  author: 'Annie Ernaux',
  year: 1984,
  status: 'a-lire',
  spineSize: 'short',
  spineColor: '#4a3a25',
  spineText: '#e8d4b8',
  passages: [],
  epubPath: 'epubs/24-ernaux-la-place.epub',
  source: 'Gallimard',
  justif:
    "Renaudot 1984. Le récit, en quelques pages, du père de l'auteure. Phrase nue, refus de la 'belle écriture'. Le moment où Ernaux trouve son geste.",
};

type Step = 'idle' | 'checking' | 'ready' | 'bootstrap-needed' | 'bootstrapping' | 'error';

export function Settings() {
  const { config, setConfig, configured, data, syncStatus, syncError, lastSync, pull, bootstrap, addBook } = useStore();
  const [pat, setPat] = useState(config?.pat ?? '');
  const [repo, setRepo] = useState(config?.repo ?? '');
  const [branch, setBranch] = useState(config?.branch ?? 'main');
  const [step, setStep] = useState<Step>('idle');
  const [message, setMessage] = useState<string>('');

  const validate = async () => {
    setStep('checking');
    setMessage('');
    const draft: SyncConfig = { pat: pat.trim(), repo: repo.trim(), branch: branch.trim() || 'main' };
    if (!draft.pat || !draft.repo) {
      setStep('error');
      setMessage('PAT et dépôt requis.');
      return;
    }
    if (!/^[^/\s]+\/[^/\s]+$/.test(draft.repo)) {
      setStep('error');
      setMessage('Format du dépôt : utilisateur/nom-du-dépôt.');
      return;
    }
    try {
      const exists = await checkRepo(draft);
      if (!exists) {
        setStep('error');
        setMessage('Dépôt introuvable. Le créer manuellement sur GitHub puis réessayer.');
        return;
      }
      setConfig(draft);
      setStep('ready');
      setMessage('Connexion validée.');
    } catch (err) {
      setStep('error');
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  const handleBootstrap = async () => {
    setStep('bootstrapping');
    await bootstrap();
    setStep('ready');
  };

  const disconnect = () => {
    if (!confirm('Effacer le PAT et la configuration locale ?')) return;
    setConfig(null);
    setPat('');
    setRepo('');
    setBranch('main');
    setStep('idle');
    setMessage('');
  };

  return (
    <div className="settings">
      <header className="settings__header">
        <Brand />
        <h1 className="settings__title">Réglages</h1>
      </header>

      <section className="settings__section">
        <h2 className="settings__eyebrow">Synchronisation</h2>
        <p className="settings__lede">
          La petite librairie stocke ses données dans un dépôt GitHub privé. Saisir un jeton d'accès
          personnel (PAT) à portée fine, autorisé en écriture sur le dépôt. Sans cela, l'application
          ne charge ni ne sauvegarde rien.
        </p>

        <label className="settings__field">
          <span className="settings__label">Dépôt</span>
          <input
            className="settings__input"
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="utilisateur/petite-librairie-data"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </label>

        <label className="settings__field">
          <span className="settings__label">Branche</span>
          <input
            className="settings__input"
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </label>

        <label className="settings__field">
          <span className="settings__label">Jeton (PAT)</span>
          <input
            className="settings__input settings__input--mono"
            type="password"
            value={pat}
            onChange={(e) => setPat(e.target.value)}
            placeholder="github_pat_…"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </label>

        <div className="settings__actions">
          <button className="btn btn--primary" onClick={validate} disabled={step === 'checking'}>
            {step === 'checking' ? 'Vérification…' : 'Valider'}
          </button>
          {configured && (
            <button className="btn btn--ghost" onClick={disconnect}>
              Déconnecter
            </button>
          )}
        </div>

        {message && (
          <p className={`settings__message ${step === 'error' ? 'settings__message--error' : ''}`}>
            {message}
          </p>
        )}
      </section>

      {configured && (
        <section className="settings__section">
          <h2 className="settings__eyebrow">État</h2>
          <dl className="settings__dl">
            <dt>Statut</dt>
            <dd>{describeStatus(syncStatus)}</dd>
            <dt>Dernière synchro</dt>
            <dd>{lastSync ? new Date(lastSync).toLocaleString('fr-FR') : '—'}</dd>
            {syncError && (
              <>
                <dt>Erreur</dt>
                <dd className="settings__error">{syncError}</dd>
              </>
            )}
          </dl>

          <div className="settings__actions">
            <button className="btn btn--ghost" onClick={() => void pull()}>
              Recharger depuis le dépôt
            </button>
            <button
              className="btn btn--ghost"
              onClick={handleBootstrap}
              disabled={step === 'bootstrapping'}
            >
              {step === 'bootstrapping' ? 'Initialisation…' : 'Initialiser le dépôt (24 livres)'}
            </button>
          </div>
          <p className="settings__hint">
            « Initialiser » écrit <code>books.json</code>, <code>inbox.json</code>,{' '}
            <code>dismissed.json</code>, <code>prefs.json</code> à la racine du dépôt — à utiliser
            une seule fois, sur un dépôt vide.
          </p>
        </section>
      )}

      {configured && (
        <section className="settings__section">
          <h2 className="settings__eyebrow">Test de la liseuse</h2>
          <p className="settings__lede">
            Annie Ernaux — <em>La place</em> (1984), avec un epub joint, pour vérifier la liseuse.
            Le fichier est servi depuis <code>public/epubs/</code> en développement uniquement.
          </p>
          <div className="settings__actions">
            <button
              className="btn btn--ghost"
              onClick={() => addBook(TEST_BOOK)}
              disabled={data.books.some((b) => b.id === TEST_BOOK.id)}
            >
              {data.books.some((b) => b.id === TEST_BOOK.id)
                ? 'Déjà ajouté'
                : 'Ajouter La place'}
            </button>
          </div>
        </section>
      )}

      <section className="settings__section">
        <h2 className="settings__eyebrow">À propos</h2>
        <p className="settings__lede">
          Application personnelle, mono-utilisateur. Aucun compte, aucune télémétrie. Toutes les
          données vivent dans le dépôt GitHub configuré ci-dessus.
        </p>
      </section>
    </div>
  );
}

function describeStatus(s: 'idle' | 'pulling' | 'pushing' | 'error'): string {
  switch (s) {
    case 'idle':
      return 'Synchronisé';
    case 'pulling':
      return 'Téléchargement en cours…';
    case 'pushing':
      return 'Envoi en cours…';
    case 'error':
      return 'Erreur';
  }
}
