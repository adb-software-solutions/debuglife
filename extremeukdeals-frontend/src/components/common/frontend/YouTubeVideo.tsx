type YouTubeVideoProps = {
    videoId: string;
    className?: string;
}

export default async function YouTubeVideo({ videoId, className }: YouTubeVideoProps) {

    const width = 940;
    const height = 528;
    const title = "YouTube Video";
    const allowFullScreen = true;
    const allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture web-share";

    return (
        <div className={`video-container aspect-w-16 aspect-h-9 ${className}`}>
            <iframe
                width={width}
                height={height}
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title}
                allowFullScreen={allowFullScreen}
                allow={allow}
                className="mx-auto"
            />
        </div>
    )
}
