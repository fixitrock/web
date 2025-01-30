import type { SVGProps } from 'react'

import React from 'react'

export function ChevronRight(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={18}
            viewBox='0 0 12 24'
            width={12}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <defs>
                <path
                    d='m7.588 12.43l-1.061 1.06L.748 7.713a.996.996 0 0 1 0-1.413L6.527.52l1.06 1.06l-5.424 5.425z'
                    fill='currentColor'
                    id='weuiArrowOutlined0'
                />
            </defs>
            <use
                fillRule='evenodd'
                href='#weuiArrowOutlined0'
                transform='rotate(-180 5.02 9.505)'
            />
        </svg>
    )
}

export function Home(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={20}
            viewBox='0 0 24 24'
            width={20}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <g
                color='currentColor'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
            >
                <path d='M15 17c-.8.622-1.85 1-3 1s-2.2-.378-3-1' />
                <path d='M2.352 13.214c-.354-2.298-.53-3.446-.096-4.465s1.398-1.715 3.325-3.108L7.021 4.6C9.418 2.867 10.617 2 12.001 2c1.382 0 2.58.867 4.978 2.6l1.44 1.041c1.927 1.393 2.89 2.09 3.325 3.108c.434 1.019.258 2.167-.095 4.464l-.301 1.96c-.5 3.256-.751 4.884-1.919 5.856S16.554 22 13.14 22h-2.28c-3.415 0-5.122 0-6.29-.971c-1.168-.972-1.418-2.6-1.918-5.857z' />
            </g>
        </svg>
    )
}

export function GridLine(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={22}
            viewBox='0 0 24 24'
            width={22}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <g fill='none' fillRule='evenodd'>
                <path d='m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z' />
                <path
                    d='M9 13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zm10 0a2 2 0 0 1 1.995 1.85L21 15v4a2 2 0 0 1-1.85 1.995L19 21h-4a2 2 0 0 1-1.995-1.85L13 19v-4a2 2 0 0 1 1.85-1.995L15 13zM9 15H5v4h4zm10 0h-4v4h4zm0-12a2 2 0 0 1 1.995 1.85L21 5v4a2 2 0 0 1-1.85 1.995L19 11h-4a2 2 0 0 1-1.995-1.85L13 9V5a2 2 0 0 1 1.85-1.995L15 3zM9 3a2 2 0 0 1 1.995 1.85L11 5v4a2 2 0 0 1-1.85 1.995L9 11H5a2 2 0 0 1-1.995-1.85L3 9V5a2 2 0 0 1 1.85-1.995L5 3zm10 2h-4v4h4zM9 5H5v4h4z'
                    fill='currentColor'
                />
            </g>
        </svg>
    )
}
export function Grid(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={24}
            viewBox='0 0 24 24'
            width={24}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M4 11h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1m10 0h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1M4 21h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1m10 0h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1'
                fill='currentColor'
            />
        </svg>
    )
}
export function GridFill(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={24}
            viewBox='0 0 24 24'
            width={24}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <g fill='none' fillRule='evenodd'>
                <path d='m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z' />
                <path
                    d='M9 13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zm10 0a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zM9 3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm10 0a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'
                    fill='currentColor'
                />
            </g>
        </svg>
    )
}
export function List(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={24}
            viewBox='0 0 24 24'
            width={24}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M4.25 4A2.25 2.25 0 0 0 2 6.25v2.5A2.25 2.25 0 0 0 4.25 11h2.5A2.25 2.25 0 0 0 9 8.75v-2.5A2.25 2.25 0 0 0 6.75 4zm7 1a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zm0 3a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5zm-7 5A2.25 2.25 0 0 0 2 15.25v2.5A2.25 2.25 0 0 0 4.25 20h2.5A2.25 2.25 0 0 0 9 17.75v-2.5A2.25 2.25 0 0 0 6.75 13zm7 1a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zm0 3a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5z'
                fill='currentColor'
            />
        </svg>
    )
}
export function ListLayout(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={20}
            viewBox='0 0 24 24'
            width={20}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <g
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
            >
                <rect height={7} rx={1} width={7} x={3} y={3} />
                <rect height={7} rx={1} width={7} x={3} y={14} />
                <path d='M14 4h7m-7 5h7m-7 6h7m-7 5h7' />
            </g>
        </svg>
    )
}

export function Gif(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={24}
            viewBox='0 0 24 24'
            width={24}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <g fill='none'>
                <path
                    d='M10.988 11.798v.781a2.8 2.8 0 0 1-.351 1.45a2.4 2.4 0 0 1-.984.931c-.44.224-.93.336-1.423.325a3.1 3.1 0 0 1-1.581-.395a2.7 2.7 0 0 1-1.054-1.133A3.75 3.75 0 0 1 5.208 12c-.006-.473.07-.943.228-1.388a2.9 2.9 0 0 1 .633-1.028c.269-.283.595-.504.957-.65c.374-.15.775-.225 1.178-.22c.343-.002.684.051 1.01.159c.297.1.576.248.825.439c.24.19.443.422.598.685c.155.27.256.57.298.878H9.557a1.4 1.4 0 0 0-.175-.404a1.1 1.1 0 0 0-.29-.298a1.2 1.2 0 0 0-.387-.194a1.7 1.7 0 0 0-.483-.035c-.31-.01-.615.073-.878.237a1.6 1.6 0 0 0-.571.712c-.15.358-.223.745-.211 1.133c-.008.388.06.773.202 1.133c.123.287.324.533.58.712c.26.17.567.256.878.246c.27.008.539-.05.782-.167a1.15 1.15 0 0 0 .518-.492c.108-.206.165-.435.167-.668H8.283v-.992zm2.462-2.882v6.211a.09.09 0 0 1-.087.088h-1.177a.08.08 0 0 1-.065-.023a.08.08 0 0 1-.023-.065v-6.21a.08.08 0 0 1 .053-.085a.1.1 0 0 1 .035-.003h1.177a.09.09 0 0 1 .088.087m1.108 6.211v-6.21a.09.09 0 0 1 .088-.088h4.146v1.115h-2.758a.09.09 0 0 0-.088.088v1.344a.1.1 0 0 0 .088.088h2.512v1.115h-2.512a.09.09 0 0 0-.088.088v2.46a.08.08 0 0 1-.088.088h-1.177a.09.09 0 0 1-.087-.009a.09.09 0 0 1-.036-.079'
                    fill='currentColor'
                />
                <path
                    d='M16.625 3.75h-9.25c-2.554 0-4.625 2.052-4.625 4.583v7.334c0 2.531 2.07 4.583 4.625 4.583h9.25c2.554 0 4.625-2.052 4.625-4.583V8.333c0-2.531-2.07-4.583-4.625-4.583'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                />
            </g>
        </svg>
    )
}

export function Office(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={32}
            viewBox='0 0 32 32'
            width={32}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <defs>
                <linearGradient
                    gradientTransform='translate(0 1720)'
                    gradientUnits='userSpaceOnUse'
                    id='vscodeIconsFileTypeWord0'
                    x1={4.494}
                    x2={13.832}
                    y1={-1712.086}
                    y2={-1695.914}
                >
                    <stop offset={0} stopColor='#2368c4' />
                    <stop offset={0.5} stopColor='#1a5dbe' />
                    <stop offset={1} stopColor='#1146ac' />
                </linearGradient>
            </defs>
            <path
                d='M28.806 3H9.705a1.19 1.19 0 0 0-1.193 1.191V9.5l11.069 3.25L30 9.5V4.191A1.19 1.19 0 0 0 28.806 3'
                fill='#41a5ee'
            />
            <path d='M30 9.5H8.512V16l11.069 1.95L30 16Z' fill='#2b7cd3' />
            <path d='M8.512 16v6.5l10.418 1.3L30 22.5V16Z' fill='#185abd' />
            <path
                d='M9.705 29h19.1A1.19 1.19 0 0 0 30 27.809V22.5H8.512v5.309A1.19 1.19 0 0 0 9.705 29'
                fill='#103f91'
            />
            <path
                d='M16.434 8.2H8.512v16.25h7.922a1.2 1.2 0 0 0 1.194-1.191V9.391A1.2 1.2 0 0 0 16.434 8.2'
                opacity={0.1}
            />
            <path
                d='M15.783 8.85H8.512V25.1h7.271a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191'
                opacity={0.2}
            />
            <path
                d='M15.783 8.85H8.512V23.8h7.271a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191'
                opacity={0.2}
            />
            <path
                d='M15.132 8.85h-6.62V23.8h6.62a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191'
                opacity={0.2}
            />
            <path
                d='M3.194 8.85h11.938a1.193 1.193 0 0 1 1.194 1.191v11.918a1.193 1.193 0 0 1-1.194 1.191H3.194A1.19 1.19 0 0 1 2 21.959V10.041A1.19 1.19 0 0 1 3.194 8.85'
                fill='url(#vscodeIconsFileTypeWord0)'
            />
            <path
                d='M6.9 17.988q.035.276.046.481h.028q.015-.195.065-.47c.05-.275.062-.338.089-.465l1.255-5.407h1.624l1.3 5.326a8 8 0 0 1 .162 1h.022a8 8 0 0 1 .135-.975l1.039-5.358h1.477l-1.824 7.748h-1.727l-1.237-5.126q-.054-.222-.122-.578t-.084-.52h-.021q-.021.189-.084.561t-.1.552L7.78 19.871H6.024L4.19 12.127h1.5l1.131 5.418a5 5 0 0 1 .079.443'
                fill='#fff'
            />
        </svg>
    )
}

export function Excel(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={32}
            viewBox='0 0 32 32'
            width={32}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <defs>
                <linearGradient
                    gradientTransform='translate(0 2100)'
                    gradientUnits='userSpaceOnUse'
                    id='vscodeIconsFileTypeExcel0'
                    x1={4.494}
                    x2={13.832}
                    y1={-2092.086}
                    y2={-2075.914}
                >
                    <stop offset={0} stopColor='#18884f' />
                    <stop offset={0.5} stopColor='#117e43' />
                    <stop offset={1} stopColor='#0b6631' />
                </linearGradient>
            </defs>
            <path
                d='M19.581 15.35L8.512 13.4v14.409A1.19 1.19 0 0 0 9.705 29h19.1A1.19 1.19 0 0 0 30 27.809V22.5Z'
                fill='#185c37'
            />
            <path
                d='M19.581 3H9.705a1.19 1.19 0 0 0-1.193 1.191V9.5L19.581 16l5.861 1.95L30 16V9.5Z'
                fill='#21a366'
            />
            <path d='M8.512 9.5h11.069V16H8.512Z' fill='#107c41' />
            <path
                d='M16.434 8.2H8.512v16.25h7.922a1.2 1.2 0 0 0 1.194-1.191V9.391A1.2 1.2 0 0 0 16.434 8.2'
                opacity={0.1}
            />
            <path
                d='M15.783 8.85H8.512V25.1h7.271a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191'
                opacity={0.2}
            />
            <path
                d='M15.783 8.85H8.512V23.8h7.271a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191'
                opacity={0.2}
            />
            <path
                d='M15.132 8.85h-6.62V23.8h6.62a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191'
                opacity={0.2}
            />
            <path
                d='M3.194 8.85h11.938a1.193 1.193 0 0 1 1.194 1.191v11.918a1.193 1.193 0 0 1-1.194 1.191H3.194A1.19 1.19 0 0 1 2 21.959V10.041A1.19 1.19 0 0 1 3.194 8.85'
                fill='url(#vscodeIconsFileTypeExcel0)'
            />
            <path
                d='m5.7 19.873l2.511-3.884l-2.3-3.862h1.847L9.013 14.6c.116.234.2.408.238.524h.017q.123-.281.26-.546l1.342-2.447h1.7l-2.359 3.84l2.419 3.905h-1.809l-1.45-2.711A2.4 2.4 0 0 1 9.2 16.8h-.024a1.7 1.7 0 0 1-.168.351l-1.493 2.722Z'
                fill='#fff'
            />
            <path d='M28.806 3h-9.225v6.5H30V4.191A1.19 1.19 0 0 0 28.806 3' fill='#33c481' />
            <path d='M19.581 16H30v6.5H19.581Z' fill='#107c41' />
        </svg>
    )
}

export function Pdf(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={32}
            viewBox='0 0 32 32'
            width={32}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path d='m24.1 2.072l5.564 5.8v22.056H8.879V30h20.856V7.945z' fill='#909090' />
            <path d='M24.031 2H8.808v27.928h20.856V7.873z' fill='#f4f4f4' />
            <path d='M8.655 3.5h-6.39v6.827h20.1V3.5z' fill='#7a7b7c' />
            <path d='M22.472 10.211H2.395V3.379h20.077z' fill='#dd2025' />
            <path
                d='M9.052 4.534H7.745v4.8h1.028V7.715L9 7.728a2 2 0 0 0 .647-.117a1.4 1.4 0 0 0 .493-.291a1.2 1.2 0 0 0 .335-.454a2.1 2.1 0 0 0 .105-.908a2.2 2.2 0 0 0-.114-.644a1.17 1.17 0 0 0-.687-.65a2 2 0 0 0-.409-.104a2 2 0 0 0-.319-.026m-.189 2.294h-.089v-1.48h.193a.57.57 0 0 1 .459.181a.92.92 0 0 1 .183.558c0 .246 0 .469-.222.626a.94.94 0 0 1-.524.114m3.671-2.306c-.111 0-.219.008-.295.011L12 4.538h-.78v4.8h.918a2.7 2.7 0 0 0 1.028-.175a1.7 1.7 0 0 0 .68-.491a1.9 1.9 0 0 0 .373-.749a3.7 3.7 0 0 0 .114-.949a4.4 4.4 0 0 0-.087-1.127a1.8 1.8 0 0 0-.4-.733a1.6 1.6 0 0 0-.535-.4a2.4 2.4 0 0 0-.549-.178a1.3 1.3 0 0 0-.228-.017m-.182 3.937h-.1V5.392h.013a1.06 1.06 0 0 1 .6.107a1.2 1.2 0 0 1 .324.4a1.3 1.3 0 0 1 .142.526c.009.22 0 .4 0 .549a3 3 0 0 1-.033.513a1.8 1.8 0 0 1-.169.5a1.1 1.1 0 0 1-.363.36a.67.67 0 0 1-.416.106m5.08-3.915H15v4.8h1.028V7.434h1.3v-.892h-1.3V5.43h1.4v-.892'
                fill='#464648'
            />
            <path
                d='M21.781 20.255s3.188-.578 3.188.511s-1.975.646-3.188-.511m-2.357.083a7.5 7.5 0 0 0-1.473.489l.4-.9c.4-.9.815-2.127.815-2.127a14 14 0 0 0 1.658 2.252a13 13 0 0 0-1.4.288Zm-1.262-6.5c0-.949.307-1.208.546-1.208s.508.115.517.939a10.8 10.8 0 0 1-.517 2.434a4.4 4.4 0 0 1-.547-2.162Zm-4.649 10.516c-.978-.585 2.051-2.386 2.6-2.444c-.003.001-1.576 3.056-2.6 2.444M25.9 20.895c-.01-.1-.1-1.207-2.07-1.16a14 14 0 0 0-2.453.173a12.5 12.5 0 0 1-2.012-2.655a11.8 11.8 0 0 0 .623-3.1c-.029-1.2-.316-1.888-1.236-1.878s-1.054.815-.933 2.013a9.3 9.3 0 0 0 .665 2.338s-.425 1.323-.987 2.639s-.946 2.006-.946 2.006a9.6 9.6 0 0 0-2.725 1.4c-.824.767-1.159 1.356-.725 1.945c.374.508 1.683.623 2.853-.91a23 23 0 0 0 1.7-2.492s1.784-.489 2.339-.623s1.226-.24 1.226-.24s1.629 1.639 3.2 1.581s1.495-.939 1.485-1.035'
                fill='#dd2025'
            />
            <path d='M23.954 2.077V7.95h5.633z' fill='#909090' />
            <path d='M24.031 2v5.873h5.633z' fill='#f4f4f4' />
            <path
                d='M8.975 4.457H7.668v4.8H8.7V7.639l.228.013a2 2 0 0 0 .647-.117a1.4 1.4 0 0 0 .493-.291a1.2 1.2 0 0 0 .332-.454a2.1 2.1 0 0 0 .105-.908a2.2 2.2 0 0 0-.114-.644a1.17 1.17 0 0 0-.687-.65a2 2 0 0 0-.411-.105a2 2 0 0 0-.319-.026m-.189 2.294h-.089v-1.48h.194a.57.57 0 0 1 .459.181a.92.92 0 0 1 .183.558c0 .246 0 .469-.222.626a.94.94 0 0 1-.524.114m3.67-2.306c-.111 0-.219.008-.295.011l-.235.006h-.78v4.8h.918a2.7 2.7 0 0 0 1.028-.175a1.7 1.7 0 0 0 .68-.491a1.9 1.9 0 0 0 .373-.749a3.7 3.7 0 0 0 .114-.949a4.4 4.4 0 0 0-.087-1.127a1.8 1.8 0 0 0-.4-.733a1.6 1.6 0 0 0-.535-.4a2.4 2.4 0 0 0-.549-.178a1.3 1.3 0 0 0-.228-.017m-.182 3.937h-.1V5.315h.013a1.06 1.06 0 0 1 .6.107a1.2 1.2 0 0 1 .324.4a1.3 1.3 0 0 1 .142.526c.009.22 0 .4 0 .549a3 3 0 0 1-.033.513a1.8 1.8 0 0 1-.169.5a1.1 1.1 0 0 1-.363.36a.67.67 0 0 1-.416.106m5.077-3.915h-2.43v4.8h1.028V7.357h1.3v-.892h-1.3V5.353h1.4v-.892'
                fill='#fff'
            />
        </svg>
    )
}

export function Music(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={48}
            viewBox='0 0 48 48'
            width={48}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <g fill='#e91e63'>
                <circle cx={19} cy={33} r={9} />
                <path d='M24 6v27h4V14l11 3v-7z' />
            </g>
        </svg>
    )
}

export function Play(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={24}
            viewBox='0 0 24 24'
            width={24}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M8 6l10 6l-10 6Z'
                fill='currentColor'
                fillOpacity={0}
                stroke='currentColor'
                strokeDasharray={40}
                strokeDashoffset={40}
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
            >
                <animate
                    attributeName='fill-opacity'
                    begin='0.5s'
                    dur='0.5s'
                    fill='freeze'
                    values='0;1'
                />
                <animate attributeName='stroke-dashoffset' dur='0.5s' fill='freeze' values='40;0' />
            </path>
        </svg>
    )
}

export function SimpleIcons7zip(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={24}
            viewBox='0 0 24 24'
            width={24}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M0 18.858h24V8.181H10.717V5.142H0ZM2.021 7.271h6.657v1.994c-1.74 2.09-2.84 4.502-2.948 7.404H3.477c.09-2.501.353-4.954 2.283-6.994l.033-.033H2.021Zm8.45 1.253h13.215v10.143H10.47Zm6.01 1.213v6.871h1.482v-6.87Zm2.755.043v6.912h1.616v-2.42h1.029c.43-.001.754-.29.969-.716c.427-.848.429-2.257-.024-3.092c-.227-.419-.571-.697-1.033-.684zm-7.924.002v1.596h2.217l-2.304 3.736v1.54h4.287V15.1h-2.698l2.786-3.909v-1.41Zm9.452 1.512h.595c.164-.006.287.081.371.217c.17.273.172.736.004.99a.36.36 0 0 1-.373.176l-.55.047z'
                fill='currentColor'
            />
        </svg>
    )
}

export function Mdx(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={212}
            viewBox='0 0 512 212'
            width={512}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M19.478 2.783h473.044c9.22 0 16.695 7.475 16.695 16.695V192c0 9.22-7.475 16.696-16.695 16.696H19.478c-9.22 0-16.695-7.475-16.695-16.696V19.478c0-9.22 7.475-16.695 16.695-16.695'
                fill='#fff'
            />
            <path
                d='M19.478 0h473.044C503.279 0 512 8.72 512 19.478V192c0 10.758-8.72 19.478-19.478 19.478H19.478C8.721 211.478 0 202.758 0 192V19.478C0 8.721 8.72 0 19.478 0m0 5.565c-7.684 0-13.913 6.23-13.913 13.913V192c0 7.684 6.23 13.913 13.913 13.913h473.044c7.684 0 13.913-6.229 13.913-13.913V19.478c0-7.684-6.23-13.913-13.913-13.913z'
                fill='#eaeaea'
            />
            <path d='m272.696 40.203l-.002 84.896l31.185-31.178l15.74 15.741l-57.642 57.638l-58.369-58.369l15.741-15.741l31.085 31.085l.001-84.072zM72.162 162.979V97.232l40.255 40.257l40.56-40.557v65.383h22.261V43.192l-62.82 62.816l-62.517-62.521v119.492z' />
            <path
                d='m447.847 36.651l15.74 15.741l-47.149 47.147l45.699 45.701l-15.741 15.741l-45.7-45.699l-45.701 45.699l-15.74-15.741l45.695-45.701l-47.146-47.147l15.74-15.741l47.152 47.146z'
                fill='#f9ac00'
            />
        </svg>
    )
}

export function Folder(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={32}
            viewBox='0 0 32 32'
            width={32}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <g fill='none'>
                <path
                    d='M16.833 10H25c1.149 0 2 .851 2 2v1L14 23.5L2.61 28.23C2.22 27.63 2 26.774 2 26V8.08A2.08 2.08 0 0 1 4.08 6h6.675c.809 0 1.585.32 2.158.89l2.453 2.498c.39.387.918.612 1.467.612'
                    fill='#ffb02e'
                />
                <path
                    d='M27.911 13H10.886a3.68 3.68 0 0 0-3.463 2.439C2.832 28.604 3.211 27.658 3.095 27.806a.55.55 0 0 1-.453.25a.35.35 0 0 1-.182-.054a3.78 3.78 0 0 0 3.585 2h17.952a2.03 2.03 0 0 0 1.939-1.453l3.962-12.835A2.086 2.086 0 0 0 27.911 13'
                    fill='#fcd53f'
                />
            </g>
        </svg>
    )
}

export function SortAscending(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={22}
            viewBox='0 0 24 24'
            width={22}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M4 6h9m-9 6h7m-7 6h7m4-3l3 3l3-3m-3-9v12'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
            />
        </svg>
    )
}

export function ArrowSortDown(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={16}
            viewBox='0 0 16 16'
            width={16}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M7.22 13.78a.75.75 0 0 0 1.06 0l2.75-2.75a.75.75 0 1 0-1.06-1.06L8.5 11.44V2.75a.75.75 0 0 0-1.5 0v8.69L5.53 9.97a.75.75 0 0 0-1.06 1.06z'
                fill='currentColor'
            />
        </svg>
    )
}

export function ArrowSortUp(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={16}
            viewBox='0 0 16 16'
            width={16}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M7.22 2.22a.75.75 0 0 1 1.06 0l2.75 2.75a.75.75 0 1 1-1.06 1.06L8.5 4.56v8.69a.75.75 0 0 1-1.5 0V4.56L5.53 6.03a.75.75 0 0 1-1.06-1.06z'
                fill='currentColor'
            />
        </svg>
    )
}

export function SortAZ(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={20}
            viewBox='0 0 24 24'
            width={20}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='m15.75 19l-3.25 3.25L9.25 19zm-6.86-4.7H6L5.28 17H2.91L6 7h3l3.13 10H9.67zm-2.56-1.62h2.23l-.63-2.12l-.26-.97l-.25-.96h-.03l-.22.97l-.24.98zM13.05 17v-1.26l4.75-6.77v-.06h-4.3V7h7.23v1.34L16.09 15v.08h4.71V17z'
                fill='currentColor'
            />
        </svg>
    )
}

export function SortDate(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={20}
            viewBox='0 0 24 24'
            width={20}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M21 17h3l-4 4l-4-4h3V3h2zM8 16h3v-3H8zm5-11h-1V3h-2v2H6V3H4v2H3c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h10c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2M3 18v-7h10v7z'
                fill='currentColor'
            />
        </svg>
    )
}

export function SortSize(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={20}
            viewBox='0 0 24 24'
            width={20}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <g
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
            >
                <path d='M10 3.2A9 9 0 1 0 20.8 14a1 1 0 0 0-1-1H13a2 2 0 0 1-2-2V4a.9.9 0 0 0-1-.8' />
                <path d='M15 3.5A9 9 0 0 1 20.5 9H16a1 1 0 0 1-1-1z' />
            </g>
        </svg>
    )
}

export function SortType(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={20}
            viewBox='0 0 24 24'
            width={20}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                clipRule='evenodd'
                d='M6 7c0-1.886 0-2.828.586-3.414S8.114 3 10 3h4c1.886 0 2.828 0 3.414.586S18 5.114 18 7v3h-3.172a1 1 0 0 1-.707-.293L12.293 7.88A3 3 0 0 0 10.172 7zm0 2c-.932 0-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C3 10.602 3 11.068 3 12v5.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 21 5.08 21 6.2 21h11.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C21 19.48 21 18.92 21 17.8v-2.6c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874c-.402-.205-.92-.217-1.908-.218h-3.172a3 3 0 0 1-2.12-.879l-1.83-1.828A1 1 0 0 0 10.173 9z'
                fill='currentColor'
                fillRule='evenodd'
            />
        </svg>
    )
}

export function Dots(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={18}
            viewBox='0 0 24 24'
            width={18}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0 7a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0-14a1 1 0 1 0 2 0a1 1 0 1 0-2 0'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
            />
        </svg>
    )
}

// export function Share(props: SVGProps<SVGSVGElement>) {
//     return (
//         <svg
//             height={20}
//             viewBox='0 0 24 24'
//             width={20}
//             xmlns='http://www.w3.org/2000/svg'
//             {...props}
//         >
//             <g
//                 color='currentColor'
//                 fill='none'
//                 stroke='currentColor'
//                 strokeLinecap='round'
//                 strokeLinejoin='round'
//                 strokeWidth={1.5}
//             >
//                 <path d='M11.026 3a9.028 9.028 0 0 0 1.003 18A9.03 9.03 0 0 0 21 13' />
//                 <path d='m21 6.025l-1-.002c-3.737-.01-5.605-.015-6.918.93c-.437.313-.82.695-1.135 1.131C11 9.395 11 11.264 11 15m10-8.975a.7.7 0 0 0-.175-.472C20.06 4.647 18.071 3 18.071 3M21 6.025a.7.7 0 0 1-.174.422C20.06 7.353 18.07 9 18.07 9' />
//             </g>
//         </svg>
//     )
// }

export function CopyLink(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={20}
            viewBox='0 0 24 24'
            width={20}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <g
                color='currentColor'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
            >
                <path d='M14.556 13.218a2.67 2.67 0 0 1-3.774-3.774l2.359-2.36a2.67 2.67 0 0 1 3.628-.135m-.325-3.167a2.669 2.669 0 1 1 3.774 3.774l-2.359 2.36a2.67 2.67 0 0 1-3.628.135' />
                <path d='M21 13c0 3.771 0 5.657-1.172 6.828S16.771 21 13 21h-2c-3.771 0-5.657 0-6.828-1.172S3 16.771 3 13v-2c0-3.771 0-5.657 1.172-6.828S7.229 3 11 3' />
            </g>
        </svg>
    )
}

export function Delete(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            aria-hidden='true'
            fill='none'
            focusable='false'
            height='20'
            role='presentation'
            viewBox='0 0 24 24'
            width='20'
            {...props}
        >
            <path
                d='M21.07 5.23c-1.61-.16-3.22-.28-4.84-.37v-.01l-.22-1.3c-.15-.92-.37-2.3-2.71-2.3h-2.62c-2.33 0-2.55 1.32-2.71 2.29l-.21 1.28c-.93.06-1.86.12-2.79.21l-2.04.2c-.42.04-.72.41-.68.82.04.41.4.71.82.67l2.04-.2c5.24-.52 10.52-.32 15.82.21h.08c.38 0 .71-.29.75-.68a.766.766 0 0 0-.69-.82Z'
                fill='currentColor'
            />
            <path
                d='M19.23 8.14c-.24-.25-.57-.39-.91-.39H5.68c-.34 0-.68.14-.91.39-.23.25-.36.59-.34.94l.62 10.26c.11 1.52.25 3.42 3.74 3.42h6.42c3.49 0 3.63-1.89 3.74-3.42l.62-10.25c.02-.36-.11-.7-.34-.95Z'
                fill='currentColor'
                opacity={0.399}
            />
            <path
                clipRule='evenodd'
                d='M9.58 17a.75.75 0 0 1 .75-.75h3.33a.75.75 0 0 1 0 1.5h-3.33a.75.75 0 0 1-.75-.75ZM8.75 13a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Z'
                fill='currentColor'
                fillRule='evenodd'
            />
        </svg>
    )
}

export function Rename(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={20}
            viewBox='0 0 20 20'
            width={20}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M8.5 2a.5.5 0 0 0 0 1h1v14h-1a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-1V3h1a.5.5 0 0 0 0-1zm-4 2h4v1h-4A1.5 1.5 0 0 0 3 6.5v7A1.5 1.5 0 0 0 4.5 15h4v1h-4A2.5 2.5 0 0 1 2 13.5v-7A2.5 2.5 0 0 1 4.5 4m11 11h-4v1h4a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 15.5 4h-4v1h4A1.5 1.5 0 0 1 17 6.5v7a1.5 1.5 0 0 1-1.5 1.5'
                fill='currentColor'
            />
        </svg>
    )
}

export function NewTab(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={20}
            viewBox='0 0 16 16'
            width={20}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path d='M3 1v12h12V1zm11 11H4V2h10zM2 14V3.5l-1-1V15h12.5l-1-1z' fill='currentColor' />
            <path d='M5.5 4L8 6.5l-3 3L6.5 11l3-3l2.5 2.5V4z' fill='currentColor' />
        </svg>
    )
}

export function NewWindow(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={18}
            viewBox='0 0 20 20'
            width={18}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M17 17H3V3h5V1H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5h-2z'
                fill='currentColor'
            />
            <path d='m11 1l3.3 3.3L8.6 10l1.4 1.4l5.7-5.7L19 9V1z' fill='currentColor' />
        </svg>
    )
}

export function Share(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={24}
            viewBox='0 0 24 24'
            width={24}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M12 5v8.5M15 7l-3-3l-3 3m-4 5v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
            />
        </svg>
    )
}

export function Link(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={24}
            viewBox='0 0 24 24'
            width={24}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='m9 15l6-6m-4-3l.463-.536a5 5 0 0 1 7.071 7.072L18 13m-5 5l-.397.534a5.07 5.07 0 0 1-7.127 0a4.97 4.97 0 0 1 0-7.071L6 11'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
            />
        </svg>
    )
}

export function Invoice(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={24}
            viewBox='0 0 24 24'
            width={24}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M3.25 5A2.75 2.75 0 0 1 6 2.25h10A2.75 2.75 0 0 1 18.75 5v5.5a.75.75 0 0 1-1.5 0V5c0-.69-.56-1.25-1.25-1.25H6c-.69 0-1.25.56-1.25 1.25v14.382a.25.25 0 0 0 .362.224l1-.5a1.75 1.75 0 0 1 1.832.165l.906.679a.25.25 0 0 0 .3 0l.862-.647a1.75 1.75 0 0 1 1.95-.1l.674.404a.75.75 0 1 1-.772 1.286l-.673-.404a.25.25 0 0 0-.279.014l-.862.647a1.75 1.75 0 0 1-2.1 0l-.906-.68a.25.25 0 0 0-.261-.023l-1 .5a1.75 1.75 0 0 1-2.533-1.565z'
                fill='currentColor'
            />
            <path
                d='M17.5 14.75a2.75 2.75 0 1 0 0 5.5a2.75 2.75 0 0 0 0-5.5m-4.25 2.75a4.25 4.25 0 1 1 8.5 0a4.25 4.25 0 0 1-8.5 0m6.093-1.405a.75.75 0 0 1 0 1.06l-2.28 2.28l-1.406-1.405a.75.75 0 1 1 1.06-1.06l.346.344l1.22-1.22a.75.75 0 0 1 1.06 0M6.25 7A.75.75 0 0 1 7 6.25h6.5a.75.75 0 0 1 0 1.5H7A.75.75 0 0 1 6.25 7m0 3A.75.75 0 0 1 7 9.25h8a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1-.75-.75m0 3a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1-.75-.75m0 3a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1-.75-.75'
                fill='currentColor'
            />
        </svg>
    )
}

export function Profile(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            height={24}
            viewBox='0 0 24 24'
            width={24}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <circle cx={12} cy={6} fill='currentColor' r={4} />
            <path
                d='M20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5'
                fill='currentColor'
            />
        </svg>
    )
}
