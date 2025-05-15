"use client";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

async function createPost(prevState: any, formData: FormData) {
  try {
    const headers: HeadersInit = {
      // The browser will automatically set the 'Content-Type' to 'multipart/form-data'
      // when the body is a FormData object, so we don't need to set it manually.
    };

    // Retrieve CSRF token from cookies
    const csrfTokenCookie = document.cookie.match(/csrftoken=([^;]+)/);
    const csrfToken = csrfTokenCookie ? csrfTokenCookie[1] : null;

    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    } else {
      console.warn('CSRF token not found. POST request might fail.');
      // Depending on your setup, you might want to handle this more gracefully,
      // e.g., by trying to fetch a CSRF token first if it's missing.
    }

    const res = await fetch("http://localhost:8000/social_network/posts/", {
      method: "POST",
      headers: headers,
      body: formData,
      credentials: "include", // Important for sending cookies if using session auth
    });
    
    const responseData = await res.json();
    if (!res.ok) {
      // Handle errors from backend (e.g., validation errors)
      // responseData might contain { error: "..." } or { field_errors: { ... } }
      const errorMessage = responseData.detail || responseData.error || JSON.stringify(responseData.errors) || "Failed to create post";
      return { error: errorMessage, ...responseData };
    }
    return responseData; // Success, return the created post data (should include an id)
  } catch (error) {
    // Network or other unexpected errors
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred while creating the post" };
  }
}

export default function CreatePostPage() {
  const [state, formAction] = useActionState(createPost, null);
  const router = useRouter();

  useEffect(() => {
    if (state && state.id && !state.error) {
      // Assuming successful post creation returns an object with an 'id' and no 'error' field
      router.push('/home'); // Redirect to the main posts list (home)
    }
    // You can also handle displaying state.error here if needed, e.g., in a toast notification
  }, [state, router]); // Dependencies for the effect

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
          
          {/* Display error messages from the state */}
          {state && state.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-lg">
              <p>Error: {state.error}</p>
            </div>
          )}

          <form action={formAction}>
            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-violet-700 font-medium mb-2">
                  Title
                </label>
                <input
                  id="title" // Added id for label association
                  name="title"
                  className="w-full px-4 py-3 text-violet-900 rounded-lg border border-violet-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-violet-700 font-medium mb-2">
                  Content
                </label>
                <textarea
                  id="content" // Added id for label association
                  name="content"
                  className="w-full px-4 py-3 text-violet-900 rounded-lg border border-violet-200 focus:ring-2 focus:ring-violet-500 h-40"
                  required
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-violet-700 font-medium mb-2">
                  Image
                </label>
                <input
                  id="image" // Added id for label association
                  type="file"
                  name="image"
                  className="w-full text-violet-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200 transition-colors"
                />
              </div>

              <button
                type="submit"
                // Consider disabling the button while formAction is pending if useActionState provides such a status
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
