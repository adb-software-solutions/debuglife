export const appSettings = {
    frontend: {
        topbarColor: "light",
    },
    dashboard: {
        topbarColor: "light",
        sidenavColor: "dark",
        sidenavSize: "default",
        themeColor: "light",
    },
};

const api_url = process.env.NEXT_PUBLIC_API_URL;
const server_api_url = process.env.NEXT_PUBLIC_SERVER_API_URL;

export const debuglife_api_url = api_url;
export const debuglife_server_api_url = server_api_url;
