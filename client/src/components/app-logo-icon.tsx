import { type SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M3 3h8v21l18-21h8v36h-8V18L11 39H3V3z"
                fill="currentColor"
                fillRule="nonzero"
                transform="scale(-1,1) translate(-40,0)"
            />
        </svg>
    );
}
