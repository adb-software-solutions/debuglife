import React from 'react';
import { CategoryPropsType } from '@/types/categories';
import Link from 'next/link';

const CategoryButton: React.FC<{ categoryId: string }> = ({ categoryId }) => (
    <Link
      href={`/categories/${categoryId}`} // Adjust for app router usage
      className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-xs text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-brand-light w-full"
    >
      Explore
    </Link>
  );
  
  export default function CategoriesSection({ categories }: CategoryPropsType) {
    return (
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="flex flex-col items-center p-6 bg-gray-100 rounded-lg shadow-sm h-full">
                <div className="text-lg font-medium text-gray-900 mb-4">{category.category_name}</div>
                <div className="mt-auto">
                  <CategoryButton categoryId={category.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
