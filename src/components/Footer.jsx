export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white text-center p-4 text-sm mt-auto">
            <p>
                This app uses the{' '}
                <a
                    href="https://www.themoviedb.org/"
                    className="underline text-blue-400"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    TMDB API
                </a>{' '}
                but is not endorsed or certified by TMDB.
            </p>
            <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg"
                alt="TMDB Logo"
                className="h-6 mx-auto mt-2"
            />
        </footer>
    );
}