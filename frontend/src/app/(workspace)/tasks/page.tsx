import TasksPage from "@/app/components/tasks/tasks-page";
import { Suspense } from "react";


export default function Page() {
  return (
    <Suspense fallback={null}>
      <TasksPage />
    </Suspense>
  );
}
