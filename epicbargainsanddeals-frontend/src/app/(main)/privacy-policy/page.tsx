/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <div className="mx-auto max-w-7xl px-6 pb-6 pt-12 text-black sm:px-8 lg:px-12">
            <h1 className="mb-4 text-center text-3xl font-semibold">
                Privacy Policy for Epic Bargains And Deals Ltd
            </h1>
            <p className="mb-4">
                <strong>Last updated: </strong>06/02/2024
            </p>
            <p className="mb-4">
                Welcome to Epic Bargains And Deals Ltd, accessible at
                <Link className="text-brand" href="/">
                    {" "}
                    epicbargainsanddeals.co.uk
                </Link>
                . Your privacy is critically important to us. It is Epic
                Bargains And Deals Ltd's policy to respect your privacy
                regarding any information we may collect while operating our
                website. This Privacy Policy applies to
                epicbargainsanddeals.co.uk (hereinafter, "us", "we", or
                "epicbargainsanddeals.co.uk").
            </p>
            <p className="mb-4">
                We respect your privacy and are committed to protecting
                personally identifiable information you may provide us through
                the Website. We have adopted this privacy policy ("Privacy
                Policy") to explain what information may be collected on our
                Website, how we use this information, and under what
                circumstances we may disclose the information to third parties.
            </p>
            <h2 className="mb-4 text-2xl font-semibold">
                1. Information We Collect
            </h2>
            <ul className="mb-4 list-inside list-disc">
                <li className="mb-2">
                    <strong>
                        Information that you provide that personally identifies
                        you:{" "}
                    </strong>
                    If you engage with us by signing up for our newsletter,
                    purchasing products, or participating in promotions, you
                    might provide us with personal information, such as your
                    email address.
                </li>
                <li>
                    <strong>
                        Information that does not personally identify you:{" "}
                    </strong>
                    We also collect information about your browsing history, the
                    type of device you're using, and your IP address. This
                    information is captured using cookies, Google Analytics, and
                    log files.
                </li>
            </ul>
            <h2 className="mb-4 text-2xl font-semibold">
                2. How We Use Your Information
            </h2>
            <p className="mb-4">
                We use the information we collect in various ways, including to:
            </p>
            <ul className="mb-4 list-inside list-disc">
                <li className="mb-2">To provide and maintain our service.</li>
                <li className="mb-2">
                    To notify you about changes to our service.
                </li>
                <li className="mb-2">To provide customer support.</li>
                <li className="mb-2">
                    To gather analysis or valuable information so that we can
                    improve our service.
                </li>
                <li className="mb-2">To monitor the usage of our service.</li>
                <li className="mb-2">
                    To detect, prevent, and address technical issues.
                </li>
                <li>
                    To provide you with news, special offers, and general
                    information about other goods, services, and events we
                    offer.
                </li>
            </ul>
            <h2 className="mb-4 text-2xl font-semibold">
                3. Sharing Your Personal Information
            </h2>
            <p className="mb-4">
                We do not sell, trade, or rent Users personal identification
                information to others. We may share generic aggregated
                demographic information not linked to any personal
                identification information regarding visitors and users with our
                business partners, trusted affiliates, and advertisers for the
                purposes outlined above.
            </p>
            <h2 className="mb-4 text-2xl font-semibold">
                4. Third-Party Services
            </h2>
            <p className="mb-4">
                We may employ third-party companies and individuals to
                facilitate our Service ("Service Providers"), to provide the
                Service on our behalf, to perform Service-related services, or
                to assist us in analyzing how our Service is used. These third
                parties have access to your Personal Data only to perform these
                tasks on our behalf and are obligated not to disclose or use it
                for any other purpose.
            </p>
            <p className="mb-4">
                <strong>Including but not limited to:</strong>
            </p>
            <ul className="mb-4 list-inside list-disc">
                <li className="mb-2">
                    Google Analytics: Google Analytics is a web analytics
                    service offered by Google that tracks and reports website
                    traffic. Google uses the data collected to track and monitor
                    the use of our Service. This data is shared with other Google
                    services. Google may use the collected data to contextualize
                    and personalize the ads of its advertising network.
                </li>
                <li className="mb-2">
                    Google AdSense: Google AdSense is a program run by Google
                    through which website publishers in the Google Network of
                    content sites serve text, images, video, or interactive media
                    advertisements that are targeted to the site content and
                    audience.
                </li>
                <li>
                    Mailchimp: Mailchimp is an email marketing service. This
                    service is used to send out newsletters and promotional
                    emails. Mailchimp may collect personal data such as cookies
                    and usage data.
                </li>
            </ul>
            <h2 className="mb-4 text-2xl font-semibold">
                5. Security
            </h2>
            <p className="mb-4">
                The security of your Personal Information is important to us,
                but remember that no method of transmission over the Internet,
                or method of electronic storage is 100% secure. While we strive
                to use commercially acceptable means to protect your Personal
                Information, we cannot guarantee its absolute security.
            </p>
            <h2 className="mb-4 text-2xl font-semibold">
                6. Changes to This Privacy Policy
            </h2>
            <p className="mb-4">
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page.
            </p>
            <p className="mb-4">
                You are advised to review this Privacy Policy periodically for
                any changes. Changes to this Privacy Policy are effective when
                they are posted on this page.
            </p>
            <h2 className="mb-4 text-2xl font-semibold">
                7. Contact Us
            </h2>
            <p className="mb-4">
                If you have any questions about this Privacy Policy, please
                contact us at:
            </p>
            <ul className="list-disc pl-5">
                <li>
                    Email:{" "}
                    <a
                        className="text-brand"
                        href="mailto:enquiries@epicbargainsanddeals.co.uk"
                    >
                        enquiries@epicbargainsanddeals.co.uk
                    </a>
                </li>
            </ul>
        </div>
    );
}
