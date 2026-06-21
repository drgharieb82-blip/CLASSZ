import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, BookOpen, Check, Clock, GraduationCap, Lock, Play,
  ShieldCheck, Star, Users, Wallet, CreditCard, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getCourseDetails } from "@/lib/courseDetailsMock";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useEnrollmentStore } from "@/lib/stores/enrollment-store";

export const Route = createFileRoute("/courses/$courseId")({
  head: ({ params }) => {
    const course = getCourseDetails(params.courseId);
    return {
      meta: [
        { title: course ? `${course.title} — CLASSZ` : "Course — CLASSZ" },
        { name: "description", content: course?.description ?? "View course details on CLASSZ." },
      ],
    };
  },
  component: CourseDetailsPage,
});

function CourseDetailsPage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const course = getCourseDetails(courseId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isEnrolled = useEnrollmentStore((s) => s.isEnrolled(courseId));
  const [chaptersExpanded, setChaptersExpanded] = useState(true);

  if (!course) {
    return (
      <PublicLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center gap-4 px-4">
          <ShieldCheck className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Course Not Found</h1>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { returnUrl: `/courses/${courseId}` } });
      return;
    }
    navigate({ to: "/student/courses/$courseId/enroll", params: { courseId } });
  };

  const handleContinue = () => {
    navigate({ to: "/student/courses/$courseId/session", params: { courseId } });
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className={cn("relative overflow-hidden bg-gradient-to-br text-white", course.color)}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <Link to="/courses" className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to courses
          </Link>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full border-0 bg-white/20 text-white">{course.subject}</Badge>
                <Badge className="rounded-full border-0 bg-white/20 text-white">{course.level}</Badge>
                {course.tag && <Badge className="rounded-full border-0 bg-white/90 text-foreground">{course.tag}</Badge>}
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{course.title}</h1>
              <p className="mt-3 max-w-2xl text-white/85">{course.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {course.teacher}</span>
                <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-yellow-300 text-yellow-300" /> {course.rating} rating</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {course.students.toLocaleString()} students</span>
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {course.lessons} lessons</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.hours}h total</span>
              </div>
            </div>

            {/* Enrollment Card */}
            <Card className="border-0 bg-white p-6 text-foreground shadow-2xl">
              <div className="text-center">
                <span className="text-4xl">{course.emoji}</span>
                <p className="mt-3 text-3xl font-bold">${course.price}</p>
                <p className="text-sm text-muted-foreground">One-time payment</p>
              </div>
              <div className="mt-5 space-y-3">
                {isEnrolled ? (
                  <Button onClick={handleContinue} className="w-full rounded-xl gradient-brand border-0 text-white" size="lg">
                    <Play className="me-1.5 h-4 w-4" /> Continue Learning
                  </Button>
                ) : (
                  <Button onClick={handleEnroll} className="w-full rounded-xl gradient-brand border-0 text-white" size="lg">
                    <GraduationCap className="me-1.5 h-4 w-4" /> Enroll Now
                  </Button>
                )}
                {!isEnrolled && (
                  <p className="text-center text-xs text-muted-foreground">
                    30-day money-back guarantee
                  </p>
                )}
              </div>
              <div className="mt-5 space-y-2 border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Payment Options</p>
                {course.paymentOptions.map((opt) => (
                  <div key={opt} className="flex items-center gap-2 text-sm text-muted-foreground">
                    {opt.includes("Wallet") ? <Wallet className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                    {opt}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Outcomes */}
            <section>
              <h2 className="text-xl font-bold">What you'll learn</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {course.outcomes.map((outcome) => (
                  <div key={outcome} className="flex items-start gap-2.5 rounded-xl border bg-card p-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-sm">{outcome}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Chapters */}
            <section>
              <button
                onClick={() => setChaptersExpanded(!chaptersExpanded)}
                className="flex w-full items-center justify-between"
              >
                <h2 className="text-xl font-bold">Course Content</h2>
                {chaptersExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              <p className="mt-1 text-sm text-muted-foreground">
                {course.chapters.length} chapters · {course.lessons} lessons · {course.hours}h total
              </p>
              {chaptersExpanded && (
                <div className="mt-4 space-y-2">
                  {course.chapters.map((ch, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                      <div className="flex items-center gap-3">
                        {ch.preview ? (
                          <Play className="h-4 w-4 text-primary" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{ch.title}</p>
                          <p className="text-xs text-muted-foreground">{ch.lessonsCount} lessons · {ch.duration}</p>
                        </div>
                      </div>
                      {ch.preview && (
                        <Badge variant="outline" className="rounded-full text-xs">Preview</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Teacher */}
            <section>
              <h2 className="text-xl font-bold">Your Instructor</h2>
              <Card className="mt-4 border bg-card p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="gradient-brand text-white text-lg">
                      {course.teacher.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{course.teacher}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{course.teacherBio}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> {course.rating} rating</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.students.toLocaleString()} students</span>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-bold">Student Reviews</h2>
              <div className="mt-4 space-y-3">
                {course.reviews.map((review, i) => (
                  <Card key={i} className="border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">{review.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{review.name}</p>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} className={cn("h-3 w-3", s < review.rating ? "fill-warning text-warning" : "text-muted")} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky sidebar on desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <Card className="border bg-card p-5">
                <h3 className="font-semibold">This course includes</h3>
                <div className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> {course.lessons} lessons</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {course.hours} hours of content</div>
                  <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Certificate of completion</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Lifetime access</div>
                </div>
              </Card>
              {!isEnrolled && (
                <Button onClick={handleEnroll} className="w-full rounded-xl gradient-brand border-0 text-white" size="lg">
                  Enroll Now — ${course.price}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {!isEnrolled && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold">${course.price}</p>
              <p className="text-xs text-muted-foreground">One-time</p>
            </div>
            <Button onClick={handleEnroll} className="flex-1 rounded-xl gradient-brand border-0 text-white" size="lg">
              Enroll Now
            </Button>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
