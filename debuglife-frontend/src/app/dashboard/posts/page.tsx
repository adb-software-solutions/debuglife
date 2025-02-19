"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
// import { DataTable } from "@/packages/nextjs-tailwind-table/src/next";
import { DataTable } from "tablewind/next";
import { fetchWithCSRF } from "@/helpers/common/csrf";
import { colorForStatus } from "@/helpers/common/colorForStatus";
import { Dialog, Transition } from "@headlessui/react";
import Link from "next/link";

// --- Type Definitions ---
interface Category {
  id: string;
  name: string;
}

interface Author {
  id: string;
  full_name: string;
}

interface Tag {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  category: Category | null;
  author: Author | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
  seo_score: number;
  readability_score: number;
}

export interface PaginatedPostResponse {
  results: Post[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
    next_page?: number;
    previous_page?: number;
  };
  available_filters: {
    categories: Category[];
    authors: Author[];
    tags: Tag[];
  };
}

// --- API URL and Fetcher ---
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const fetcher = (url: string) => fetchWithCSRF(url).then((res) => res.json());

// --- Helper hook to update query params ---
const useUpdateQueryParams = () => {
  const router = useRouter();
  return useCallback(
    (params: Record<string, string | null>) => {
      const currentParams = new URLSearchParams(window.location.search);
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (!value) {
          currentParams.delete(key);
        } else {
          currentParams.set(key, value);
        }
      });
      router.push(`?${currentParams.toString()}`);
    },
    [router]
  );
};

const PostsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const updateQueryParams = useUpdateQueryParams();

  const defaultParams: Record<string, string> = {
    page: "1",
    page_size: "25",
    sort_by: "title",
    order: "asc",
  };
  
  // Get all URL query parameters:
  const urlParams = Object.fromEntries(searchParams.entries());
  
  // Merge them with defaults (URL values override defaults)
  const initialParams: Record<string, string> = {
    ...defaultParams,
    ...urlParams,
  };
  
  // For multi-value parameters like tags, if needed:
  const tagFilters = searchParams.getAll("tags");
  if (tagFilters.length > 0) {
    initialParams["tags"] = tagFilters.join(",");
  }

  // --- Fetch auxiliary data for inline editing ---
  const { data: allCategoriesData } = useSWR(`${API_URL}/api/blog/categories`, fetcher);
  const allCategories: Category[] = Array.isArray(allCategoriesData)
    ? allCategoriesData
    : allCategoriesData?.results || [];

  const { data: allTagsData } = useSWR(`${API_URL}/api/blog/tags`, fetcher);
  const allTags: Tag[] = Array.isArray(allTagsData)
    ? allTagsData
    : allTagsData?.results || [];

  const { data: allAuthorsData } = useSWR(`${API_URL}/api/blog/authors`, fetcher);
  const allAuthors: Author[] = Array.isArray(allAuthorsData)
    ? allAuthorsData
    : allAuthorsData?.results || [];

  // --- A refresh key to force the DataTable to re-mount ---
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // --- Delete Modal State and Handlers ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const openDeleteModal = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setPostToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    try {
      const res = await fetchWithCSRF(`${API_URL}/api/blog/posts/${postToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Failed to delete post");
      } else {
        triggerRefresh();
      }
    } catch (error) {
      console.error("Error deleting post", error);
    }
    closeDeleteModal();
  };

  // --- Inline Editing Save Handler ---
  const handleEditSave = async (id: string, newValues: Partial<Post>) => {
    // Check if tags are already strings or objects and extract correctly.
    const tagIDs = newValues.tags && Array.isArray(newValues.tags)
      ? newValues.tags.map((t: any) => typeof t === "string" ? t : t.id)
      : [];
  
    try {
      const res = await fetchWithCSRF(`${API_URL}/api/blog/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newValues.title,
          slug: newValues.slug,
          published: newValues.published,
          category_id: newValues.category ? newValues.category.id : null,
          author_id: newValues.author ? newValues.author.id : null,
          tag_ids: tagIDs,
        }),
      });
      if (!res.ok) {
        console.error("Error saving post");
      } else {
        triggerRefresh();
      }
    } catch (error) {
      console.error("Error saving post", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetchWithCSRF(`${API_URL}/api/blog/posts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        triggerRefresh();
      } else {
        console.error("Error deleting post");
      }
    } catch (error) {
      console.error("Error deleting post", error);
    }
  }
  

  // ---------------------------------------------------------------------
  // BULK ACTION HANDLERS – these functions perform the bulk updates directly
  // ---------------------------------------------------------------------
  const handleBulkDelete = async (selectedIds: string[]) => {
    try {
      const res = await fetchWithCSRF(`${API_URL}/api/blog/posts/bulk-delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_ids: selectedIds }),
      });
      if (res.ok) {
        triggerRefresh();
      } else {
        console.error("Error performing bulk delete");
      }
    } catch (error) {
      console.error("Error performing bulk delete", error);
    }
  };

  const handleBulkPublish = async (selectedIds: string[]) => {
    try {
      const res = await fetchWithCSRF(`${API_URL}/api/blog/posts/bulk-publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_ids: selectedIds }),
      });
      if (res.ok) {
        triggerRefresh();
      } else {
        console.error("Error performing bulk publish");
      }
    } catch (error) {
      console.error("Error performing bulk publish", error);
    }
  };

  const handleBulkDraft = async (selectedIds: string[]) => {
    try {
      const res = await fetchWithCSRF(`${API_URL}/api/blog/posts/bulk-draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_ids: selectedIds }),
      });
      if (res.ok) {
        triggerRefresh();
      } else {
        console.error("Error performing bulk draft");
      }
    } catch (error) {
      console.error("Error performing bulk draft", error);
    }
  };

  const handleBulkCornerstone = async (selectedIds: string[]) => {
    try {
      const res = await fetchWithCSRF(`${API_URL}/api/blog/posts/bulk-cornerstone`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_ids: selectedIds }),
      });
      if (res.ok) {
        triggerRefresh();
      } else {
        console.error("Error performing bulk cornerstone");
      }
    } catch (error) {
      console.error("Error performing bulk cornerstone", error);
    }
  };

  const handleBulkNotCornerstone = async (selectedIds: string[]) => {
    try {
      const res = await fetchWithCSRF(`${API_URL}/api/blog/posts/bulk-not-cornerstone`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_ids: selectedIds }),
      });
      if (res.ok) {
        triggerRefresh();
      } else {
        console.error("Error performing bulk not-cornerstone");
      }
    } catch (error) {
      console.error("Error performing bulk not-cornerstone", error);
    }
  };

  // ---------------------------------------------------------------------
  // State for Bulk Category and Bulk Tag Modals
  // ---------------------------------------------------------------------
  const [bulkActionSelectedIds, setBulkActionSelectedIds] = useState<string[]>([]);
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
  const [bulkCategoryAction, setBulkCategoryAction] = useState<"add" | "remove" | null>(null);
  const [bulkCategory, setBulkCategory] = useState<string>("");

  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [bulkTagAction, setBulkTagAction] = useState<"add" | "remove" | null>(null);
  const [bulkTags, setBulkTags] = useState<string[]>([]);

  // --- Column Definitions for DataTable ---
  const columns = useMemo(
    () => [
      {
        accessor: "title",
        label: "Title",
        sortable: true,
        editable: true,
        inputType: "text" as const,
        sortKey: "title",
        render: (row: Post) => (
          <Link href={`/dashboard/posts/${row.id}`}>
            {row.title}
            </Link>
        ),
      },
      {
        accessor: "slug",
        label: "Slug",
        sortable: true,
        editable: true,
        inputType: "text" as const,
        sortKey: "slug",
        // I would like to truncate the slug to 20 characters as it most likely is similar to the title
        render: (row: Post) => row.slug.length > 20 ? `${row.slug.slice(0, 20)}...` : row.slug,
      },
      {
        accessor: "published",
        label: "Published",
        sortable: true,
        editable: true,
        inputType: "checkbox" as const,
        render: (row: Post) => (row.published ? "Published" : "Draft"),
        sortKey: "published",
      },
      {
        accessor: "category",
        label: "Category",
        sortable: true,
        editable: true,
        inputType: "select" as const,
        options: allCategories,
        render: (row: Post) => (row.category ? row.category.name : "-"),
        sortKey: "category__name",
      },
      {
        accessor: "author",
        label: "Author",
        sortable: true,
        editable: true,
        inputType: "select" as const,
        options: allAuthors.map((a) => ({ id: a.id, name: a.full_name })),
        render: (row: Post) => (row.author ? row.author.full_name : "-"),
        sortKey: "author__user__last_name",
      },
      {
        accessor: "tags",
        label: "Tags",
        sortable: false,
        editable: true,
        inputType: "multi-select" as const,
        options: allTags,
        render: (row: Post) => row.tags.map((tag) => tag.name).join(", "),
      },
      {
        accessor: "seo_score",
        label: "SEO Score",
        sortable: false,
        editable: false,
        render: (row: Post) => {
          const color =
            row.seo_score >= 80 ? "green" : row.seo_score >= 50 ? "amber" : "red";
          return (
            <span
              className={`inline-block h-4 w-4 rounded-full ${colorForStatus(color)}`}
            ></span>
          );
        },
      },
      {
        accessor: "readability_score",
        label: "Readability Score",
        sortable: false,
        editable: false,
        render: (row: Post) => {
          const color =
            row.readability_score >= 80
              ? "green"
              : row.readability_score >= 50
              ? "amber"
              : "red";
          return (
            <span
              className={`inline-block h-4 w-4 rounded-full ${colorForStatus(color)}`}
            ></span>
          );
        },
      },
      {
        accessor: "created_at",
        label: "Created",
        sortable: true,
        editable: false,
        render: (row: Post) =>
          new Date(row.created_at).toLocaleDateString("en-GB"),
        sortKey: "created_at",
      },
      {
        accessor: "updated_at",
        label: "Updated",
        sortable: true,
        editable: false,
        render: (row: Post) =>
          new Date(row.updated_at).toLocaleDateString("en-GB"),
        sortKey: "updated_at",
      },
    ],
    [allCategories, allAuthors, allTags]
  );

  // --- Filter fields for the FilterBar ---
  const filterFields = useMemo(
    () => [
      {
        name: "published",
        allOption: "All Posts",
        type: "select" as const,
        options: [
          { id: "true", name: "Published" },
          { id: "false", name: "Draft" },
        ],
      },
      {
        name: "category",
        apiKey:"categories",
        allOption: "All Categories",
        type: "select" as const,
      },
      {
        name: "author",
        apiKey: "authors",
        allOption: "All Authors",
        type: "select" as const,
      },
      {
        name: "tags",
        type: "multi-select" as const,
      },
    ],
    [allCategories, allAuthors, allTags]
  );

  // --- Define Bulk Actions for DataTable ---
  const bulkActions = useMemo(
    () => [
      {
        key: "delete",
        label: "Delete",
        onClick: handleBulkDelete,
      },
      {
        key: "publish",
        label: "Mark as Published",
        onClick: handleBulkPublish,
      },
      {
        key: "draft",
        label: "Mark as Draft",
        onClick: handleBulkDraft,
      },
      {
        key: "cornerstone",
        label: "Mark as Cornerstone",
        onClick: handleBulkCornerstone,
      },
      {
        key: "not-cornerstone",
        label: "Mark as Not Cornerstone",
        onClick: handleBulkNotCornerstone,
      },
      {
        key: "add-category",
        label: "Add Category",
        onClick: (selectedIds: string[]) => {
          setBulkActionSelectedIds(selectedIds);
          setBulkCategoryAction("add");
          setShowBulkCategoryModal(true);
        },
      },
      {
        key: "remove-category",
        label: "Remove Category",
        onClick: (selectedIds: string[]) => {
          setBulkActionSelectedIds(selectedIds);
          setBulkCategoryAction("remove");
          setShowBulkCategoryModal(true);
        },
      },
      {
        key: "add-tag",
        label: "Add Tag",
        onClick: (selectedIds: string[]) => {
          setBulkActionSelectedIds(selectedIds);
          setBulkTagAction("add");
          setShowBulkTagModal(true);
        },
      },
      {
        key: "remove-tag",
        label: "Remove Tag",
        onClick: (selectedIds: string[]) => {
          setBulkActionSelectedIds(selectedIds);
          setBulkTagAction("remove");
          setShowBulkTagModal(true);
        },
      },
    ],
    []
  );

  return (
    <>
      <DataTable<Post>
        router={router}
        pageTitle="Posts"
        pageSubtitle="Manage your blog posts."
        key={refreshKey}
        endpoint={`${API_URL}/api/blog/posts`}
        columns={columns}
        initialQuery={initialParams}
        fetcher={fetcher}
        filterFields={filterFields}
        bulkActions={bulkActions}
        onEditSave={handleEditSave}
        handleDelete={handleDelete}
      />

      {/* Delete Confirmation Modal */}
      <Transition.Root show={showDeleteModal} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClose={closeDeleteModal}
        >
          <Transition.Child
            as={React.Fragment}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800">
              <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Delete Post
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Are you sure you want to delete this post? This action cannot be undone.
                </p>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition.Root>

      {/* Bulk Category Modal */}
      <Transition.Root show={showBulkCategoryModal} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClose={() => setShowBulkCategoryModal(false)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800">
              <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {bulkCategoryAction === "add"
                  ? "Add Category to Selected Posts"
                  : "Remove Category from Selected Posts"}
              </Dialog.Title>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Category:
                </label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-gray-700 dark:text-gray-300"
                >
                  <option value="">-- Select a Category --</option>
                  {allCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                  onClick={() => setShowBulkCategoryModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                  onClick={async () => {
                    if (!bulkCategory || bulkActionSelectedIds.length === 0 || !bulkCategoryAction) return;
                    const endpoint =
                      bulkCategoryAction === "add"
                        ? "bulk-add-category"
                        : "bulk-remove-category";
                    try {
                      const res = await fetchWithCSRF(`${API_URL}/api/blog/posts/${endpoint}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          post_ids: bulkActionSelectedIds,
                          category_id: bulkCategory,
                        }),
                      });
                      if (res.ok) {
                        triggerRefresh();
                      } else {
                        console.error(`Error performing bulk ${bulkCategoryAction} category`);
                      }
                    } catch (error) {
                      console.error(`Error performing bulk ${bulkCategoryAction} category`, error);
                    }
                    setShowBulkCategoryModal(false);
                  }}
                >
                  Confirm
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition.Root>

      {/* Bulk Tag Modal */}
      <Transition.Root show={showBulkTagModal} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClose={() => setShowBulkTagModal(false)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800">
              <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {bulkTagAction === "add"
                  ? "Add Tag(s) to Selected Posts"
                  : "Remove Tag(s) from Selected Posts"}
              </Dialog.Title>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Tags:
                </label>
                <select
                  multiple
                  value={bulkTags}
                  onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions, (option) => option.value);
                    setBulkTags(options);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-gray-700 dark:text-gray-300"
                >
                  {allTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                  onClick={() => setShowBulkTagModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                  onClick={async () => {
                    if (bulkTags.length === 0 || bulkActionSelectedIds.length === 0 || !bulkTagAction) return;
                    const endpoint =
                      bulkTagAction === "add" ? "bulk-add-tag" : "bulk-remove-tag";
                    try {
                      const res = await fetchWithCSRF(`${API_URL}/api/blog/posts/${endpoint}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          post_ids: bulkActionSelectedIds,
                          tag_ids: bulkTags,
                        }),
                      });
                      if (res.ok) {
                        triggerRefresh();
                      } else {
                        console.error(`Error performing bulk ${bulkTagAction} tag`);
                      }
                    } catch (error) {
                      console.error(`Error performing bulk ${bulkTagAction} tag`, error);
                    }
                    setShowBulkTagModal(false);
                  }}
                >
                  Confirm
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default PostsPage;
