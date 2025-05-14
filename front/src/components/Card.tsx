/* eslint-disable */
"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface CardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  icon?: ReactNode;
  colorAccent?: string;
  href?: string;
  onClick?: () => void;
  badges?: string[];
}

export default function Card({
  title,
  subtitle,
  imageUrl,
  icon,
  colorAccent = "bg-gradient-to-br from-indigo-500 to-violet-600",
  href,
  onClick,
  badges,
}: CardProps) {
  const CardContent = () => (
    <div className="card-hover group h-full w-full rounded-2xl bg-white p-6 shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Optional gradient accent in the corner */}
      <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 blur-xl opacity-50"></div>

      <div className="flex flex-col h-full relative">
        <div className="mb-5">
          {imageUrl ? (
            <div className="relative h-52 w-full overflow-hidden rounded-xl shadow-sm">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {badges && badges.length > 0 && (
                <div className="absolute bottom-3 left-3 flex gap-2">
                  {badges.map((badge, index) => (
                    <span
                      key={index}
                      className="badge badge-primary px-3 py-1 shadow-sm bg-white/90 backdrop-blur-sm"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : icon ? (
            <div
              className={`${colorAccent} h-14 w-14 rounded-xl p-3 text-white shadow-md flex items-center justify-center`}
            >
              {icon}
            </div>
          ) : (
            <div
              className={`${colorAccent} h-24 w-full rounded-xl shadow-md`}
            />
          )}
        </div>

        <div className="flex-grow">
          <h3 className="font-semibold text-gray-800 text-xl group-hover:text-indigo-700 transition-colors font-poppins">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-2 text-gray-600 leading-relaxed">{subtitle}</p>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-indigo-700 font-medium">
              View details
            </span>
            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-indigo-600 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="h-full block">
        <CardContent />
      </Link>
    );
  }

  return (
    <div
      onClick={onClick}
      className={onClick ? "cursor-pointer h-full" : "h-full"}
    >
      <CardContent />
    </div>
  );
}
