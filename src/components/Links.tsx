import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const Links = () => {
  return (
    <div className="flex gap-4">
      <Link
        href="https://prdhugo.fr"
        target="_blank"
        rel="noopener noreferrer"
        className="home-icon-button flex border p-2 transition-colors"
        aria-label="Visit website"
      >
        <Image
          src={process.env.AVATAR_URL ?? ""}
          alt=""
          width={20}
          height={20}
          className="h-7 w-7 object-contain rounded-full"
        />
      </Link>
      <Link
        href="https://github.com/HugoPerard/whereiam"
        target="_blank"
        rel="noopener noreferrer"
        className="home-icon-button border p-3 transition-colors"
        aria-label="View GitHub repository"
      >
        <Github className="h-5 w-5" />
      </Link>
    </div>
  );
};
