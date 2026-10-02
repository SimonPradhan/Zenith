import NotesPage from "@/app/components/notes/note-page";
import { Suspense } from "react";


export default function Page() {
  return (
    <Suspense fallback={null}>
      <NotesPage />
    </Suspense>
  );
}
