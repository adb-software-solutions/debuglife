"use client";

import React, {useState, useCallback, useMemo, useRef, useEffect} from "react";
import {createPortal} from "react-dom";
import {useSearchParams, useRouter} from "next/navigation";
import useSWR from "swr";
import {fetchWithCSRF} from "@/helpers/common/csrf"; // Import our custom fetch wrapper

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

interface Post {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    category: Category | null;
    author: Author | null;
    tags: Tag[];
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

interface Pagination {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
    next_page?: number;
    previous_page?: number;
}

interface PaginatedPostResponse {
    results: Post[];
    pagination: Pagination;
}

// --- SWR Fetcher ---
// Instead of using the default fetch, we now use fetchWithCSRF.
const fetcher = (url: string) => fetchWithCSRF(url).then((res) => res.json());

/**
 * A custom multi-select component that displays selected options as pills.
 * When clicked, it renders a dropdown using a portal so that it is not clipped.
 */
interface MultiSelectDropdownProps {
    options: Tag[];
    selected: string[]; // Array of tag IDs.
    onChange: (selected: string[]) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    options,
    selected,
    onChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    const handleOptionClick = (id: string) => {
        onChange([...selected, id]);
    };

    const handleRemove = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selected.filter((s) => s !== id));
    };

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: "absolute",
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [isOpen]);

    const dropdown = isOpen && (
        <ul
            style={dropdownStyle}
            className="z-50 rounded-md border border-gray-300 bg-white text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
            {options
                .filter((opt) => !selected.includes(opt.id))
                .map((opt) => (
                    <li
                        key={opt.id}
                        onClick={() => {
                            handleOptionClick(opt.id);
                            setIsOpen(false);
                        }}
                        className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {opt.name}
                    </li>
                ))}
        </ul>
    );

    return (
        <div ref={containerRef} className="relative w-full">
            <div
                className="flex w-full cursor-pointer flex-wrap items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                onClick={toggleDropdown}
            >
                {selected.length === 0 && (
                    <span className="text-gray-400">Select Tags...</span>
                )}
                {selected.map((id) => {
                    const option = options.find((opt) => opt.id === id);
                    if (!option) return null;
                    return (
                        <span
                            key={id}
                            className="flex items-center rounded bg-sky-100 px-2 py-0.5 text-xs text-sky-800"
                        >
                            {option.name}
                            <button
                                onClick={(e) => handleRemove(id, e)}
                                className="ml-1 text-sky-600 hover:text-sky-800 focus:outline-none"
                            >
                                &times;
                            </button>
                        </span>
                    );
                })}
            </div>
            {isOpen && createPortal(dropdown, document.body)}
        </div>
    );
};

// --- Field Mapping for Sorting ---
// These are the actual model fields your backend sorts on.
const fieldMapping: {[key: string]: string} = {
    title: "title",
    slug: "slug",
    published: "published",
    category: "category__name",
    author: "author__user__last_name", // Sorting on last name
    created_at: "created_at",
    updated_at: "updated_at",
};

// --- New Helper: updateQueryParams ---
// This function accepts an object of key-value pairs and updates them all at once.
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
        [router],
    );
};

const PostsPage: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const updateQueryParams = useUpdateQueryParams();

    // Read query parameters with defaults.
    const page = Number(searchParams.get("page")) || 1;
    const page_size = Number(searchParams.get("page_size")) || 25;
    const publishedFilter = searchParams.get("published") || "";
    const categoryFilter = searchParams.get("category") || "";
    const authorFilter = searchParams.get("author") || "";
    const tagFilters = searchParams.getAll("tags"); // array of tag IDs
    const sortBy = searchParams.get("sort_by") || "title";
    const order = searchParams.get("order") || "asc";

    // Build API query string.
    const queryParams = new URLSearchParams();
    queryParams.set("page", String(page));
    queryParams.set("page_size", String(page_size));
    queryParams.set("sort_by", sortBy);
    queryParams.set("order", order);
    if (publishedFilter) queryParams.set("published", publishedFilter);
    if (categoryFilter) queryParams.set("category", categoryFilter);
    if (authorFilter) queryParams.set("author", authorFilter);
    tagFilters.forEach((tag) => queryParams.append("tags", tag));
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/blog/posts?${queryParams.toString()}`;

    // Fetch posts with SWR using our custom fetcher.
    const {data, error, mutate} = useSWR<PaginatedPostResponse>(
        apiUrl,
        fetcher,
    );

    // Sorting helper that updates both parameters at once.
    const updateSorting = useCallback(
        (field: string) => {
            const actualField = fieldMapping[field] || field;
            if (sortBy === actualField) {
                updateQueryParams({order: order === "asc" ? "desc" : "asc"});
            } else {
                updateQueryParams({sort_by: actualField, order: "asc"});
            }
        },
        [sortBy, order, updateQueryParams],
    );

    // Pagination controls.
    const goToPage = (newPage: number) => {
        updateQueryParams({page: String(newPage)});
    };

    // Allow the user to adjust how many results per page.
    const updatePageSize = (newSize: string) => {
        updateQueryParams({page_size: newSize, page: "1"}); // reset page to 1 when page size changes
    };

    const availableStatuses = useMemo(() => {
        return [
            {id: "true", name: "Published"},
            {id: "false", name: "Draft"},
        ];
    }, []);

    // Compute available filters from posts data.
    const availableCategories = useMemo(() => {
        if (!data) return [];
        const map = new Map<string, string>();
        data.results.forEach((post) => {
            if (post.category) {
                map.set(post.category.id, post.category.name);
            }
        });
        return Array.from(map.entries()).map(([id, name]) => ({id, name}));
    }, [data]);

    const availableAuthors = useMemo(() => {
        if (!data) return [];
        const map = new Map<string, string>();
        data.results.forEach((post) => {
            if (post.author) {
                map.set(post.author.id, post.author.full_name);
            }
        });
        return Array.from(map.entries()).map(([id, full_name]) => ({
            id,
            full_name,
        }));
    }, [data]);

    const availableTags = useMemo(() => {
        if (!data) return [];
        const map = new Map<string, string>();
        data.results.forEach((post) => {
            post.tags.forEach((tag) => {
                map.set(tag.id, tag.name);
            });
        });
        return Array.from(map.entries()).map(([id, name]) => ({id, name}));
    }, [data]);

    // --- Inline Editing State ---
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<Post>>({});

    const startEditing = (post: Post) => {
        setEditingPostId(post.id);
        setEditValues(post);
    };

    const cancelEditing = () => {
        setEditingPostId(null);
        setEditValues({});
    };

    const saveEdit = async (id: string) => {
        try {
            // Use our custom fetchWithCSRF for state-changing requests.
            const res = await fetchWithCSRF(
                `${process.env.NEXT_PUBLIC_API_URL}/api/blog/posts/${id}`,
                {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        title: editValues.title,
                        slug: editValues.slug,
                        published: editValues.published,
                        category_id: editValues.category
                            ? editValues.category.id
                            : null,
                        author_id: editValues.author
                            ? editValues.author.id
                            : null,
                        tag_ids: editValues.tags
                            ? editValues.tags.map((t: Tag) => t.id)
                            : [],
                    }),
                },
            );
            if (res.ok) {
                setEditingPostId(null);
                setEditValues({});
                mutate();
            } else {
                console.error("Error saving post");
            }
        } catch (error) {
            console.error("Error saving post", error);
        }
    };

    // Handle tags changes via our custom MultiSelectDropdown.
    const handleTagsChange = (selected: string[]) => {
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.delete("tags");
        selected.forEach((val) => currentParams.append("tags", val));
        router.push(`?${currentParams.toString()}`);
    };

    // State to toggle filters visibility.
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const toggleFilters = () => {
        if (showFilters) {
            updateQueryParams({category: "", author: "", tags: null});
        }
        setShowFilters(!showFilters);
    };

    if (error) return <div>Error loading posts</div>;
    if (!data) return <div>Loading posts...</div>;

    return (
        <div className="px-4 py-4 sm:px-6 lg:px-8">
            {/* Top Controls */}
            <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Posts
                    </h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        A list of your posts with inline editing, filtering,
                        sorting and pagination.
                    </p>
                </div>
                <div className="mt-4 flex items-center space-x-4 sm:mt-0">
                    {/* Results per Page Control */}
                    <select
                        value={page_size}
                        onChange={(e) => updatePageSize(e.target.value)}
                        className="rounded-md border bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                        <option value="10">10 per page</option>
                        <option value="25">25 per page</option>
                        <option value="50">50 per page</option>
                        <option value="100">100 per page</option>
                    </select>
                    <button
                        onClick={() => router.push("/dashboard/posts/new")}
                        className="rounded-md bg-sky-300 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                    >
                        Add New
                    </button>
                    <button
                        onClick={toggleFilters}
                        className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
                    >
                        {showFilters ? "Hide Filters" : "Show Filters"}
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            {showFilters && (
                <div className="mt-2 pb-3 font-normal">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <select
                            value={publishedFilter}
                            onChange={(e) =>
                                updateQueryParams({published: e.target.value})
                            }
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <option value="">All Posts</option>
                            {availableStatuses.map((status) => (
                                <option key={status.id} value={status.id}>
                                    {status.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={(e) =>
                                updateQueryParams({category: e.target.value})
                            }
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <option value="">All Categories</option>
                            {availableCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={authorFilter}
                            onChange={(e) =>
                                updateQueryParams({author: e.target.value})
                            }
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <option value="">All Authors</option>
                            {availableAuthors.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.full_name}
                                </option>
                            ))}
                        </select>
                        <MultiSelectDropdown
                            options={availableTags}
                            selected={tagFilters}
                            onChange={handleTagsChange}
                        />
                    </div>
                </div>
            )}

            {/* Posts Table */}
            <div className="overflow-x-auto ring-1 shadow ring-black/5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th
                                scope="col"
                                className="cursor-pointer py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-100"
                                onClick={() => updateSorting("title")}
                            >
                                Title{" "}
                                {sortBy === fieldMapping["title"] &&
                                    (order === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                                scope="col"
                                className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                                onClick={() => updateSorting("slug")}
                            >
                                Slug{" "}
                                {sortBy === fieldMapping["slug"] &&
                                    (order === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                                scope="col"
                                className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                                onClick={() => updateSorting("published")}
                            >
                                Published{" "}
                                {sortBy === fieldMapping["published"] &&
                                    (order === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                                scope="col"
                                className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                                onClick={() => updateSorting("category")}
                            >
                                Category{" "}
                                {sortBy === fieldMapping["category"] &&
                                    (order === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                                scope="col"
                                className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                                onClick={() => updateSorting("author")}
                            >
                                Author{" "}
                                {sortBy === fieldMapping["author"] &&
                                    (order === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                            >
                                Tags
                            </th>
                            {/* Read-only Created/Updated Dates */}
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                            >
                                Created
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                            >
                                Updated
                            </th>
                            <th
                                scope="col"
                                className="relative py-3.5 pr-4 pl-3 sm:pr-6"
                            >
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:bg-slate-800">
                        {data.results.map((post) => (
                            <tr
                                key={post.id}
                                className="hover:bg-gray-50 dark:hover:bg-slate-600"
                            >
                                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6 dark:text-gray-100">
                                    {editingPostId === post.id ? (
                                        <input
                                            type="text"
                                            value={editValues.title || ""}
                                            onChange={(e) =>
                                                setEditValues((prev) => ({
                                                    ...prev,
                                                    title: e.target.value,
                                                }))
                                            }
                                            className="w-full rounded border bg-white p-1 text-sm dark:bg-gray-800 dark:text-gray-300"
                                        />
                                    ) : (
                                        post.title
                                    )}
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                    {editingPostId === post.id ? (
                                        <input
                                            type="text"
                                            value={editValues.slug || ""}
                                            onChange={(e) =>
                                                setEditValues((prev) => ({
                                                    ...prev,
                                                    slug: e.target.value,
                                                }))
                                            }
                                            className="w-full rounded border bg-white p-1 text-sm dark:bg-gray-800 dark:text-gray-300"
                                        />
                                    ) : (
                                        post.slug
                                    )}
                                </td>
                                <td className="px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                    {editingPostId === post.id ? (
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            {/* The hidden checkbox */}
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={
                                                    editValues.published ||
                                                    false
                                                }
                                                onChange={(e) =>
                                                    setEditValues((prev) => ({
                                                        ...prev,
                                                        published:
                                                            e.target.checked,
                                                    }))
                                                }
                                            />
                                            {/* The toggle switch */}
                                            <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-sky-600 peer-focus:ring-2 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700" />
                                            {/* Optionally, you can show text beside the switch */}
                                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                {editValues.published
                                                    ? "Yes"
                                                    : "No"}
                                            </span>
                                        </label>
                                    ) : post.published ? (
                                        "Yes"
                                    ) : (
                                        "No"
                                    )}
                                </td>

                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                    {editingPostId === post.id ? (
                                        <select
                                            value={
                                                editValues.category
                                                    ? editValues.category.id
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const selectedCategory =
                                                    availableCategories.find(
                                                        (cat) =>
                                                            cat.id ===
                                                            e.target.value,
                                                    ) || null;
                                                setEditValues((prev) => ({
                                                    ...prev,
                                                    category: selectedCategory,
                                                }));
                                            }}
                                            className="w-full rounded border bg-white p-1 text-sm dark:bg-gray-800 dark:text-gray-300"
                                        >
                                            <option value="">
                                                Select Category
                                            </option>
                                            {availableCategories.map((cat) => (
                                                <option
                                                    key={cat.id}
                                                    value={cat.id}
                                                >
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : post.category ? (
                                        post.category.name
                                    ) : (
                                        "-"
                                    )}
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                    {editingPostId === post.id ? (
                                        <select
                                            value={
                                                editValues.author
                                                    ? editValues.author.id
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const selectedAuthor =
                                                    availableAuthors.find(
                                                        (a) =>
                                                            a.id ===
                                                            e.target.value,
                                                    ) || null;
                                                setEditValues((prev) => ({
                                                    ...prev,
                                                    author: selectedAuthor,
                                                }));
                                            }}
                                            className="w-full rounded border bg-white p-1 text-sm dark:bg-gray-800 dark:text-gray-300"
                                        >
                                            <option value="">
                                                Select Author
                                            </option>
                                            {availableAuthors.map((a) => (
                                                <option key={a.id} value={a.id}>
                                                    {a.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : post.author ? (
                                        post.author.full_name
                                    ) : (
                                        "-"
                                    )}
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                    {editingPostId === post.id ? (
                                        <MultiSelectDropdown
                                            options={availableTags}
                                            selected={
                                                editValues.tags
                                                    ? editValues.tags.map(
                                                          (tag: Tag) => tag.id,
                                                      )
                                                    : []
                                            }
                                            onChange={(selected) => {
                                                const currentParams =
                                                    new URLSearchParams(
                                                        window.location.search,
                                                    );
                                                currentParams.delete("tags");
                                                selected.forEach((val) =>
                                                    currentParams.append(
                                                        "tags",
                                                        val,
                                                    ),
                                                );
                                                router.push(
                                                    `?${currentParams.toString()}`,
                                                );
                                                const selectedTags =
                                                    availableTags.filter(
                                                        (tag) =>
                                                            selected.includes(
                                                                tag.id,
                                                            ),
                                                    );
                                                setEditValues((prev) => ({
                                                    ...prev,
                                                    tags: selectedTags,
                                                }));
                                            }}
                                        />
                                    ) : (
                                        post.tags
                                            .map((tag) => tag.name)
                                            .join(", ")
                                    )}
                                </td>
                                {/* Read-only Created/Updated Dates */}
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                    {new Date(
                                        post.created_at,
                                    ).toLocaleDateString("en-GB")}
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                    {new Date(
                                        post.updated_at,
                                    ).toLocaleDateString("en-GB")}
                                </td>
                                <td className="px-3 py-4 text-right text-sm font-medium whitespace-nowrap">
                                    {editingPostId === post.id ? (
                                        <>
                                            <button
                                                onClick={() =>
                                                    saveEdit(post.id)
                                                }
                                                className="mr-2 rounded bg-sky-300 px-2 py-1 text-sm font-semibold text-gray-900 hover:bg-sky-400"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="rounded bg-gray-300 px-2 py-1 text-sm font-semibold text-gray-900 hover:bg-gray-400"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => startEditing(post)}
                                            className="rounded bg-gray-300 px-2 py-1 text-sm font-semibold text-gray-900 hover:bg-gray-400"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination Controls */}
            <div className="mt-4 flex items-center justify-between">
                <button
                    className={`rounded px-4 py-2 text-sm font-semibold ${
                        data.pagination.has_previous_page
                            ? "bg-sky-300 text-slate-900 hover:bg-sky-400"
                            : "cursor-not-allowed bg-gray-300 text-gray-500"
                    }`}
                    disabled={!data.pagination.has_previous_page}
                    onClick={() => goToPage(data.pagination.previous_page!)}
                >
                    Previous
                </button>
                <span className="text-sm text-slate-700">
                    Page {data.pagination.page} of {data.pagination.total_pages}
                </span>
                <button
                    className={`rounded px-4 py-2 text-sm font-semibold ${
                        data.pagination.has_next_page
                            ? "bg-sky-300 text-slate-900 hover:bg-sky-400"
                            : "cursor-not-allowed bg-gray-300 text-gray-500"
                    }`}
                    disabled={!data.pagination.has_next_page}
                    onClick={() => goToPage(data.pagination.next_page!)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PostsPage;
