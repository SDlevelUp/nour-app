import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ArrowDown, ArrowUp, Check, LibraryBig, PenLine, Plus } from "lucide-react";
import { ComposerCard } from "@/components/dashboard/ComposerCard";
import { useState } from "react";
import { toast } from "sonner";
import { LearningModule } from "@/components/dashboard/LearningModule";
import { DateField } from "@/components/dashboard/DateField";
import { passageScienceDuJour } from "@/data/scienceQuotidien";

function todayKey() {
  return new Intl.DateTimeFormat("fr-CA").format(new Date());
}

export function ScienceJournal({
  initialTab = "sessions",
}: {
  initialTab?: "sessions" | "books" | "learning";
}) {
  const entries = useQuery(api.scienceProgress.list, {});
  const books = useQuery(api.scienceBooks.list, {});
  const addEntry = useMutation(api.scienceProgress.add);
  const removeEntry = useMutation(api.scienceProgress.remove);
  const addBook = useMutation(api.scienceBooks.add);
  const updateBook = useMutation(api.scienceBooks.update);
  const setBookStatus = useMutation(api.scienceBooks.setStatus);
  const reorderBooks = useMutation(api.scienceBooks.reorder);
  const removeBook = useMutation(api.scienceBooks.remove);
  const [passage] = useState(() => passageScienceDuJour(new Date()));
  const [tab, setTab] = useState<"sessions" | "books" | "learning">(initialTab);
  const [date, setDate] = useState(todayKey);
  const [time, setTime] = useState("10:00");
  const [title, setTitle] = useState("");
  const [lesson, setLesson] = useState("");
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [showSource, setShowSource] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] =
    useState<Id<"scienceStudyLogs"> | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookNotes, setBookNotes] = useState("");
  const [bookFilter, setBookFilter] = useState<"next" | "read">("next");
  const [editingBookId, setEditingBookId] =
    useState<Id<"scienceBooks"> | null>(null);
  const [editBookTitle, setEditBookTitle] = useState("");
  const [editBookAuthor, setEditBookAuthor] = useState("");
  const [editBookNotes, setEditBookNotes] = useState("");
  const [pendingBookAction, setPendingBookAction] = useState<string | null>(
    null,
  );

  const [{ todayDate, sevenDaysAgo }] = useState(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    return {
      todayDate: todayKey(),
      sevenDaysAgo: new Intl.DateTimeFormat("fr-CA").format(weekStart),
    };
  });
  const sessionsLast7Days = (entries ?? []).filter(
    (entry) => entry.date >= sevenDaysAgo && entry.date <= todayDate,
  ).length;
  const sessionsThisMonth = (entries ?? []).filter((entry) =>
    entry.date.startsWith(todayDate.slice(0, 7)),
  ).length;
  const latestEntry = entries?.[0];

  const upcomingBooks = (books ?? [])
    .filter((book) => book.status !== "read")
    .sort((first, second) => first.position - second.position);
  const visibleBooks = (books ?? []).filter((book) =>
    bookFilter === "read" ? book.status === "read" : book.status !== "read",
  );

  const saveBook = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPendingBookAction("new");
    try {
      await addBook({
        title: bookTitle,
        author: bookAuthor,
        notes: bookNotes || undefined,
      });
      setBookTitle("");
      setBookAuthor("");
      setBookNotes("");
      toast.success("Livre ajouté à tes prochaines lectures.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible d’ajouter ce livre.",
      );
    } finally {
      setPendingBookAction(null);
    }
  };

  const saveBookEdits = async (bookId: Id<"scienceBooks">) => {
    setPendingBookAction(bookId);
    try {
      await updateBook({
        bookId,
        title: editBookTitle,
        author: editBookAuthor,
        notes: editBookNotes || undefined,
      });
      setEditingBookId(null);
      toast.success("Livre mis à jour.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible de modifier ce livre.",
      );
    } finally {
      setPendingBookAction(null);
    }
  };

  const changeBookStatus = async (
    bookId: Id<"scienceBooks">,
    status: Doc<"scienceBooks">["status"],
  ) => {
    setPendingBookAction(bookId);
    try {
      await setBookStatus({ bookId, status });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible de modifier ce statut.",
      );
    } finally {
      setPendingBookAction(null);
    }
  };

  const moveBook = async (bookId: Id<"scienceBooks">, direction: -1 | 1) => {
    const fromIndex = upcomingBooks.findIndex((book) => book._id === bookId);
    const toIndex = fromIndex + direction;
    if (fromIndex < 0 || toIndex < 0 || toIndex >= upcomingBooks.length) return;
    const nextBooks = [...upcomingBooks];
    [nextBooks[fromIndex], nextBooks[toIndex]] = [
      nextBooks[toIndex],
      nextBooks[fromIndex],
    ];
    setPendingBookAction(bookId);
    try {
      await reorderBooks({ bookIds: nextBooks.map((book) => book._id) });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible de réordonner les livres.",
      );
    } finally {
      setPendingBookAction(null);
    }
  };

  const deleteBook = async (bookId: Id<"scienceBooks">) => {
    if (!window.confirm("Supprimer ce livre de ta liste ?")) return;
    setPendingBookAction(bookId);
    try {
      await removeBook({ bookId });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible de supprimer ce livre.",
      );
    } finally {
      setPendingBookAction(null);
    }
  };

  const saveEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await addEntry({
        date,
        time,
        title,
        lesson,
        source: source || undefined,
        url: url || undefined,
        notes: notes || undefined,
      });
      setTitle("");
      setLesson("");
      setSource("");
      setUrl("");
      setNotes("");
      toast.success("Séance ajoutée au suivi.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer cette séance.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (logId: Id<"scienceStudyLogs">) => {
    if (!window.confirm("Supprimer cette séance du suivi ?")) return;
    setPendingDelete(logId);
    try {
      await removeEntry({ logId });
      toast.success("Séance supprimée.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer cette séance.",
      );
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <section id="dashboard-science" className="scroll-mt-24 space-y-5">
      <div className="n-page-head px-1">
        <div>
          <span className="n-label">Suivi d’étude</span>
          <h1 className="n-page-title">Science bénéfique</h1>
        </div>
        <div className="n-seg" role="group" aria-label="Rubrique">
          {(
            [
              { id: "sessions", label: "Séances" },
              { id: "books", label: "Livres" },
              { id: "learning", label: "Apprentissage" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {passage && (
        <figure className="n-card n-rappel">
          <span className="n-label">Rappel pour l’étudiant</span>
          <blockquote className="n-rappel-text">{passage.text}</blockquote>
          <figcaption className="mt-4 text-[13px] text-(--n-muted)">
            <span className="font-semibold text-(--n-ink)">{passage.author}</span>
            {" · "}
            {passage.book}
            {passage.page && `, ${passage.page}`}
          </figcaption>
        </figure>
      )}

      {tab === "sessions" && (
        <>
          <div className="grid items-start gap-4 lg:grid-cols-3">
            <ComposerCard
              title="Noter une séance"
              hint="Un cours suivi, une leçon lue : garde-en la trace."
              icon={PenLine}
              defaultOpen={entries !== undefined && entries.length === 0}
              className="lg:col-span-2"
            >
              <form onSubmit={(event) => void saveEntry(event)} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-[13px] font-semibold">
                    Cours ou livre
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      maxLength={160}
                      placeholder="Ex. Les 40 hadiths d’an-Nawawi"
                      required
                      className="n-input"
                    />
                  </label>
                  <label className="grid gap-1 text-[13px] font-semibold">
                    Leçon ou chapitre
                    <input
                      value={lesson}
                      onChange={(event) => setLesson(event.target.value)}
                      maxLength={200}
                      placeholder="Ex. Hadith 3, les piliers de l’islam"
                      required
                      className="n-input"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <label className="grid gap-1 text-[13px] font-semibold">
                    Date
                    <DateField value={date} onChange={setDate} className="w-auto!" />
                  </label>
                  <label className="grid gap-1 text-[13px] font-semibold">
                    Heure
                    <input
                      type="time"
                      value={time}
                      onChange={(event) => setTime(event.target.value)}
                      required
                      className="n-input w-auto!"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2 pb-1">
                    {(
                      [
                        ["source", "Enseignant", showSource, setShowSource],
                        ["url", "Lien", showUrl, setShowUrl],
                        ["notes", "Notes", showNotes, setShowNotes],
                      ] as const
                    ).map(([id, label, isShown, setShown]) => (
                      <button
                        key={id}
                        type="button"
                        className="n-toggle"
                        aria-pressed={isShown}
                        onClick={() => setShown(!isShown)}
                      >
                        {isShown ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {showSource && (
                  <input
                    value={source}
                    onChange={(event) => setSource(event.target.value)}
                    maxLength={160}
                    aria-label="Enseignant ou source"
                    placeholder="Nom de l’enseignant ou de la chaîne"
                    className="n-input"
                  />
                )}
                {showUrl && (
                  <input
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    aria-label="Lien du cours"
                    placeholder="https://…"
                    className="n-input"
                  />
                )}
                {showNotes && (
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    maxLength={2000}
                    aria-label="Notes à retenir"
                    placeholder="Résumé, idées importantes ou questions…"
                    className="n-input n-textarea"
                  />
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  {showNotes && (
                    <span className="mr-auto text-[13px] tabular-nums text-(--n-muted)">
                      {notes.length}/2 000
                    </span>
                  )}
                  <button type="submit" disabled={isSaving} className="n-btn n-btn-sage disabled:opacity-40">
                    {isSaving ? "Enregistrement…" : "Ajouter la séance"}
                  </button>
                </div>
              </form>
            </ComposerCard>

            <article className="n-card n-card-dark">
              <span className="n-label">Ton rythme</span>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="n-display text-[36px] leading-none">{sessionsLast7Days}</p>
                  <p className="mt-1 text-[13px] text-(--n-on-dark-muted)">7 derniers jours</p>
                </div>
                <div>
                  <p className="n-display text-[36px] leading-none">{sessionsThisMonth}</p>
                  <p className="mt-1 text-[13px] text-(--n-on-dark-muted)">ce mois-ci</p>
                </div>
              </div>
              <p className="mt-5 border-t border-white/15 pt-4 text-[14px] text-(--n-on-dark-muted)">
                {latestEntry ? (
                  <>
                    Dernière étude :{" "}
                    <b className="font-semibold text-(--n-on-dark)">{latestEntry.title}</b>
                  </>
                ) : (
                  "Ta première séance apparaîtra ici."
                )}
              </p>
            </article>
          </div>

          <div>
            <h2 className="n-display px-1 text-[22px]">Études récentes</h2>
            {entries === undefined ? (
              <p className="mt-3 px-1 text-[15px] text-(--n-muted)">Chargement du suivi…</p>
            ) : entries.length === 0 ? (
              <p className="n-dashed mt-3 text-center">
                Tes cours et lectures apparaîtront ici après leur ajout.
              </p>
            ) : (
              <ul className="mt-3 grid gap-3 md:grid-cols-2">
                {entries.map((entry) => (
                  <li key={entry._id} className="n-card n-rise">
                    <div className="flex items-start justify-between gap-3">
                      <time dateTime={entry.date} className="text-[13px] font-semibold text-(--n-sage)">
                        {new Date(`${entry.date}T12:00:00`).toLocaleDateString("fr-FR", {
                          dateStyle: "long",
                        })}
                        {" · "}
                        {entry.time ?? "10:00"}
                      </time>
                      <button
                        type="button"
                        onClick={() => void deleteEntry(entry._id)}
                        disabled={pendingDelete === entry._id}
                        aria-label={`Supprimer la séance ${entry.title}`}
                        className="n-link shrink-0 text-[13px] text-(--n-muted)! disabled:opacity-50"
                      >
                        {pendingDelete === entry._id ? "Suppression…" : "Supprimer"}
                      </button>
                    </div>
                    <h3 className="n-display mt-2 text-[18px] leading-snug">{entry.title}</h3>
                    <p className="mt-1 text-[15px]">{entry.lesson}</p>
                    {entry.source && (
                      <p className="mt-1 text-[14px] text-(--n-muted)">{entry.source}</p>
                    )}
                    {entry.notes && (
                      <p className="mt-3 whitespace-pre-wrap border-l-2 border-(--n-sage-tint) pl-3 text-[15px] leading-6 text-(--n-muted)">
                        {entry.notes}
                      </p>
                    )}
                    {entry.url && (
                      <a href={entry.url} target="_blank" rel="noreferrer" className="n-link mt-3 inline-block text-sm">
                        Ouvrir le cours
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {tab === "books" && (
        <>
          <ComposerCard title="Ajouter un livre" hint="Garde tes prochaines lectures dans l’ordre qui te convient." icon={LibraryBig} defaultOpen={books !== undefined && books.length === 0}>
            <form onSubmit={(event) => void saveBook(event)} className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-[13px] font-semibold">
                Titre
                <input
                  value={bookTitle}
                  onChange={(event) => setBookTitle(event.target.value)}
                  maxLength={200}
                  required
                  className="n-input"
                />
              </label>
              <label className="grid gap-1 text-[13px] font-semibold">
                Auteur
                <input
                  value={bookAuthor}
                  onChange={(event) => setBookAuthor(event.target.value)}
                  maxLength={160}
                  required
                  className="n-input"
                />
              </label>
              <label className="grid gap-1 text-[13px] font-semibold sm:col-span-2">
                Notes (facultatif)
                <textarea
                  value={bookNotes}
                  onChange={(event) => setBookNotes(event.target.value)}
                  maxLength={5000}
                  className="n-input n-textarea font-normal"
                />
              </label>
              <div className="sm:col-span-2 sm:text-right">
                <button
                  type="submit"
                  disabled={pendingBookAction === "new"}
                  className="n-btn n-btn-sage disabled:opacity-40"
                >
                  {pendingBookAction === "new" ? "Ajout…" : "Ajouter le livre"}
                </button>
              </div>
            </form>
          </ComposerCard>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <h2 className="n-display text-[22px]">
                {bookFilter === "next" ? "Prochaines lectures" : "Livres lus"}
              </h2>
              <div className="n-seg" role="group" aria-label="Filtrer les livres">
                {(
                  [
                    { id: "next", label: "À lire / en cours" },
                    { id: "read", label: "Lus" },
                  ] as const
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setBookFilter(id)}
                    aria-pressed={bookFilter === id}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {books === undefined ? (
              <p className="mt-3 px-1 text-[15px] text-(--n-muted)">Chargement des livres…</p>
            ) : visibleBooks.length === 0 ? (
              <p className="n-dashed mt-3 text-center">
                {bookFilter === "next"
                  ? "Ajoute un livre pour préparer tes prochaines lectures."
                  : "Les livres marqués comme lus apparaîtront ici."}
              </p>
            ) : (
              <ol className="mt-3 space-y-3">
                {visibleBooks.map((book) => {
                  const isUpcoming = book.status !== "read";
                  const upcomingIndex = upcomingBooks.findIndex((item) => item._id === book._id);
                  const isEditing = editingBookId === book._id;
                  return (
                    <li key={book._id} className="n-card n-rise">
                      {isEditing ? (
                        <form
                          className="space-y-3"
                          onSubmit={(event) => {
                            event.preventDefault();
                            void saveBookEdits(book._id);
                          }}
                        >
                          <input
                            value={editBookTitle}
                            onChange={(event) => setEditBookTitle(event.target.value)}
                            aria-label="Titre du livre"
                            maxLength={200}
                            required
                            className="n-input font-semibold"
                          />
                          <input
                            value={editBookAuthor}
                            onChange={(event) => setEditBookAuthor(event.target.value)}
                            aria-label="Auteur du livre"
                            maxLength={160}
                            required
                            className="n-input"
                          />
                          <textarea
                            value={editBookNotes}
                            onChange={(event) => setEditBookNotes(event.target.value)}
                            aria-label="Notes sur le livre"
                            maxLength={5000}
                            className="n-input n-textarea"
                          />
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              className="n-link text-sm text-(--n-muted)!"
                              onClick={() => setEditingBookId(null)}
                            >
                              Annuler
                            </button>
                            <button
                              type="submit"
                              disabled={pendingBookAction === book._id}
                              className="n-btn px-4! py-2.5! text-sm! disabled:opacity-40"
                            >
                              Enregistrer
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex gap-4">
                          {isUpcoming && (
                            <span className="n-book-rank" aria-hidden="true">
                              {upcomingIndex + 1}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="n-display text-[18px] leading-snug">{book.title}</h3>
                                <p className="mt-0.5 text-[14px] text-(--n-muted)">{book.author}</p>
                              </div>
                              <select
                                value={book.status}
                                disabled={pendingBookAction === book._id}
                                onChange={(event) =>
                                  void changeBookStatus(
                                    book._id,
                                    event.target.value as Doc<"scienceBooks">["status"],
                                  )
                                }
                                aria-label={`Statut de ${book.title}`}
                                className="n-select"
                              >
                                <option value="to-read">À lire</option>
                                <option value="in-progress">En cours</option>
                                <option value="read">Lu</option>
                              </select>
                            </div>
                            {book.notes && (
                              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-6 text-(--n-muted)">
                                {book.notes}
                              </p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center gap-1">
                              {isUpcoming && (
                                <>
                                  <button
                                    type="button"
                                    className="n-icon-btn"
                                    disabled={upcomingIndex <= 0 || pendingBookAction !== null}
                                    onClick={() => void moveBook(book._id, -1)}
                                    aria-label={`Monter ${book.title}`}
                                  >
                                    <ArrowUp className="size-4" />
                                  </button>
                                  <button
                                    type="button"
                                    className="n-icon-btn"
                                    disabled={
                                      upcomingIndex === upcomingBooks.length - 1 ||
                                      pendingBookAction !== null
                                    }
                                    onClick={() => void moveBook(book._id, 1)}
                                    aria-label={`Descendre ${book.title}`}
                                  >
                                    <ArrowDown className="size-4" />
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                className="n-link ml-2 text-sm"
                                disabled={pendingBookAction !== null}
                                onClick={() => {
                                  setEditingBookId(book._id);
                                  setEditBookTitle(book.title);
                                  setEditBookAuthor(book.author);
                                  setEditBookNotes(book.notes ?? "");
                                }}
                              >
                                Modifier
                              </button>
                              <button
                                type="button"
                                className="n-link ml-3 text-sm text-(--n-muted)!"
                                disabled={pendingBookAction !== null}
                                onClick={() => void deleteBook(book._id)}
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </>
      )}

      {tab === "learning" && <LearningModule />}
    </section>
  );
}
