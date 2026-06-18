import { createFileRoute } from "@tanstack/react-router";
import { DashPage } from "@/components/common/DashPage";
import { GenericDashboard } from "@/components/common/GenericDashboard";
import { ROLES } from "@/lib/roles";

export const Route = createFileRoute("/student/course-details")({
  component: Page,
});

function Page() {
  return (
    <DashPage role="student" title="Course Details" subtitle="Everything inside this course" icon={ROLES.student.icon}>
      <GenericDashboard chartA="area" chartB="donut" />
    </DashPage>
  );
}
