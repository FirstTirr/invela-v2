import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10 py-8 text-center text-sm text-slate-500">
      <p>© {new Date().getFullYear()} Inventaris Labor. All rights reserved.</p>
    </footer>
  );
}