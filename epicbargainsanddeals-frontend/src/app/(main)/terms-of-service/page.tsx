/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

export default function TermsOfServicePage() {
    return (
        <div className="mx-auto max-w-7xl px-6 pb-6 pt-12 text-black sm:px-8 lg:px-12">
            <h1 className="mb-4 text-center text-3xl font-semibold">
                Terms of Service for Epic Bargains And Deals Ltd
            </h1>
            <p className="mb-4">
                <strong>Last updated: </strong>06/02/2024
            </p>
            <p className="mb-4">
                Welcome to <Link className="text-brand" href="/">epicbargainsanddeals.co.uk</Link>. By accessing our website,
                you are agreeing to be bound by these terms of service, all
                applicable laws and regulations, and agree that you are
                responsible for compliance with any applicable local laws. If
                you do not agree with any of these terms, you are prohibited
                from using or accessing this site.
            </p>
            <h2 className="mb-4 text-2xl font-semibold">1. Use License</h2>
            <p className="mb-4">
                Permission is granted to temporarily download one copy of the
                materials (information or software) on Epic Bargains And Deals
                Ltd's website for personal, non-commercial transitory viewing
                only. This is the grant of a license, not a transfer of title,
                and under this license, you may not:
            </p>
            <ul className="mb-4 list-inside list-disc">
                <li className="mb-2">modify or copy the materials;</li>
                <li className="mb-2">
                    use the materials for any commercial purpose, or for any
                    public display (commercial or non-commercial);
                </li>
                <li className="mb-2">
                    attempt to decompile or reverse engineer any software
                    contained on Epic Bargains And Deals Ltd's website;
                </li>
                <li className="mb-2">
                    remove any copyright or other proprietary notations from the
                    materials; or
                </li>
                <li>
                    transfer the materials to another person or "mirror" the
                    materials on any other server.
                </li>
            </ul>
            <p className="mb-4">
                This license shall automatically terminate if you violate any of
                these restrictions and may be terminated by Epic Bargains And
                Deals Ltd at any time. Upon terminating your viewing of these
                materials or upon the termination of this license, you must
                destroy any downloaded materials in your possession whether in
                electronic or printed format
            </p>
            <h2 className="mb-4 text-2xl font-semibold">2. Disclaimer</h2>
            <p className="mb-4">
                The materials on Epic Bargains And Deals Ltd's website are
                provided on an 'as is' basis. Epic Bargains And Deals Ltd makes
                no warranties, expressed or implied, and hereby disclaims and
                negates all other warranties including, without limitation,
                implied warranties or conditions of merchantability, fitness for
                a particular purpose, or non-infringement of intellectual
                property or other violation of rights.
            </p>
            <p className="mb-4">
                Further, Epic Bargains And Deals Ltd does not warrant or make
                any representations concerning the accuracy, likely results, or
                reliability of the use of the materials on its website or
                otherwise relating to such materials or on any sites linked to
                this site.
            </p>
            <h2 className="mb-4 text-2xl font-semibold">3. Limitations</h2>
            <p className="mb-4">
                In no event shall Epic Bargains And Deals Ltd or its suppliers
                be liable for any damages (including, without limitation,
                damages for loss of data or profit, or due to business
                interruption) arising out of the use or inability to use the
                materials on Epic Bargains And Deals Ltd's website, even if Epic
                Bargains And Deals Ltd or a Epic Bargains And Deals Ltd
                authorized representative has been notified orally or in writing
                of the possibility of such damage. Because some jurisdictions do
                not allow limitations on implied warranties, or limitations of
                liability for consequential or incidental damages, these
                limitations may not apply to you.
            </p>
            <h2 className="mb-4 text-2xl font-semibold">
                4. Accuracy of materials
            </h2>
            <p className="mb-4">
                The materials appearing on Epic Bargains And Deals Ltd's website
                could include technical, typographical, or photographic errors.
                Epic Bargains And Deals Ltd does not warrant that any of the
                materials on its website are accurate, complete, or current.
                Epic Bargains And Deals Ltd may make changes to the materials
                contained on its website at any time without notice. However,
                Epic Bargains And Deals Ltd does not make any commitment to
                update the materials.
            </p>
            <h2 className="mb-4 text-2xl font-semibold">5. Links</h2>
            <p className="mb-4">
                Epic Bargains And Deals Ltd has not reviewed all of the sites
                linked to its website and is not responsible for the contents of
                any such linked site. The inclusion of any link does not imply
                endorsement by Epic Bargains And Deals Ltd of the site. Use of
                any such linked website is at the user's own risk.
            </p>
            <h2 className="mb-4 text-2xl font-semibold">6. Modifications</h2>
            <p className="mb-4">
                Epic Bargains And Deals Ltd may revise these terms of service
                for its website at any time without notice. By using this
                website you are agreeing to be bound by the then current version
                of these terms of service.
            </p>
            <h2 className="mb-4 text-2xl font-semibold">7. Governing Law</h2>
            <p className="mb-4">
                These terms and conditions are governed by and construed in
                accordance with the laws of United Kingdom and you irrevocably
                submit to the exclusive jurisdiction of the courts in that State
                or location.
            </p>
            <h2 className="mb-4 text-2xl font-semibold">8. Your Privacy</h2>
            <p className="mb-4">
                Please read our{" "}
                <Link className="text-brand" href="/privacy-policy">Privacy Policy</Link>.
            </p>
            <h2 className="mb-4 text-2xl font-semibold">Company information</h2>
            <p className="mb-4">
                Epic Bargains And Deals Ltd is a company registered in England
                and Wales with the company number 15460370. Our registration and
                main place of business address is 49 Sandringham Road,
                Manchester, M28 1LX, UK. For any legal inquiries or service of
                documents, please direct your correspondence to this address.
            </p>
            <h3 className="text-1xl mb-4 font-semibold">Contact Information</h3>
            <p className="mb-4">
                If you have any questions about these Terms, please contact us
                at:
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
