import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import HeaderNav from "./HeaderNav";
import Logo from "../ui/Logo";
import Link from "next/link";

export default async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-800">
            <Logo size={170} color="black" />
          </Link>
          <HeaderNav session={session} />
        </nav>
      </div>
    </header>
  );
}
