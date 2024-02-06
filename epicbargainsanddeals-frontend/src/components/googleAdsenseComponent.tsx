import Script from "next/script";

export function GoogleAdsenseComponent() {
    return (
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6574915306585372"
            crossOrigin="anonymous"
            strategy="lazyOnload"
        />
    )
}