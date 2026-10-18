
import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="border-t border-zinc-800 bg-zinc-950 px-8 py-12 pb-24">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="mb-3 text-2xl font-bold text-red-600">
              Palmyra
            </h3>

            <p className="text-gray-400">
              Palmyra is a modern lifestyle and fashion brand bringing
              together everyday essentials, contemporary style, and
              self-expression.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white">Quick Links</h3>

            <div className="flex flex-col gap-2 text-gray-400">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms &amp; Conditions</Link>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="mb-4 font-bold text-white">
              Follow Palmyra
            </h3>

            <div className="flex flex-col gap-4 text-gray-400">
              <a
                href="https://www.instagram.com/palmyraofficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition hover:text-pink-400"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-lg">
                  ◎
                </span>
                <span>Instagram</span>
              </a>

              <a
                href="https://www.youtube.com/@palmyraofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition hover:text-red-500"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-lg">
                  ▶
                </span>
                <span>YouTube</span>
              </a>

              <a
                href="https://www.facebook.com/palmyrastv"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition hover:text-blue-400"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-lg">
                  f
                </span>
                <span>Facebook</span>
              </a>

              <a
                href="https://x.com/guerreroisravel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition hover:text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold">
                  𝕏
                </span>
                <span>X (Twitter)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-zinc-800 pt-6 text-center text-sm text-gray-500">
          © 2026 - Palmyra by Assist Network Ltd • All Rights Reserved
        </div>
      </footer>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 z-50 flex w-full justify-around border-t border-gray-800 bg-black py-3">
        {/* Home */}
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 10 9-7 9 7" />
            <path d="M5 9v12h14V9" />
            <path d="M9 21v-7h6v7" />
          </svg>

          <span className="text-xs">Home</span>
        </Link>

        {/* Watch */}
        <Link
          href="/watch"
          className="flex flex-col items-center gap-1 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m10 9 5 3-5 3V9Z" />
          </svg>

          <span className="text-xs">Watch</span>
        </Link>

        {/* Store */}
        <Link
          href="/store"
          className="flex flex-col items-center gap-1 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 8h14l1 13H4L5 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>

          <span className="text-xs">Store</span>
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className="flex flex-col items-center gap-1 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
          </svg>

          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </>
  );
}
