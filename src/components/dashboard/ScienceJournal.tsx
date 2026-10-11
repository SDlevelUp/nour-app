import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

function todayKey() {
  return new Intl.DateTimeFormat("fr-CA").format(new Date());
}

export function ScienceJournal() {
  const entries = useQuery(api.scienceProgress.list, {});
  const books = useQuery(api.scienceBooks.list, {});
  const addEntry = useMutation(api.scienceProgress.add);
  const removeEntry = useMutation(api.scienceProgress.remove);
  const addBook = useMutation(api.scienceBooks.add);
  const updateBook = useMutation(api.scienceBooks.update);
  const setBookStatus = useMutation(api.scienceBooks.setStatus);
  const reorderBooks = useMutation(api.scienceBooks.reorder);
  const removeBook = useMutation(api.scienceBooks.remove);
  const [date, setDate] = useState(todayKey);
  const [time, setTime] = useState("10:00");
  const [title, setTitle] = useState("");
  const [lesson, setLesson] = useState("");
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
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
    <section
      id="dashboard-science"
      className="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6"
    >
      <div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Suivi d’étude
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight">
            Science bénéfique
          </h1>
        </div>
      </div>
      <p className="mt-3 text-base leading-6 text-stone-600">
        Garde une trace des cours et livres étudiés, des leçons suivies et des
        enseignements à retenir.
      </p>

      <section className="mt-6 rounded-2xl border border-[#DCE5DC] p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-stone-900">Livres</h2>
        <p className="mt-1 text-sm text-stone-600">
          Garde tes prochaines lectures dans l’ordre qui te convient.
        </p>
        <form
          onSubmit={(event) => void saveBook(event)}
          className="mt-4 grid gap-3 rounded-2xl bg-[#EEF4EE] p-4 sm:grid-cols-2"
        >
          <label className="text-sm font-medium text-stone-700">
            Titre
            <Input
              value={bookTitle}
              onChange={(event) => setBookTitle(event.target.value)}
              maxLength={200}
              required
              className="mt-1.5 bg-white text-base md:text-base"
            />
          </label>
          <label className="text-sm font-medium text-stone-700">
            Auteur
            <Input
              value={bookAuthor}
              onChange={(event) => setBookAuthor(event.target.value)}
              maxLength={160}
              required
              className="mt-1.5 bg-white text-base md:text-base"
            />
          </label>
          <label className="text-sm font-medium text-stone-700 sm:col-span-2">
            Notes
            <Textarea
              value={bookNotes}
              onChange={(event) => setBookNotes(event.target.value)}
              maxLength={5000}
              className="mt-1.5 min-h-20 bg-white text-base md:text-base"
            />
          </label>
          <div className="sm:col-span-2 sm:text-right">
            <Button
              type="submit"
              disabled={pendingBookAction === "new"}
              className="bg-[#5D7C65] text-white hover:bg-[#45624D]"
            >
              {pendingBookAction === "new" ? "Ajout…" : "Ajouter un livre"}
            </Button>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-stone-900">
            {bookFilter === "next" ? "Prochaines lectures" : "Livres lus"}
          </h3>
          <div className="flex rounded-xl border border-stone-200 bg-stone-50 p-1">
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
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${bookFilter === id ? "bg-white text-stone-900 shadow-sm" : "text-stone-600"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {books === undefined ? (
          <p className="mt-3 text-sm text-stone-500">Chargement des livres…</p>
        ) : visibleBooks.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-stone-200 p-4 text-sm text-stone-500">
            {bookFilter === "next"
              ? "Ajoute un livre pour préparer tes prochaines lectures."
              : "Les livres marqués comme lus apparaîtront ici."}
          </p>
        ) : (
          <ol className="mt-3 space-y-3">
            {visibleBooks.map((book) => {
              const isUpcoming = book.status !== "read";
              const upcomingIndex = upcomingBooks.findIndex(
                (item) => item._id === book._id,
              );
              const isEditing = editingBookId === book._id;
              return (
                <li
                  key={book._id}
                  className="rounded-2xl border border-stone-200 p-4"
                >
                  {isEditing ? (
                    <form
                      className="space-y-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void saveBookEdits(book._id);
                      }}
                    >
                      <Input
                        value={editBookTitle}
                        onChange={(event) => setEditBookTitle(event.target.value)}
                        aria-label="Titre du livre"
                        maxLength={200}
                        required
                      />
                      <Input
                        value={editBookAuthor}
                        onChange={(event) => setEditBookAuthor(event.target.value)}
                        aria-label="Auteur du livre"
                        maxLength={160}
                        required
                      />
                      <Textarea
                        value={editBookNotes}
                        onChange={(event) => setEditBookNotes(event.target.value)}
                        aria-label="Notes sur le livre"
                        maxLength={5000}
                        className="min-h-20"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setEditingBookId(null)}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          disabled={pendingBookAction === book._id}
                          className="bg-[#5D7C65] text-white hover:bg-[#45624D]"
                        >
                          Enregistrer
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-stone-900">
                          {book.title}
                        </h4>
                        <p className="mt-1 text-sm text-stone-600">{book.author}</p>
                        {book.notes && (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">
                            {book.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
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
                          className="min-h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-700"
                        >
                          <option value="to-read">À lire</option>
                          <option value="in-progress">En cours</option>
                          <option value="read">Lu</option>
                        </select>
                        {isUpcoming && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={upcomingIndex <= 0 || pendingBookAction !== null}
                              onClick={() => void moveBook(book._id, -1)}
                            >
                              Monter
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={
                                upcomingIndex === upcomingBooks.length - 1 ||
                                pendingBookAction !== null
                              }
                              onClick={() => void moveBook(book._id, 1)}
                            >
                              Descendre
                            </Button>
                          </>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={pendingBookAction !== null}
                          onClick={() => {
                            setEditingBookId(book._id);
                            setEditBookTitle(book.title);
                            setEditBookAuthor(book.author);
                            setEditBookNotes(book.notes ?? "");
                          }}
                        >
                          Modifier
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={pendingBookAction !== null}
                          onClick={() => void deleteBook(book._id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <form
        onSubmit={(event) => void saveEntry(event)}
        className="mt-5 space-y-4 rounded-2xl bg-[#F5F2EE] p-4"
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
          <label className="text-base font-medium text-stone-700">
            Cours ou livre étudié
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              placeholder="Ex. Les 40 hadiths de l’imam An-Nawawi"
              required
              className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
            />
          </label>
          <label className="text-base font-medium text-stone-700">
            Date d’étude
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
            />
          </label>
          <label className="text-base font-medium text-stone-700">
            Heure à afficher dans le planning
            <Input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
              className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
            />
          </label>
        </div>
        <label className="block text-base font-medium text-stone-700">
          Leçon ou chapitre suivi
          <Input
            value={lesson}
            onChange={(event) => setLesson(event.target.value)}
            maxLength={200}
            placeholder="Ex. Hadith 3 — Les piliers de l’islam"
            required
            className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-base font-medium text-stone-700">
            Enseignant ou source{" "}
            <span className="text-[15px] font-normal text-stone-500">
              (facultatif)
            </span>
            <Input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              maxLength={160}
              placeholder="Nom de l’enseignant ou de la chaîne"
              className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
            />
          </label>
          <label className="text-base font-medium text-stone-700">
            Lien du cours{" "}
            <span className="text-[15px] font-normal text-stone-500">
              (facultatif, HTTPS)
            </span>
            <Input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://…"
              className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
            />
          </label>
        </div>
        <label className="block text-base font-medium text-stone-700">
          Notes à retenir{" "}
          <span className="text-[15px] font-normal text-stone-500">
            (facultatif)
          </span>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={2000}
            placeholder="Résumé, idées importantes ou questions…"
            className="mt-1.5 min-h-20 border-stone-200 bg-white text-base md:text-base"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[15px] text-stone-500">
            {notes.length}/2 000
          </span>
          <Button
            type="submit"
            disabled={isSaving}
            className="gap-2 bg-emerald-900 text-[15px] text-white hover:bg-emerald-800"
          >
            Ajouter la séance
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <h2 className="text-base font-semibold text-stone-800">
          Études récentes
        </h2>
        {entries === undefined ? (
          <p className="mt-3 text-base text-stone-500">Chargement du suivi…</p>
        ) : entries.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-stone-200 p-4 text-base text-stone-500">
            <span className="text-base">
              Tes cours et lectures apparaîtront ici après leur ajout.
            </span>
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {entries.map((entry) => (
              <li
                key={entry._id}
                className="rounded-2xl border border-stone-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <time
                      dateTime={entry.date}
                      className="text-[15px] font-medium text-emerald-800"
                    >
                      {new Date(`${entry.date}T12:00:00`).toLocaleDateString(
                        "fr-FR",
                        {
                          dateStyle: "long",
                        },
                      )}
                      {" · "}
                      {entry.time ?? "10:00"}
                    </time>
                    <h3 className="mt-1 text-base font-semibold text-stone-900">
                      {entry.title}
                    </h3>
                    <p className="study-prose mt-1 text-[15px] text-stone-700">
                      {entry.lesson}
                    </p>
                    {entry.source && (
                      <p className="mt-1 text-[15px] text-stone-500">
                        {entry.source}
                      </p>
                    )}
                    {entry.url && (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[15px] font-medium text-emerald-800 underline underline-offset-2"
                      >
                        Ouvrir le cours
                      </a>
                    )}
                    {entry.notes && (
                      <p className="study-prose mt-2 whitespace-pre-wrap text-base text-stone-600">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteEntry(entry._id)}
                    disabled={pendingDelete === entry._id}
                    aria-label={`Supprimer la séance ${entry.title}`}
                    className="shrink-0 rounded-lg px-2 py-1 text-sm text-stone-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                  >
                    {pendingDelete === entry._id ? "Suppression…" : "Supprimer"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
