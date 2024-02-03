type FullscreenElement = HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
};

type FullscreenDocument = Document & {
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
};

export const toggleFullScreen = (): void => {
    const doc = document.documentElement as FullscreenElement;
    const fullScreenDoc = document as FullscreenDocument;

    if (!document.fullscreenElement) {
        if (doc.requestFullscreen) {
            doc.requestFullscreen();
        } else if (doc.mozRequestFullScreen) {
            doc.mozRequestFullScreen(); // Firefox
        } else if (doc.webkitRequestFullscreen) {
            doc.webkitRequestFullscreen(); // Chrome, Safari, and Opera
        } else if (doc.msRequestFullscreen) {
            doc.msRequestFullscreen(); // IE/Edge
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (fullScreenDoc.mozCancelFullScreen) {
            fullScreenDoc.mozCancelFullScreen(); // Firefox
        } else if (fullScreenDoc.webkitExitFullscreen) {
            fullScreenDoc.webkitExitFullscreen(); // Chrome, Safari, and Opera
        } else if (fullScreenDoc.msExitFullscreen) {
            fullScreenDoc.msExitFullscreen(); // IE/Edge
        }
    }
};
