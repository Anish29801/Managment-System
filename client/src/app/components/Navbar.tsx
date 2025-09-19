"use client";

import { usePathname } from "next/navigation";
import { Disclosure } from "@headlessui/react";
import Image from "next/image";
import { HiBars3, HiXMark } from "react-icons/hi2";
import logo from "@public/logo.png";

const navigation = [{ name: "Dashboard", href: "/" }];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <Disclosure as="nav" className="bg-gray-800/50 relative">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <Image src={logo} alt="Logo" className="h-8 w-auto" />
                </div>

                {/* Navigation links */}
                <div className="hidden sm:flex sm:space-x-4">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={classNames(
                          isActive
                            ? "bg-gray-950/50 text-white"
                            : "text-gray-300 hover:bg-white/5 hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium"
                        )}
                      >
                        {item.name}
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Auth Buttons */}
              <div className="hidden sm:flex items-center space-x-3">
                <a
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  Sign Up
                </a>
              </div>

              {/* Mobile menu button */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <HiXMark className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <HiBars3 className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu items */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={classNames(
                      isActive
                        ? "bg-gray-950/50 text-white"
                        : "text-gray-300 hover:bg-white/5 hover:text-white",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                );
              })}

              {/* Mobile Auth Buttons */}
              <Disclosure.Button
                as="a"
                href="/login"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Login
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                href="/signup"
                className="block rounded-md px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                Sign Up
              </Disclosure.Button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
