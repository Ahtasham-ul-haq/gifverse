"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Trendings() {
  const [gifs, setGifs] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchGifs = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}&limit=20&offset=${offset}`
      );
      const json = await res.json();

      setGifs((prev) => {
        const existingIds = new Set(prev.map((g) => g.id));
        const filteredNew = json.data.filter(
          (g: any) => !existingIds.has(g.id)
        );
        return [...prev, ...filteredNew];
      });

      const totalCount = json.pagination.total_count;
      const nextOffset = offset + 20;

      setOffset(nextOffset);
      setHasMore(nextOffset < totalCount);
    } catch (err) {
      console.error("Error fetching GIFs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const node = observerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchGifs();
        }
      },
      { threshold: 1 }
    );

    observer.observe(node);
    return () => observer.unobserve(node);
  }, [offset]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trending GIFs</h1>

      <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
        {gifs.map((gif) => (
          <div
            key={gif.id}
            className="break-inside-avoid rounded shadow overflow-hidden bg-white relative group"
          >
            <img
              src={gif.images.fixed_width.url}
              alt={gif.title}
              className="w-full h-auto bg-slate-600 rounded-md"
            />
            {/* Details appear on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center p-4">
              <div className="flex items-center gap-2 mb-2">
                {gif.user?.avatar_url && (
                  <img
                    src={gif.user.avatar_url}
                    alt={gif.user.display_name || gif.user.username}
                    className="w-8 h-8 rounded-full border"
                  />
                )}
                <span className="font-semibold">
                  {gif.user?.display_name || gif.user?.username || "Unknown"}
                </span>
              </div>
              <Link
                href={gif.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-200"
              >
                View on Giphy
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div
        ref={observerRef}
        className="h-10 mt-10 flex justify-center items-center"
      >
        {isLoading && (
          <div className="flex items-center justify-center min-h-screen w-full">
            <Loader2 />
          </div>
        )}
        {!hasMore && (
          <span className="text-gray-500">No more GIFs to load.</span>
        )}
      </div>
    </div>
  );
}
