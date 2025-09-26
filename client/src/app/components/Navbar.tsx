"use client";

import { usePathname } from "next/navigation";
import { Disclosure } from "@headlessui/react";
import Image from "next/image";
import { HiBars3, HiXMark } from "react-icons/hi2";
import logo from "@public/logo.png";
import { useAuth } from "../context/AuthContext";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // ✅ Only show Charts if logged in
  const navigation = user
    ? [
        { name: "Dashboard", href: "/" },
        { name: "Charts", href: "/charts" },
      ]
    : [{ name: "Dashboard", href: "/" }];

  return (
    <Disclosure as="nav" className="bg-[#1e2939] relative shadow-lg">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Left side */}
              <div className="flex items-center space-x-3">
                <Image
                  src={logo}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />

                {/* ✅ Show TaskMaster only when user is logged in */}
                {user && (
                  <span className="text-blue-500 font-semibold text-lg">
                    TaskMaster
                  </span>
                )}

                <div className="hidden sm:flex sm:space-x-4 ml-4">
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
                          "rounded-md px-3 py-2 text-sm font-medium transition"
                        )}
                      >
                        {item.name}
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    {/* User badge with stored color */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-medium ${
                        user.color || "bg-gray-600"
                      }`}
                    >
                      {user.name[0].toUpperCase()}
                    </div>

                    {/* Logout */}
                    <button
                      onClick={logout}
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/login"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition"
                    >
                      Login
                    </a>
                    <a
                      href="/signup"
                      className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Sign Up
                    </a>
                  </>
                )}
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

          {/* Mobile Nav Panel */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
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
                      "block rounded-md px-3 py-2 text-base font-medium transition"
                    )}
                  >
                    {item.name}
                  </a>
                );
              })}

              {/* Auth buttons on mobile */}
              {user ? (
                <>
                  {/* ✅ TaskMaster text also in mobile nav when logged in */}
                  <div className="px-3 py-2 text-blue-500 font-semibold text-lg">
                    TaskMaster
                  </div>

                  <button
                    onClick={logout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white transition"
                  >
                    Login
                  </a>
                  <a
                    href="/signup"
                    className="block rounded-md px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
