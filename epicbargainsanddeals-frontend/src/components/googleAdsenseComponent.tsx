import Script from "next/script";

export function GoogleAdsenseComponent() {
    return (
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2415546728741367"
            crossOrigin="anonymous"
            strategy="lazyOnload"
        />
    )
}