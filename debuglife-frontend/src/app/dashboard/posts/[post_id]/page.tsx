"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import { Switch } from "@headlessui/react";
import { MultiSelectDropdown } from "@/components/cms/ui/dropdowns/MultiSelectDropdown";
import { fetchWithCSRF } from "@/helpers/common/csrf";
import SEOSidebar from "@/components/cms/seo/SEOSidebar";
import useContentAnalysis from "@/hooks/useContentAnalysis";
import { ContentAnalysisResult } from "@/types/contentAnalysis";

import dynamic from 'next/dynamic';

const MilkdownEditor = dynamic(() => import('@/components/cms/ui/markdown/MarkdownEditor'), {
  ssr: false,
});


// ----- Helper: slugify -----
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

// ----- SWR fetcher -----
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

interface PaginatedCategoryResponse {
  results: Category[];
}

interface PaginatedTagResponse {
  results: Tag[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  full_name: string;
  bio: string;
  instagram: string | null;
  facebook: string | null;
  x: string | null;
  linkedin: string | null;
  github: string | null;
  pinterest: string | null;
  threads: string | null;
  bluesky: string | null;
  youtube: string | null;
  tiktok: string | null;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  featured_image: string;
  created_at: string;
  updated_at: string;
  category: Category;
  tags: Tag[];
  author: Author;
  keyphrase: string;
  cornerstone_content: boolean;
  seo_score: number;
  readability_score: number;
}

const EditPostPage: React.FC = () => {
  const router = useRouter();
  const { post_id } = useParams();

  // Form state.
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [keyphrase, setKeyphrase] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  // New featured image file (if user selects one)
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  // URL of current featured image (if any)
  const [initialFeaturedImage, setInitialFeaturedImage] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [cornerstoneContent, setCornerstoneContent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch categories and tags.
  const { data: categoriesData } = useSWR<PaginatedCategoryResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/blog/categories?page=1&page_size=100`,
    fetcher
  );
  const { data: tagsData } = useSWR<PaginatedTagResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/blog/tags?page=1&page_size=100`,
    fetcher
  );

  // Fetch the current post data.
  const { data: post, error, isLoading } = useSWR<Post>(
    post_id ? `${process.env.NEXT_PUBLIC_API_URL}/api/blog/posts/${post_id}` : null,
    fetcher
  );

  // When post data is loaded, populate form state.
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setKeyphrase(post.keyphrase);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setCategory(post.category.id);
      setTags(post.tags ? post.tags.map((tag) => tag.id) : []);
      setPublished(post.published);
      setCornerstoneContent(post.cornerstone_content);
      if (post.featured_image) {
        setInitialFeaturedImage(post.featured_image);
      }
    }
  }, [post]);

  // Auto-slugify based on title if user hasn't manually edited the slug.
  useEffect(() => {
    if (!isSlugEdited && title) {
      setSlug(slugify(title).slice(0, 100));
    }
  }, [title, isSlugEdited]);

  // Callback when the Milkdown editor content changes.
  const handleContentChange = useCallback((newMarkdown: string) => {
    setContent(newMarkdown);
  }, []);

  // Simple form validation before submission.
  const validateForm = (): boolean => {
    if (!title.trim()) {
      setErrorMessage("Title is required.");
      return false;
    }
    if (!slug.trim()) {
      setErrorMessage("Slug is required.");
      return false;
    }
    if (!category.trim()) {
      setErrorMessage("Please select a category.");
      return false;
    }
    // We do not require a new featured image here, since the existing one may suffice.
    setErrorMessage("");
    return true;
  };

  // Handler to update blog details (JSON payload without file).
  const handleUpdateBlog = async (): Promise<boolean> => {
    // Build a payload object with your blog fields.
    const payloadObj = {
      title,
      slug,
      excerpt,
      content,
      category_id: category,
      tag_ids: tags,
      published,
      keyphrase,
      cornerstone_content: cornerstoneContent,
      seo_score: analysis.seoScore,
      readability_score: analysis.readabilityScore,
      seo_analysis: { details: analysis.seoDetails.assessments },
      readability_analysis: { details: analysis.readabilityDetails.assessments },
    };

    try {
      const res = await fetchWithCSRF(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/posts/${post_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadObj),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        setErrorMessage(
          errorData.message || "Failed to update post. Please try again."
        );
        console.log("Failed to update post", errorData);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Failed to update post", error);
      setErrorMessage("An unexpected error occurred. Please try again later.");
      return false;
    }
  };

  // Handler to update featured image (separate endpoint; POST request).
  const handleUpdateFeaturedImage = async (): Promise<boolean> => {
    if (!featuredImage) {
      // No new image selected, so nothing to update.
      return true;
    }
    const formData = new FormData();
    formData.append("file", featuredImage);

    try {
      const res = await fetchWithCSRF(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/posts/${post_id}/featured-image`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        setErrorMessage(
          errorData.message || "Failed to update featured image. Please try again."
        );
        console.log("Failed to update featured image", errorData);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Failed to update featured image", error);
      setErrorMessage("An unexpected error occurred. Please try again later.");
      return false;
    }
  };

  // Main form submit handler that performs both updates.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setErrorMessage(""); // Clear any previous error.

    // First, update the blog details.
    const blogUpdated = await handleUpdateBlog();
    if (!blogUpdated) {
      return;
    }

    // Then, if a new featured image was selected, update it.
    const imageUpdated = await handleUpdateFeaturedImage();
    if (!imageUpdated) {
      return;
    }

    // If both operations succeeded, redirect to the posts dashboard.
    router.push("/dashboard/posts");
  };

  const analysis: ContentAnalysisResult = useContentAnalysis({
    content,
    title,
    keyphrase,
    blogId: post?.id,
    cornerstone: cornerstoneContent,
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading post data.</p>;
  }

  return (
    <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Edit Post
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main grid with two columns: Left for form cards, Right for SEO Sidebar */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Left Column: All form cards */}
          <div className="space-y-6 md:col-span-4">
            {/* Top Row: Post Details and Settings side by side */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Post Details Card */}
              <div className="rounded-md bg-white p-6 shadow dark:bg-slate-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Post Details
                </h2>
                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!isSlugEdited) {
                        setSlug(slugify(e.target.value).slice(0, 100));
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-300 focus:ring focus:ring-sky-200 dark:bg-slate-700 dark:text-gray-300"
                    required
                  />
                </div>
                {/* Slug */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value.slice(0, 100));
                      setIsSlugEdited(true);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-300 focus:ring focus:ring-sky-200 dark:bg-slate-700 dark:text-gray-300"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Max 100 characters
                  </p>
                </div>
                {/* Keyphrase */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Keyphrase
                  </label>
                  <input
                    type="text"
                    value={keyphrase}
                    onChange={(e) => setKeyphrase(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-300 focus:ring focus:ring-sky-200 dark:bg-slate-700 dark:text-gray-300"
                  />
                </div>
                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Excerpt
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-300 focus:ring focus:ring-sky-200 dark:bg-slate-700 dark:text-gray-300"
                    rows={3}
                  />
                </div>
              </div>
              {/* Settings Card */}
              <div className="rounded-md bg-white p-6 shadow dark:bg-slate-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Settings
                </h2>
                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-300 focus:ring focus:ring-sky-200 dark:bg-slate-700 dark:text-gray-300"
                    required
                  >
                    <option value="">Select Category</option>
                    {categoriesData?.results.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Tags */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags
                  </label>
                  <MultiSelectDropdown
                    options={tagsData?.results || []}
                    selected={tags}
                    onChange={setTags}
                  />
                </div>
                {/* Published Toggle */}
                <div className="flex flex-col items-start">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Published
                  </label>
                  <Switch
                    checked={published}
                    onChange={setPublished}
                    className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out data-checked:bg-sky-300"
                  >
                    <span className="sr-only">Published</span>
                    <span className="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out group-data-checked:translate-x-5">
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in group-data-checked:opacity-0 group-data-checked:duration-100 group-data-checked:ease-out"
                      >
                        <svg
                          fill="none"
                          viewBox="0 0 12 12"
                          className="h-3 w-3 text-gray-400"
                        >
                          <path
                            d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-data-checked:opacity-100 group-data-checked:duration-200 group-data-checked:ease-in"
                      >
                        <svg
                          fill="currentColor"
                          viewBox="0 0 12 12"
                          className="h-3 w-3"
                        >
                          <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                        </svg>
                      </span>
                    </span>
                  </Switch>
                </div>
                {/* Cornerstone Content Toggle */}
                <div className="flex flex-col items-start">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cornerstone Content
                  </label>
                  <Switch
                    checked={cornerstoneContent}
                    onChange={setCornerstoneContent}
                    className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out data-checked:bg-sky-300"
                  >
                    <span className="sr-only">Cornerstone Content</span>
                    <span className="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out group-data-checked:translate-x-5">
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in group-data-checked:opacity-0 group-data-checked:duration-100 group-data-checked:ease-out"
                      >
                        <svg
                          fill="none"
                          viewBox="0 0 12 12"
                          className="h-3 w-3 text-gray-400"
                        >
                          <path
                            d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-data-checked:opacity-100 group-data-checked:duration-200 group-data-checked:ease-in"
                      >
                        <svg
                          fill="currentColor"
                          viewBox="0 0 12 12"
                          className="h-3 w-3"
                        >
                          <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                        </svg>
                      </span>
                    </span>
                  </Switch>
                </div>
              </div>
            </div>
            {/* Content Card */}
            <div className="rounded-md bg-white p-6 shadow dark:bg-slate-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
                Content
              </h2>
              <div
                id="milkdown-outer"
                className="rounded-md border border-gray-300 shadow-sm focus-within:border-sky-300 focus-within:ring focus-within:ring-sky-200 dark:bg-slate-700"
              >
                {content ? (
                  <MilkdownEditor
                    markdown={content}
                    setMarkdown={handleContentChange}
                  />
                ) : (
                  <p>Loading content...</p>
                )}
              </div>
            </div>
            <SEOSidebar
              content={content}
              title={title}
              keyphrase={keyphrase}
              cornerstone={cornerstoneContent}
              blogId={post?.id}
              analysis={analysis}
            />
            {/* Media Card */}
            <div className="rounded-md bg-white p-6 shadow dark:bg-slate-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
                Media
              </h2>
              <div>
                <label className="inline-block cursor-pointer rounded-md bg-sky-300 px-4 py-2 text-white">
                  Choose Featured Image
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFeaturedImage(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <div className="mt-2">
                  {featuredImage ? (
                    <img
                      src={URL.createObjectURL(featuredImage)}
                      alt="Preview"
                      className="max-h-48 rounded-md border border-gray-300 shadow-sm"
                    />
                  ) : initialFeaturedImage ? (
                    <img
                      src={initialFeaturedImage}
                      alt="Current Featured"
                      className="max-h-48 rounded-md border border-gray-300 shadow-sm"
                    />
                  ) : null}
                </div>
              </div>
            </div>
            {/* Error Message and Submit Button */}
            {errorMessage && (
              <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">
                {errorMessage}
              </div>
            )}
            <div>
              <button
                type="submit"
                className="w-full rounded-md bg-sky-300 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
              >
                Update Post
              </button>
            </div>
          </div>
          {/* Right Column: SEO Analysis Sidebar */}
          <div className="md:col-span-1"></div>
        </div>
      </form>
    </div>
  );
};

export default EditPostPage;
