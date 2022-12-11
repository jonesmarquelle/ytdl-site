/// SVG Credit: https://www.benmvp.com/

interface SpinnerIconProps {
    className?: string
    strokeWidth?: number
}

const SpinnerIcon: React.FC<SpinnerIconProps> = (props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            color="#3f51b5"
            className={props.className}
        >
        <defs>
            <linearGradient id="spinner-secondHalf">
            <stop offset="0%" stop-opacity="0" stop-color="currentColor" />
            <stop offset="100%" stop-opacity="0.5" stop-color="currentColor" />
            </linearGradient>
            <linearGradient id="spinner-firstHalf">
            <stop offset="0%" stop-opacity="1" stop-color="currentColor" />
            <stop offset="100%" stop-opacity="0.5" stop-color="currentColor" />
            </linearGradient>
        </defs>

        <g stroke-width={props.strokeWidth ?? "8"}>
            <path stroke="url(#spinner-secondHalf)" d="M 4 100 A 96 96 0 0 1 196 100" />
            <path stroke="url(#spinner-firstHalf)" d="M 196 100 A 96 96 0 0 1 4 100" />
            <path
            stroke="currentColor"
            stroke-linecap="round"
            d="M 4 100 A 96 96 0 0 1 4 98"
            />
        </g>
        </svg>
    );
}

export default SpinnerIcon;