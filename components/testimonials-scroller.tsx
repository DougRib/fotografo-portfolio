'use client'

import Image from 'next/image'

type Item = {
  id: string
  author: string
  role?: string | null
  text: string
  avatarUrl?: string | null
}

export function TestimonialsScroller({ items }: { items: Item[] }) {
  const track = [...items, ...items]
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-auto group">
        <div className="flex gap-6 w-[200%] animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]">
          {track.map((t, idx) => (
            <div key={`${t.id}-${idx}`} className="min-w-[320px] max-w-sm shrink-0">
              <div className="rounded-xl border bg-card text-card-foreground shadow p-6 h-full border-primary">
                <div className="flex items-center gap-1 mb-4 text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  {t.avatarUrl ? (
                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                      <Image src={t.avatarUrl} alt={t.author} fill sizes="40px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10" />
                  )}
                  <div>
                    <p className="font-semibold">{t.author}</p>
                    {t.role && <p className="text-sm text-muted-foreground">{t.role}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

