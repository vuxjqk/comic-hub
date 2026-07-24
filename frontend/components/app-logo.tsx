import Image from "next/image";

import Logo from "@/public/comic-hub.svg";

export default function AppLogo() {
  return <Image src={Logo} alt="Comic Hub" className="h-8 w-auto rounded" />;
}
