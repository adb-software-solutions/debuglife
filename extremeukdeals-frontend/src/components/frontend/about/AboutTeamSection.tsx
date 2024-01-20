import TeamMemberItem from "./TeamMemberItem";

type SocialItem = {
    name: string;
    href: string;
    icon: string;
};

type PersonItem = {
    name: string;
    role: string;
    image: string;
    social: SocialItem[];
};

type teamProps = {
    team: PersonItem[];
};

export default async function AboutTeamSection({team}: teamProps) {
    return (
        <div className="bg-white py-16">
            <div className="mx-auto max-w-4xl px-6 text-center">
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Meet the SellerDesk team
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600">
                        We&apos;re a small team of two eBay sellers who are passionate about
                        helping other eBay sellers succeed.
                    </p>
                </div>


                <ul
                    role="list"
                    className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-y-10 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-2"
                >
                    {team.map((person) => (
                        <TeamMemberItem
                            key={person.name}
                            name={person.name}
                            role={person.role}
                            image={person.image}
                            social={person.social}
                        />
                    ))}
                </ul>

            </div>
        </div>
    );
}
