import Link from "next/link";
export default function Footer() {
  return (
    <>
      <footer className="bg-zinc-950 border-t border-zinc-800 px-8 py-12 pb-24">

        <div className="grid md:grid-cols-3 gap-10">

          <div>
            <h3 className="text-2xl font-bold text-red-600 mb-3">
              Palmyra
            </h3>

            <p className="text-gray-400">
              Palmyra is a modern OTT streaming platform for
              entertainment, sports, movies and digital culture connect.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold">
             Quick Links
            </h3>

            <div className="flex flex-col gap-2 text-gray-400">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms & Conditions</Link>
            </div>
          </div>

          
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


        <div className="border-t border-zinc-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          © 2026 - Palmyra by Assist Network Ltd • All Rights Reserved
        </div>

      </footer>


      {/* Bottom Navigation */}

      <div className="fixed bottom-0 left-0 w-full bg-black border-t border-gray-800 flex justify-around py-3 z-50">

        <Link href="/" className="flex flex-col items-center text-white">
          <span className="text-xl">⌂</span>
          <span className="text-xs">Home</span>
        </Link>

        <Link href="/watch" className="flex flex-col items-center text-white">
          <span className="text-xl">▶</span>
          <span className="text-xs">Watch</span>
        </Link>

        <Link href="/store" className="flex flex-col items-center text-white">
          <span className="text-xl">▢</span>
          <span className="text-xs">Store</span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center text-white">
          <span className="text-xl">👤</span>
          <span className="text-xs">Profile</span>
        </Link>

      </div>
    </>
  );
}