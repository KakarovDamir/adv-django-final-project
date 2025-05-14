/* eslint-disable */
"use client";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

async function createPost(prevState: any, formData: FormData) {
  try {
    const res = await fetch("http://138.68.87.67:8000/social_network/posts/", {
      method: "POST",
      headers: {
        "X-CSRFToken": document.cookie.match(/csrftoken=([^;]+)/)?.[1] || "",
      },
      body: formData,
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    return { error: "Failed to create post" };
  }
}

export default function CreatePostPage() {
  const [state, formAction] = useActionState(createPost, null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-violet-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Назад к списку постов
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-violet-900 mb-6 text-center">
            Create New Post
          </h2>

          <form action={formAction}>
            <div className="space-y-5">
              <div>
                <label className="block text-violet-700 font-medium mb-2">
                  Title
                </label>
                <input
                  name="title"
                  className="w-full px-4 py-3 text-violet-900 rounded-lg border border-violet-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-violet-700 font-medium mb-2">
                  Content
                </label>
                <textarea
                  name="content"
                  className="w-full px-4 py-3 text-violet-900 rounded-lg border border-violet-200 focus:ring-2 focus:ring-violet-500 h-40"
                  required
                />
              </div>

              <div>
                <label className="block text-violet-700 font-medium mb-2">
                  Image
                </label>
                <input
                  type="file"
                  name="image"
                  className="w-full text-violet-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
              >
                Create Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
