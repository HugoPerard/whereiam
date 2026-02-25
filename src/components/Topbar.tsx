import { GithubIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const Topbar = () => {
  return (
    <nav className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-3 md:px-8">
      <span className="text-sm font-medium tracking-wide text-slate-400">
        Where I&apos;m
      </span>
      <div className="flex items-center gap-2">
        <Link
          href="https://prdhugo.fr"
          target="_blank"
          className="rounded-full p-1.5 transition-colors hover:bg-white/10"
          aria-label="Hugo Pérard"
        >
          <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/20">
            <Image
              alt="Hugo Pérard's avatar"
              src="/avatar.png"
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </div>
        </Link>
        <Link
          href="https://github.com/HugoPerard/whereiam"
          target="_blank"
          className="rounded-full p-2 transition-colors hover:bg-white/10"
          aria-label="GitHub"
        >
          <GithubIcon size={20} className="text-slate-300" />
        </Link>
      </div>
    </nav>
  );
};
