"use client";

import React, {
    Fragment,
    useState,
    useCallback,
    useMemo,
    useRef,
    useEffect,
} from "react";
import {createPortal} from "react-dom";
import {Dialog, Transition, Menu} from "@headlessui/react";
import {useSearchParams, useRouter} from "next/navigation";
import useSWR from "swr";
import {fetchWithCSRF} from "@/helpers/common/csrf";
import { colorForStatus } from "@/helpers/common/colorForStatus";
import { TrafficLight } from "@/types/contentAnalysis";

// --- Updated Type Definitions ---
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
    seo_score: number;
    readability_score: number;
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

interface AvailableFilters {
    categories: Category[];
    authors: Author[];
    tags: Tag[];
}

interface PaginatedPostResponse {
    results: Post[];
    pagination: Pagination;
    available_filters: AvailableFilters;
}

// --- SWR Fetcher ---
const fetcher = (url: string) => fetchWithCSRF(url).then((res) => res.json());

// --- Custom MultiSelectDropdown Component ---
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
const fieldMapping: {[key: string]: string} = {
    title: "title",
    slug: "slug",
    published: "published",
    category: "category__name",
    author: "author__user__last_name", // Sorting on last name
    created_at: "created_at",
    updated_at: "updated_at",
};

// --- Helper: updateQueryParams ---
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
    const tagFilters = searchParams.getAll("tags");
    const sortBy = searchParams.get("sort_by") || "title";
    const order = searchParams.get("order") || "asc";

    // Build API query string for posts.
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

    // ----- For Filters: Use the available_filters from the posts API -----
    const filterCategories = useMemo(() => {
        if (!data) return [];
        return data.available_filters.categories;
    }, [data]);

    const filterTags = useMemo(() => {
        if (!data) return [];
        return data.available_filters.tags;
    }, [data]);

    const filterAuthors = useMemo(() => {
        if (!data) return [];
        const map = new Map<string, Author>();
        data.available_filters.authors.forEach((author: Author) => {
            map.set(author.id, author);
        });
        return Array.from(map.values());
    }, [data]);

    // ----- For Inline Editing & Bulk Modals: Use "all" data from dedicated endpoints -----
    // For categories
    const {data: allCategoriesData} = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/categories`,
        fetcher,
    );
    const allCategories: Category[] = Array.isArray(allCategoriesData)
        ? allCategoriesData
        : allCategoriesData?.results || [];

    // For tags
    const {data: allTagsData} = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/tags`,
        fetcher,
    );
    const allTags: Tag[] = Array.isArray(allTagsData)
        ? allTagsData
        : allTagsData?.results || [];

    // For authors (if needed)
    const {data: allAuthorsData} = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/authors`,
        fetcher,
    );
    const allAuthors: Author[] = Array.isArray(allAuthorsData)
        ? allAuthorsData
        : allAuthorsData?.results || [];

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
        updateQueryParams({page_size: newSize, page: "1"});
    };

    const availableStatuses = useMemo(() => {
        return [
            {id: "true", name: "Published"},
            {id: "false", name: "Draft"},
        ];
    }, []);

    // ----- Inline Editing State -----
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

    // ----- Delete Modal State & Functions -----
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
            const res = await fetchWithCSRF(
                `${process.env.NEXT_PUBLIC_API_URL}/api/blog/posts/${postToDelete}`,
                {method: "DELETE"},
            );
            if (res.ok) {
                mutate();
            } else {
                console.error("Failed to delete post");
            }
        } catch (error) {
            console.error("Error deleting post", error);
        }
        closeDeleteModal();
    };

    // ----- Selection Helpers -----
    const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
    const selectAll = selectedPosts.length === data?.results.length;
    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedPosts([]);
        } else {
            setSelectedPosts(data?.results.map((post) => post.id) || []);
        }
    };
    const togglePostSelection = (postId: string) => {
        if (selectedPosts.includes(postId)) {
            setSelectedPosts(selectedPosts.filter((id) => id !== postId));
        } else {
            setSelectedPosts([...selectedPosts, postId]);
        }
    };

    const [allItemsSelected, setAllItemsSelected] = useState(false);
    const markAllSelected = async () => {
        try {
            const queryParamsAll = new URLSearchParams();
            queryParamsAll.set("page", "1");
            queryParamsAll.set(
                "page_size",
                String(data?.pagination.total_items),
            );
            queryParamsAll.set("sort_by", sortBy);
            queryParamsAll.set("order", order);
            if (publishedFilter)
                queryParamsAll.set("published", publishedFilter);
            if (categoryFilter) queryParamsAll.set("category", categoryFilter);
            if (authorFilter) queryParamsAll.set("author", authorFilter);
            tagFilters.forEach((tag) => queryParamsAll.append("tags", tag));

            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/blog/posts?${queryParamsAll.toString()}`;
            const res = await fetchWithCSRF(url);
            if (!res.ok) {
                console.error("Error fetching all posts");
                return;
            }
            const allData: PaginatedPostResponse = await res.json();
            setSelectedPosts(allData.results.map((post) => post.id));
            setAllItemsSelected(true);
        } catch (error) {
            console.error("Error fetching all posts", error);
        }
    };

    const cancelAllSelection = () => {
        setSelectedPosts([]);
        setAllItemsSelected(false);
    };

    // ----- New Bulk Action Confirmation for delete, publish, draft & cornerstone -----
    type BulkActionType =
        | "delete"
        | "publish"
        | "draft"
        | "cornerstone"
        | "not-cornerstone"
        | null;
    const [bulkAction, setBulkAction] = useState<BulkActionType>(null);
    const [showBulkActionModal, setShowBulkActionModal] = useState(false);

    const handleBulkDelete = () => {
        if (selectedPosts.length === 0) return;
        setBulkAction("delete");
        setShowBulkActionModal(true);
    };

    const handleBulkPublish = () => {
        if (selectedPosts.length === 0) return;
        setBulkAction("publish");
        setShowBulkActionModal(true);
    };

    const handleBulkDraft = () => {
        if (selectedPosts.length === 0) return;
        setBulkAction("draft");
        setShowBulkActionModal(true);
    };

    const handleBulkCornerstone = () => {
        if (selectedPosts.length === 0) return;
        setBulkAction("cornerstone");
        setShowBulkActionModal(true);
    };

    const handleBulkNotCornerstone = () => {
        if (selectedPosts.length === 0) return;
        setBulkAction("not-cornerstone");
        setShowBulkActionModal(true);
    };

    const confirmBulkAction = async () => {
        if (!bulkAction) return;

        let endpoint = "";
        let method = "PATCH";

        switch (bulkAction) {
            case "delete":
                endpoint = "bulk-delete";
                method = "DELETE";
                break;
            case "publish":
                endpoint = "bulk-publish";
                break;
            case "draft":
                endpoint = "bulk-draft";
                break;
            case "cornerstone":
                endpoint = "bulk-cornerstone";
                break;
            case "not-cornerstone":
                endpoint = "bulk-not-cornerstone";
                break;
            default:
                return;
        }

        try {
            const res = await fetchWithCSRF(
                `${process.env.NEXT_PUBLIC_API_URL}/api/blog/posts/${endpoint}`,
                {
                    method,
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({post_ids: selectedPosts}),
                },
            );

            if (res.ok) {
                setSelectedPosts([]);
                setAllItemsSelected(false);
                mutate();
            } else {
                console.error(`Error performing bulk ${bulkAction}`);
            }
        } catch (error) {
            console.error(`Error performing bulk ${bulkAction}`, error);
        }

        setShowBulkActionModal(false);
        setBulkAction(null);
    };

    // ----- Existing Bulk Category Modal State & Handlers -----
    const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
    const [bulkCategoryAction, setBulkCategoryAction] = useState<
        "add" | "remove" | null
    >(null);
    const [bulkCategory, setBulkCategory] = useState<string>("");

    const handleBulkAddCategory = async () => {
        setBulkCategoryAction("add");
        setBulkCategory(""); // reset selection
        setShowBulkCategoryModal(true);
    };

    const handleBulkRemoveCategory = async () => {
        setBulkCategoryAction("remove");
        setBulkCategory("");
        setShowBulkCategoryModal(true);
    };

    const handleBulkCategoryConfirm = async () => {
        if (
            !bulkCategory ||
            selectedPosts.length === 0 ||
            !bulkCategoryAction
        ) {
            return;
        }
        try {
            const endpoint =
                bulkCategoryAction === "add"
                    ? "bulk-add-category"
                    : "bulk-remove-category";
            const res = await fetchWithCSRF(
                `${process.env.NEXT_PUBLIC_API_URL}/api/blog/posts/${endpoint}`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        post_ids: selectedPosts,
                        category_id: bulkCategory,
                    }),
                },
            );
            if (res.ok) {
                setSelectedPosts([]);
                setAllItemsSelected(false);
                mutate();
            } else {
                console.error(
                    `Error performing bulk ${bulkCategoryAction} category`,
                );
            }
        } catch (error) {
            console.error(
                `Error performing bulk ${bulkCategoryAction} category`,
                error,
            );
        }
        setShowBulkCategoryModal(false);
    };

    // ----- Existing Bulk Tag Modal State & Handlers -----
    const [showBulkTagModal, setShowBulkTagModal] = useState(false);
    const [bulkTagAction, setBulkTagAction] = useState<"add" | "remove" | null>(
        null,
    );
    const [bulkTags, setBulkTags] = useState<string[]>([]);

    const handleBulkAddTag = async () => {
        setBulkTagAction("add");
        setBulkTags([]); // reset the multi-select state
        setShowBulkTagModal(true);
    };

    const handleBulkRemoveTag = async () => {
        setBulkTagAction("remove");
        setBulkTags([]); // reset the multi-select state
        setShowBulkTagModal(true);
    };

    const handleBulkTagConfirm = async () => {
        if (
            bulkTags.length === 0 ||
            selectedPosts.length === 0 ||
            !bulkTagAction
        ) {
            return;
        }
        try {
            const endpoint =
                bulkTagAction === "add" ? "bulk-add-tag" : "bulk-remove-tag";
            const res = await fetchWithCSRF(
                `${process.env.NEXT_PUBLIC_API_URL}/api/blog/posts/${endpoint}`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        post_ids: selectedPosts,
                        tag_ids: bulkTags, // send an array of tag IDs
                    }),
                },
            );
            if (res.ok) {
                setSelectedPosts([]);
                setAllItemsSelected(false);
                mutate();
            } else {
                console.error(`Error performing bulk ${bulkTagAction} tag`);
            }
        } catch (error) {
            console.error(`Error performing bulk ${bulkTagAction} tag`, error);
        }
        setShowBulkTagModal(false);
    };

    // ----- Handle tag filter changes via our custom MultiSelectDropdown -----
    const handleTagsChange = (selected: string[]) => {
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.delete("tags");
        selected.forEach((val) => currentParams.append("tags", val));
        router.push(`?${currentParams.toString()}`);
    };

    // ----- State to toggle filters visibility -----
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const toggleFilters = () => {
        if (showFilters) {
            updateQueryParams({category: "", author: "", tags: null});
        }
        setShowFilters(!showFilters);
    };

    const getStatusColor = (score: number): TrafficLight => {
        if (score >= 80) return "green";
        if (score >= 50) return "amber";
        return "red";
    }

    if (error) return <div>Error loading posts</div>;
    if (!data) return <div>Loading posts...</div>;

    return (
        <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="max-h-[80vh] overflow-x-auto overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="sticky top-0 z-20">
                        {/* Top Controls & Filters */}
                        <tr className="bg-gray-50 dark:bg-slate-900">
                            <th colSpan={12} className="py-4">
                                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="sticky left-0 text-left">
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            Posts
                                        </h1>
                                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                            A list of your posts with inline
                                            editing, filtering, sorting and
                                            pagination.
                                        </p>
                                    </div>
                                    <div className="sticky right-0 mt-4 flex items-center space-x-4 sm:mt-0">
                                        {/* Bulk Actions */}
                                        {selectedPosts.length > 0 && (
                                            <div>
                                                {!allItemsSelected &&
                                                    selectAll &&
                                                    data.pagination
                                                        .total_items >
                                                        data.results.length && (
                                                        <button
                                                            className="mr-4 ml-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                                            onClick={
                                                                markAllSelected
                                                            }
                                                        >
                                                            Mark all (
                                                            {
                                                                data.pagination
                                                                    .total_items
                                                            }
                                                            ) as selected.
                                                        </button>
                                                    )}
                                                <Menu
                                                    as="div"
                                                    className="relative inline-block text-left"
                                                >
                                                    <div>
                                                        <Menu.Button className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                            Bulk Actions
                                                        </Menu.Button>
                                                    </div>
                                                    <Transition
                                                        as={Fragment}
                                                        enter="transition ease-out duration-100"
                                                        enterFrom="transform opacity-0 scale-95"
                                                        enterTo="transform opacity-100 scale-100"
                                                        leave="transition ease-in duration-75"
                                                        leaveFrom="transform opacity-100 scale-100"
                                                        leaveTo="opacity-0 scale-95"
                                                    >
                                                        <Menu.Items className="ring-opacity-5 absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white ring-1 shadow-lg ring-black focus:outline-none dark:divide-gray-700 dark:bg-gray-800">
                                                            <div className="px-1 py-1">
                                                                <Menu.Item>
                                                                    {({
                                                                        active,
                                                                    }) => (
                                                                        <button
                                                                            onClick={
                                                                                handleBulkDelete
                                                                            }
                                                                            className={`${
                                                                                active
                                                                                    ? "bg-sky-500 text-white dark:bg-sky-600"
                                                                                    : "text-gray-900 dark:text-gray-300"
                                                                            } group flex w-full items-center rounded-md px-2 py-2 text-left text-sm`}
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                                <Menu.Item>
                                                                    {({
                                                                        active,
                                                                    }) => (
                                                                        <button
                                                                            onClick={
                                                                                handleBulkPublish
                                                                            }
                                                                            className={`${
                                                                                active
                                                                                    ? "bg-sky-500 text-white dark:bg-sky-600"
                                                                                    : "text-gray-900 dark:text-gray-300"
                                                                            } group flex w-full items-center rounded-md px-2 py-2 text-left text-sm`}
                                                                        >
                                                                            Mark
                                                                            as
                                                                            published
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                                <Menu.Item>
                                                                    {({
                                                                        active,
                                                                    }) => (
                                                                        <button
                                                                            onClick={
                                                                                handleBulkDraft
                                                                            }
                                                                            className={`${
                                                                                active
                                                                                    ? "bg-sky-500 text-white dark:bg-sky-600"
                                                                                    : "text-gray-900 dark:text-gray-300"
                                                                            } group flex w-full items-center rounded-md px-2 py-2 text-left text-sm`}
                                                                        >
                                                                            Mark
                                                                            as
                                                                            draft
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                                <Menu.Item>
                                                                    {({
                                                                        active,
                                                                    }) => (
                                                                        <button
                                                                            onClick={
                                                                                handleBulkCornerstone
                                                                            }
                                                                            className={`${
                                                                                active
                                                                                    ? "bg-sky-500 text-white dark:bg-sky-600"
                                                                                    : "text-gray-900 dark:text-gray-300"
                                                                            } group flex w-full items-center rounded-md px-2 py-2 text-left text-sm`}
                                                                        >
                                                                            Mark
                                                                            as
                                                                            cornerstone
                                                                            content
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                                {/* Need opposite to maek as cornerstone */}
                                                                <Menu.Item>
                                                                    {({
                                                                        active,
                                                                    }) => (
                                                                        <button
                                                                            onClick={
                                                                                handleBulkNotCornerstone
                                                                            }
                                                                            className={`${
                                                                                active
                                                                                    ? "bg-sky-500 text-white dark:bg-sky-600"
                                                                                    : "text-gray-900 dark:text-gray-300"
                                                                            } group flex w-full items-center rounded-md px-2 py-2 text-left text-sm`}
                                                                        >
                                                                            Mark
                                                                            as
                                                                            not
                                                                            cornerstone
                                                                            content
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                                <Menu.Item>
                                                                    {({
                                                                        active,
                                                                    }) => (
                                                                        <button
                                                                            onClick={
                                                                                handleBulkAddCategory
                                                                            }
                                                                            className={`${
                                                                                active
                                                                                    ? "bg-sky-500 text-white dark:bg-sky-600"
                                                                                    : "text-gray-900 dark:text-gray-300"
                                                                            } group flex w-full items-center rounded-md px-2 py-2 text-left text-sm`}
                                                                        >
                                                                            Add
                                                                            Category
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                                <Menu.Item>
                                                                    {({
                                                                        active,
                                                                    }) => (
                                                                        <button
                                                                            onClick={
                                                                                handleBulkRemoveCategory
                                                                            }
                                                                            className={`${
                                                                                active
                                                                                    ? "bg-sky-500 text-white dark:bg-sky-600"
                                                                                    : "text-gray-900 dark:text-gray-300"
                                                                            } group flex w-full items-center rounded-md px-2 py-2 text-left text-sm`}
                                                                        >
                                                                            Remove
                                                                            Category
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                                <Menu.Item>
                                                                    {({
                                                                        active,
                                                                    }) => (
                                                                        <button
                                                                            onClick={
                                                                                handleBulkAddTag
                                                                            }
                                                                            className={`${
                                                                                active
                                                                                    ? "bg-sky-500 text-white dark:bg-sky-600"
                                                                                    : "text-gray-900 dark:text-gray-300"
                                                                            } group flex w-full items-center rounded-md px-2 py-2 text-left text-sm`}
                                                                        >
                                                                            Add
                                                                            Tag
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                                <Menu.Item>
                                                                    {({
                                                                        active,
                                                                    }) => (
                                                                        <button
                                                                            onClick={
                                                                                handleBulkRemoveTag
                                                                            }
                                                                            className={`${
                                                                                active
                                                                                    ? "bg-sky-500 text-white dark:bg-sky-600"
                                                                                    : "text-gray-900 dark:text-gray-300"
                                                                            } group flex w-full items-center rounded-md px-2 py-2 text-left text-sm`}
                                                                        >
                                                                            Remove
                                                                            Tag
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                            </div>
                                                        </Menu.Items>
                                                    </Transition>
                                                </Menu>
                                            </div>
                                        )}

                                        <select
                                            value={page_size}
                                            onChange={(e) =>
                                                updatePageSize(e.target.value)
                                            }
                                            className="rounded-md border bg-white py-2 pr-8 pl-2 text-sm text-gray-900 hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                        >
                                            <option value="10">
                                                10 per page
                                            </option>
                                            <option value="25">
                                                25 per page
                                            </option>
                                            <option value="50">
                                                50 per page
                                            </option>
                                            <option value="100">
                                                100 per page
                                            </option>
                                        </select>
                                        <button
                                            onClick={() =>
                                                router.push(
                                                    "/dashboard/posts/new",
                                                )
                                            }
                                            className="rounded-md bg-sky-300 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                                        >
                                            Add New
                                        </button>
                                        <button
                                            onClick={toggleFilters}
                                            className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
                                        >
                                            {showFilters
                                                ? "Hide Filters"
                                                : "Show Filters"}
                                        </button>
                                    </div>
                                </div>
                                {showFilters && (
                                    <div className="pb-3 font-normal">
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                            <select
                                                value={publishedFilter}
                                                onChange={(e) =>
                                                    updateQueryParams({
                                                        published:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                <option value="">
                                                    All Posts
                                                </option>
                                                {availableStatuses.map(
                                                    (status) => (
                                                        <option
                                                            key={status.id}
                                                            value={status.id}
                                                        >
                                                            {status.name}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <select
                                                value={categoryFilter}
                                                onChange={(e) =>
                                                    updateQueryParams({
                                                        category:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                <option value="">
                                                    All Categories
                                                </option>
                                                {filterCategories.map((cat) => (
                                                    <option
                                                        key={cat.id}
                                                        value={cat.id}
                                                    >
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                value={authorFilter}
                                                onChange={(e) =>
                                                    updateQueryParams({
                                                        author: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                <option value="">
                                                    All Authors
                                                </option>
                                                {filterAuthors.map((a) => (
                                                    <option
                                                        key={a.id}
                                                        value={a.id}
                                                    >
                                                        {a.full_name}
                                                    </option>
                                                ))}
                                            </select>
                                            <MultiSelectDropdown
                                                options={filterTags}
                                                selected={tagFilters}
                                                onChange={handleTagsChange}
                                            />
                                        </div>
                                    </div>
                                )}
                                {allItemsSelected && (
                                    <div className="mb-4 rounded bg-green-100 p-2 text-green-800">
                                        All {data.pagination.total_items} items
                                        are selected.
                                        <button
                                            onClick={cancelAllSelection}
                                            className="ml-2 underline"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </th>
                        </tr>
                        {/* Column Headers */}
                        <tr className="bg-gray-50 ring-1 shadow ring-black/5 dark:bg-slate-700">
                            <th className="rounded-tl-lg pl-2">
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={toggleSelectAll}
                                    className="h-6 w-6 rounded-full border-gray-300 text-sky-600 focus:ring-sky-500 dark:border-gray-700 dark:bg-gray-800 dark:checked:bg-sky-600"
                                />
                            </th>
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
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                            >
                                SEO Score
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                            >
                                Readability Score
                            </th>
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
                                className="sticky right-0 rounded-tr-lg bg-gray-50 py-3.5 pr-4 pl-3 sm:pr-6 dark:bg-slate-700"
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
                                <td className="pl-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedPosts.includes(
                                            post.id,
                                        )}
                                        onChange={() =>
                                            togglePostSelection(post.id)
                                        }
                                        className="h-6 w-6 rounded-full border-gray-300 text-sky-600 focus:ring-sky-500 dark:border-gray-700 dark:bg-gray-800 dark:checked:bg-sky-600"
                                    />
                                </td>
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
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                    {editingPostId === post.id ? (
                                        <label className="relative inline-flex cursor-pointer items-center">
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
                                            <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-sky-600 peer-focus:ring-2 peer-focus:ring-blue-300 peer-focus:outline-none dark:border-gray-600 dark:bg-gray-700" />
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
                                                    allCategories.find(
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
                                            {allCategories.map((cat) => (
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
                                                    allAuthors.find(
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
                                            {allAuthors.map((a) => (
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
                                            options={allTags}
                                            selected={
                                                editValues.tags
                                                    ? editValues.tags.map(
                                                          (tag: Tag) => tag.id,
                                                      )
                                                    : []
                                            }
                                            onChange={(selected) => {
                                                const selectedTags =
                                                    allTags.filter((tag) =>
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
                                {/* For the seo score and readability score we want a round traffic light, coloured green if score is >= 80, amber if score>= 50 else red 
                                We can use colorForStatus to generate the css based off green, amber, red. It works like this colorForStatus("green")*/}
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                    <span
                                        className={`rounded-full inline-block h-4 w-4 ${colorForStatus(
                                            getStatusColor(post.seo_score),
                                        )}`}
                                    />
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
                                    <span
                                        className={`rounded-full inline-block h-4 w-4 ${colorForStatus(
                                            getStatusColor(post.readability_score),
                                        )}`}
                                    />
                                </td>

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
                                <td className="sticky right-0 ml-2 bg-white px-3 py-4 text-right text-sm font-medium whitespace-nowrap dark:bg-slate-800">
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
                                        <>
                                            <button
                                                onClick={() =>
                                                    startEditing(post)
                                                }
                                                className="rounded bg-gray-300 px-2 py-1 text-sm font-semibold text-gray-900 hover:bg-gray-400"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    openDeleteModal(post.id)
                                                }
                                                className="ml-2 rounded bg-red-500 px-2 py-1 text-sm font-semibold text-white hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </>
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

            {/* Delete Confirmation Modal */}
            <Transition.Root show={showDeleteModal} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClose={closeDeleteModal}
                >
                    <Transition.Child
                        as={Fragment}
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
                                    Are you sure you want to delete this post?
                                    This action cannot be undone.
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

            {/* Bulk Action Confirmation Modal for delete, publish, draft & cornerstone */}
            <Transition.Root show={showBulkActionModal} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClose={() => setShowBulkActionModal(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800">
                            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Confirm Bulk{" "}
                                {bulkAction === "delete"
                                    ? "Delete"
                                    : bulkAction === "publish"
                                      ? "Publish"
                                      : bulkAction === "draft"
                                        ? "Draft"
                                        : bulkAction === "cornerstone"
                                          ? "Cornerstone"
                                          : ""}{" "}
                                Action
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                    Are you sure you want to perform the bulk{" "}
                                    {bulkAction === "delete"
                                        ? "delete"
                                        : bulkAction === "publish"
                                          ? "publish"
                                          : bulkAction === "draft"
                                            ? "draft"
                                            : bulkAction === "cornerstone"
                                              ? "cornerstone"
                                              : ""}{" "}
                                    action on the selected posts?
                                </p>
                            </div>
                            <div className="mt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                                    onClick={() =>
                                        setShowBulkActionModal(false)
                                    }
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                                    onClick={confirmBulkAction}
                                >
                                    Confirm
                                </button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </Dialog>
            </Transition.Root>

            {/* Existing Bulk Category Modal */}
            <Transition.Root show={showBulkCategoryModal} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-50 overflow-y-auto"
                    onClose={() => setShowBulkCategoryModal(false)}
                >
                    <div className="flex min-h-screen items-center justify-center px-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100"
                                >
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
                                        onChange={(e) =>
                                            setBulkCategory(e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm dark:bg-gray-700 dark:text-gray-300"
                                    >
                                        <option value="">
                                            -- Select a Category --
                                        </option>
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
                                        onClick={() =>
                                            setShowBulkCategoryModal(false)
                                        }
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                                        onClick={handleBulkCategoryConfirm}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Existing Bulk Tag Modal */}
            <Transition.Root show={showBulkTagModal} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-50 overflow-y-auto"
                    onClose={() => setShowBulkTagModal(false)}
                >
                    <div className="flex min-h-screen items-center justify-center px-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100"
                                >
                                    {bulkTagAction === "add"
                                        ? "Add Tags to Selected Posts"
                                        : "Remove Tags from Selected Posts"}
                                </Dialog.Title>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Select Tags:
                                    </label>
                                    <MultiSelectDropdown
                                        options={allTags}
                                        selected={bulkTags}
                                        onChange={setBulkTags}
                                    />
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                                        onClick={() =>
                                            setShowBulkTagModal(false)
                                        }
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                                        onClick={handleBulkTagConfirm}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
};

export default PostsPage;
