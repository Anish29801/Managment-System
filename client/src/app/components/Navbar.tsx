"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Disclosure } from "@headlessui/react";
import Image from "next/image";
import { HiBars3, HiXMark } from "react-icons/hi2";
import logo from "@public/logo.png";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const navigation = user
    ? [
        { name: "Dashboard", href: "/" },
        { name: "Charts", href: "/charts" },
      ]
    : [{ name: "Dashboard", href: "/" }];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isClient) return null; // Prevent SSR mismatch

  return (
    <Disclosure as="nav" className="bg-[#1e2939] relative shadow-lg">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              {/* Left: Logo + Name */}
              <div className="flex items-center space-x-3">
                <Image
                  src={logo}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />
                {user && (
                  <span className="hidden sm:block text-blue-500 font-semibold text-lg">
                    TaskMaster
                  </span>
                )}
              </div>

              {/* Desktop Nav Links */}
              <div className="hidden sm:flex sm:space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? "bg-gray-950/50 text-white"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    } rounded-md px-3 py-2 text-sm font-medium transition`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* Desktop Right Section */}
              <div className="hidden sm:flex items-center space-x-3">
                {user ? (
                  <>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-medium ${
                        user.color || "bg-gray-600"
                      }`}
                    >
                      {user.name[0].toUpperCase()}
                    </div>
                    <button
                      onClick={handleLogout}
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

              {/* Mobile Hamburger Button */}
              <div className="flex sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <HiXMark className="block h-6 w-6" />
                  ) : (
                    <HiBars3 className="block h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <Disclosure.Panel className="sm:hidden bg-[#1e2939]">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? "bg-gray-950/50 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  } block rounded-md px-3 py-2 text-base font-medium transition`}
                >
                  {item.name}
                </a>
              ))}

              {user ? (
                <>
                  
                  <button
                    onClick={handleLogout}
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
