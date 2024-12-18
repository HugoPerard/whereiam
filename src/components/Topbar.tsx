import { GithubIcon } from "lucide-react";
import Link from "next/link";

export const Topbar = () => {
  return (
    <div className="absolute z-10 top-0 right-0 m-2 flex gap-2">
      <Link href="https://prdhugo.fr" target="_blank">
        <p className="rounded-full border-gray-200 border-2 bg-white bg-opacity-50 shadow-lg h-10 w-10 justify-items-center">
          <img alt="Hugo Pérard's avatar" src="/avatar.png" />
        </p>
      </Link>
      <Link href="https://github.com/HugoPerard/whereiam" target="_blank">
        <p className="rounded-full border-gray-200 border-2 bg-white bg-opacity-50 text-gray-800 shadow-lg h-10 w-10 justify-items-center">
          <GithubIcon size="1.4rem" className="mt-1.5" />
        </p>
      </Link>
    </div>
  );
};
