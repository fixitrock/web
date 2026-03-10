export interface ChangelogEntry {
    id: string
    version: string
    date: string
    title: string
    description: string
    type: 'feature' | 'improvement' | 'bugfix' | 'security' | 'breaking' | 'documentation'
    author: {
        name: string
        avatar: string
        role: string
    }
    changes: string[]
    tags: string[]
    pullRequest: string
}

export interface ChangelogVersion {
    version: string
    date: string
    summary: string
    entries: ChangelogEntry[]
}

export interface ChangelogData {
    versions: ChangelogVersion[]
}

export const changelogData: ChangelogData = {
    versions: [
        {
            version: '0.1.5',
            date: '2025-08-21',
            summary: 'ESLint fixes and code quality improvements',
            entries: [
                {
                    id: 'auto-1730000000000',
                    version: '0.1.5',
                    date: '2025-08-21',
                    title: 'Auto-generated update for 0.1.5',
                    description:
                        'Fixed all ESLint errors in auto-changelog script and improved code quality',
                    type: 'improvement',
                    author: {
                        name: 'Rock ❤️ Star',
                        avatar: '/icons/fixitrock.png',
                        role: 'Lead Developer',
                    },
                    changes: [
                        'Fixed all ESLint errors in auto-changelog script',
                        'Added proper ESLint disable comments for console statements',
                        'Removed unused variables and parameters',
                        'Improved code quality and maintainability',
                        'Updated version and changelog system',
                        'Enhanced error handling in changelog script',
                    ],
                    tags: ['ESLint', 'Code Quality', 'Auto-generated', 'Maintenance'],
                    pullRequest: '#5',
                },
            ],
        },
        {
            version: '0.1.3',
            date: '2025-08-21',
            summary: 'Package version update and changelog enhancements',
            entries: [
                {
                    id: 'package-version-update',
                    version: '0.1.3',
                    date: '2025-08-21',
                    title: 'Package Version Update & Changelog Enhancements',
                    description:
                        'Updated package version to 0.1.3 and enhanced changelog page with detailed version history and UI improvements',
                    type: 'improvement',
                    author: {
                        name: 'Rock ❤️ Star',
                        avatar: '/icons/fixitrock.png',
                        role: 'Lead Developer',
                    },
                    changes: [
                        'Updated package version to 0.1.3',
                        'Enhanced changelog page with detailed version history',
                        'Improved UI design and user experience',
                        'Added comprehensive version tracking',
                        'Enhanced changelog data structure',
                        'Improved timeline visualization',
                        'Added better change categorization',
                    ],
                    tags: ['Version Update', 'UI Improvements', 'Changelog', 'Enhancement'],
                    pullRequest: '#4',
                },
            ],
        },
        {
            version: '0.1.2',
            date: '2025-08-21',
            summary: 'Changelog system implementation and UI improvements',
            entries: [
                {
                    id: 'changelog-system',
                    version: '0.1.2',
                    date: '2025-08-21',
                    title: 'Changelog System',
                    description:
                        'Complete changelog system implementation with beautiful timeline design',
                    type: 'feature',
                    author: {
                        name: 'Rock ❤️ Star',
                        avatar: '/icons/fixitrock.png',
                        role: 'Lead Developer',
                    },
                    changes: [
                        'Created beautiful changelog page with timeline design',
                        'Added TypeScript interfaces and data structure',
                        'Implemented utility functions for changelog management',
                        'Integrated with site navigation and footer',
                        'Added GitHub repository and WhatsApp contact links',
                        'Created comprehensive documentation',
                        'Implemented relaxed and modern UI design',
                    ],
                    tags: ['Changelog', 'Documentation', 'UI', 'Timeline'],
                    pullRequest: '#3',
                },
            ],
        },
        {
            version: '0.1.1',
            date: '2025-08-21',
            summary: 'Core platform features and project foundation',
            entries: [
                {
                    id: 'space-management',
                    version: '0.1.1',
                    date: '2025-08-21',
                    title: 'Space Management System',
                    description:
                        'Advanced file and content management system with cloud integration and download capabilities',
                    type: 'feature',
                    author: {
                        name: 'Rock ❤️ Star',
                        avatar: '/icons/fixitrock.png',
                        role: 'Lead Developer',
                    },
                    changes: [
                        'OneDrive integration for cloud storage',
                        'Advanced file organization and categorization',
                        'Real-time file synchronization',
                        'Enhanced security and access controls',
                        'Improved file preview and management',
                        'Download management system with progress tracking',
                        'File sharing and collaboration features',
                    ],
                    tags: ['Storage', 'Cloud', 'Security', 'File Management', 'Downloads'],
                    pullRequest: '#2',
                },
                {
                    id: 'mobile-content',
                    version: '0.1.1',
                    date: '2025-08-21',
                    title: 'Mobile Content & Downloads',
                    description: 'Comprehensive mobile repair tools and content management system',
                    type: 'feature',
                    author: {
                        name: 'Rock ❤️ Star',
                        avatar: '/icons/fixitrock.png',
                        role: 'Lead Developer',
                    },
                    changes: [
                        'Mobile firmware downloads and management',
                        'USB drivers and flash tools repository',
                        'FRP bypass solutions and dump files',
                        'EMMC ISP pinout documentation',
                        'Samsung MDM file repository',
                        'Windows files and utilities',
                        'Mobile apps and gaming content section',
                        'Advanced search and filtering system',
                    ],
                    tags: ['Mobile Repair', 'Firmware', 'Drivers', 'Tools', 'Downloads'],
                    pullRequest: '#1',
                },
            ],
        },
    ],
}
