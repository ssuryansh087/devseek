"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    quote:
      "Thanks to DevSeek’s curated mentorship programs, I landed my dream job at a top fintech startup in just three months.",
    author: "Anjali Patel",
    role: "Full‑Stack Engineer @ FinEdge",
    avatar: "/avatars/anjali.jpg",
  },
  {
    quote:
      "The coding challenges and portfolio reviews on DevSeek gave me the confidence to negotiate a 40% salary increase.",
    author: "Marcus Nguyen",
    role: "Backend Developer @ CloudWave",
    avatar: "/avatars/marcus.jpg",
  },
  {
    quote:
      "DevSeek’s networking events connected me with industry leaders who ultimately helped me transition into a leadership role.",
    author: "Elena Rodriguez",
    role: "Engineering Manager @ OpenSourceCo",
    avatar: "/avatars/elena.jpg",
  },
  {
    quote:
      "My GitHub stars went from 50 to over 500 thanks to DevSeek’s project showcases—my open‑source contributions have never looked better!",
    author: "Open‑Source Contributions",
    role: "Community Metrics",
    avatar: "/avatars/metrics.svg",
  },
];

export default function DevSeekTestimonials() {
  // Duplicate testimonials for seamless infinite scroll
  const displayTestimonials = [...testimonials, ...testimonials];

  useEffect(() => {
    // Placeholder for future side‑effects (e.g. pause on hover)
  }, []);

  return (
    <div className="relative h-full overflow-hidden">
      <div className="w-1/2 mx-auto h-full scroll-container">
        <div className="animate-scroll">
          {displayTestimonials.map((t, i) => (
            <Card
              key={`set1-${i}`}
              className="mb-6 backdrop-blur-sm bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-white text-lg font-medium leading-relaxed shadow-text">
                    {t.quote}
                  </p>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={t.avatar} />
                      <AvatarFallback>{t.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white shadow-text">
                        {t.author}
                      </p>
                      <p className="text-sm text-white/80 shadow-text">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="animate-scroll" style={{ marginTop: 0 }}>
          {displayTestimonials.map((t, i) => (
            <Card
              key={`set2-${i}`}
              className="mb-6 backdrop-blur-sm bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-white text-lg font-medium leading-relaxed shadow-text">
                    {t.quote}
                  </p>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={t.avatar} />
                      <AvatarFallback>{t.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white shadow-text">
                        {t.author}
                      </p>
                      <p className="text-sm text-white/80 shadow-text">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .scroll-container {
          position: relative;
          overflow: hidden;
        }

        .animate-scroll {
          animation: scrollUp 30s linear infinite;
        }

        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-100%);
          }
        }
      `}</style>
    </div>
  );
}
