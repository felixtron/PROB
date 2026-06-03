import { ReactNode } from "react";

export default function Container({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <div className={`max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24 xl:px-32 ${className}`}>
      {children}
    </div>
  );
}
