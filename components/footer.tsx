"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-primary/50 mt-5">
      <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-semibold mb-4">Product</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Community</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Forums
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Discord
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Careers
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
