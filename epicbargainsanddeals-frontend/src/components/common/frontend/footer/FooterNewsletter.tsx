export default async function FooterNewsletterComponent() {
    return (
        <>
            {/* Newsletter section */}
            <div className="mt-10 xl:mt-0 xl:ml-auto">
                <h3 className="text-sm font-semibold leading-6 text-gray-900">
                    Subscribe to our newsletter
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                    The latest news, articles, and resources, sent to your inbox
                    weekly.
                </p>
                <form className="mt-6 sm:flex sm:max-w-md">
                    <label htmlFor="email-address" className="sr-only">
                        Email address
                    </label>
                    <input
                        type="email"
                        name="email-address"
                        id="email-address"
                        autoComplete="email"
                        required
                        className="w-full min-w-0 appearance-none rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand sm:w-64 sm:text-sm sm:leading-6 xl:w-full"
                        placeholder="Enter your email"
                    />
                    <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                        <button
                            type="submit"
                            className="flex w-full items-center justify-center rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                            Subscribe
                        </button>
                    </div>
                </form>
            </div>
            {/* End newsletter section */}
        </>
    );
}
