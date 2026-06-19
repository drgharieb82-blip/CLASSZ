import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LessonPlayerLayout } from "@/components/lesson/LessonPlayerLayout";
import { CourseSidebar } from "@/components/lesson/CourseSidebar";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { ContentPlayer } from "@/components/lesson/ContentPlayer";
import { LessonNavigation } from "@/components/lesson/LessonNavigation";
import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonTabs } from "@/components/lesson/LessonTabs";
import { lessonPlayerData } from "@/lib/mock";

export const Route = createFileRoute("/student/lesson")({
  component: LessonPlayerPage,
});

function LessonPlayerPage() {
  const { course, chapters, currentLesson } = lessonPlayerData;

  return (
    <LessonPlayerLayout
      sidebar={
        <CourseSidebar
          courseName={course.name}
          courseEmoji={course.emoji}
          courseColor={course.color}
          courseProgress={course.progress}
          chapters={chapters}
          activeChapterId="ch2"
        />
      }
      content={
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-5 p-4 sm:p-6"
        >
          <LessonHeader
            courseName={course.name}
            chapterName={currentLesson.chapterName}
            lessonTitle={currentLesson.title}
            lessonDescription={currentLesson.description}
            lessonNumber={currentLesson.number}
            totalLessons={currentLesson.totalLessons}
            progress={currentLesson.progress}
          />

          <ContentPlayer
            title={currentLesson.title}
            type="video"
            thumbnailEmoji={course.emoji}
          />

          <LessonNavigation
            hasPrevious={true}
            hasNext={true}
            isCompleted={false}
          />

          <LessonContent blocks={currentLesson.contentBlocks} />
        </motion.div>
      }
      panel={
        <LessonTabs
          objectives={currentLesson.objectives}
          keyConcepts={currentLesson.keyConcepts}
          duration={currentLesson.duration}
          contentType={currentLesson.contentType}
          progress={currentLesson.progress}
          watchedTime={currentLesson.watchedTime}
          remainingTime={currentLesson.remainingTime}
          teacherName={course.teacher.name}
          teacherSubject={course.teacher.subject}
          teacherInitials={course.teacher.initials}
        />
      }
    />
  );
}
