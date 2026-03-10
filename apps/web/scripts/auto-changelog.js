#!/usr/bin/env bun

import fs from 'fs'
import { execSync } from 'child_process'

// Configuration
const CHANGELOG_CONFIG_FILE = 'src/config/changelog.ts'
const PACKAGE_JSON = 'package.json'
const CHANGELOG_DATA_START = 'export const changelogData: ChangelogData = {'
const CHANGELOG_DATA_END = '}'

// Track PR numbers - start from 6 since previous entries go up to #5
let nextPRNumber = 6

// Change types and their version bump rules
const CHANGE_TYPES = {
    feature: 'patch', // 0.1.2 -> 0.1.3 (increment patch)
    improvement: 'patch', // 0.1.2 -> 0.1.3 (increment patch)
    bugfix: 'patch', // 0.1.2 -> 0.1.3 (increment patch)
    security: 'patch', // 0.1.2 -> 0.1.3 (increment patch)
    breaking: 'major', // 0.1.2 -> 1.0.0 (major bump)
    documentation: 'patch', // 0.1.2 -> 0.1.3 (increment patch)
}

// Get current version from package.json - with better error handling
function getCurrentVersion() {
    try {
        const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'))

        if (!packageJson.version) {
            throw new Error('No version field found in package.json')
        }

        // eslint-disable-next-line no-console
        console.log(`🔍 Read version from package.json: ${packageJson.version}`)

        return packageJson.version
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ Error reading package.json: ${error.message}`)
        process.exit(1)
    }
}

// Get next sequential PR number
function getNextPRNumber() {
    return nextPRNumber++
}

// Bump version based on change type
function bumpVersion(version, changeType) {
    const [major, minor, patch] = version.split('.').map(Number)

    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
        throw new Error(`Invalid version format: ${version}`)
    }

    switch (CHANGE_TYPES[changeType] || 'patch') {
        case 'major':
            return `${major + 1}.0.0`
        case 'minor':
            return `${major}.${minor + 1}.0`
        case 'patch':
        default:
            return `${major}.${minor}.${patch + 1}` // This will be 0.1.2 -> 0.1.3
    }
}

// Get git changes since last commit
function getGitChanges() {
    try {
        const changes = execSync('git diff --name-only HEAD~1', { encoding: 'utf8' })

        return changes.trim().split('\n').filter(Boolean)
    } catch {
        // No previous commits found, checking all files...
        return []
    }
}

// Analyze changes and determine change type and generate meaningful description
function analyzeChanges(changes) {
    let changeTypes = [] // Array to hold multiple change types
    let entries = [] // Array to hold multiple changelog entries

    // Analyze file changes to determine type and generate meaningful content
    const fileTypes = {
        components: changes.filter(
            (f) => f.includes('components/') || f.includes('.tsx') || f.includes('.ts')
        ),
        config: changes.filter((f) => f.includes('config/') || f.includes('config.')),
        actions: changes.filter((f) => f.includes('actions/') || f.includes('actions.')),
        styles: changes.filter((f) => f.includes('styles/') || f.includes('.css')),
        scripts: changes.filter((f) => f.includes('scripts/') || f.includes('.js')),
        docs: changes.filter((f) => f.includes('docs/') || f.includes('README')),
        types: changes.filter((f) => f.includes('types/') || f.includes('.d.ts')),
        utils: changes.filter((f) => f.includes('utils/') || f.includes('lib/')),
        hooks: changes.filter((f) => f.includes('hooks/') || f.includes('use')),
        pages: changes.filter((f) => f.includes('app/') || f.includes('page.')),
    }

    // Count changes by category
    const changeCounts = Object.entries(fileTypes)
        .map(([category, files]) => ({
            category,
            count: files.length,
            files: files.slice(0, 3), // Limit to first 3 files per category
        }))
        .filter((item) => item.count > 0)

    // Generate entries for each detected change type
    if (fileTypes.scripts.length > 0 && fileTypes.scripts.some((f) => f.includes('changelog'))) {
        changeTypes.push('improvement')
        entries.push({
            changeType: 'improvement',
            title: 'Changelog System Improvements',
            description:
                'Enhanced auto-changelog generation with better change detection and meaningful descriptions',
            detectedChanges: [
                'Improved auto-changelog script functionality',
                'Enhanced change type detection and categorization',
                'Better title and description generation',
                'Fixed PR numbering consistency',
                'Added meaningful change descriptions based on file modifications',
            ],
        })
    }

    if (fileTypes.components.length > 0) {
        changeTypes.push('feature')
        entries.push({
            changeType: 'feature',
            title: 'UI Component Updates',
            description: 'Enhanced user interface components and user experience improvements',
            detectedChanges: [
                'Updated React components and UI elements',
                'Improved component functionality and styling',
                'Enhanced user interface responsiveness',
                'Added new interactive features',
            ],
        })
    }

    if (fileTypes.actions.length > 0) {
        changeTypes.push('feature')
        entries.push({
            changeType: 'feature',
            title: 'Backend Actions & API Updates',
            description: 'Enhanced server actions and API functionality improvements',
            detectedChanges: [
                'Updated server actions and API endpoints',
                'Improved data handling and validation',
                'Enhanced backend functionality',
                'Added new API features',
            ],
        })
    }

    if (fileTypes.styles.length > 0) {
        changeTypes.push('improvement')
        entries.push({
            changeType: 'improvement',
            title: 'Styling & Design Updates',
            description: 'Enhanced visual design and styling improvements',
            detectedChanges: [
                'Updated CSS styles and design system',
                'Improved visual consistency and aesthetics',
                'Enhanced responsive design',
                'Added new design elements',
            ],
        })
    }

    if (fileTypes.config.length > 0) {
        changeTypes.push('improvement')
        entries.push({
            changeType: 'improvement',
            title: 'Configuration & Settings Updates',
            description: 'Enhanced project configuration and system settings',
            detectedChanges: [
                'Updated project configuration files',
                'Improved system settings and defaults',
                'Enhanced build and deployment configs',
                'Added new configuration options',
            ],
        })
    }

    if (fileTypes.types.length > 0) {
        changeTypes.push('improvement')
        entries.push({
            changeType: 'improvement',
            title: 'Type System & Interface Updates',
            description: 'Enhanced TypeScript types and interface definitions',
            detectedChanges: [
                'Updated TypeScript type definitions',
                'Improved interface contracts',
                'Enhanced type safety and validation',
                'Added new type definitions',
            ],
        })
    }

    if (fileTypes.docs.length > 0) {
        changeTypes.push('documentation')
        entries.push({
            changeType: 'documentation',
            title: 'Documentation Updates',
            description: 'Enhanced project documentation and guides',
            detectedChanges: [
                'Updated project documentation',
                'Improved README and guides',
                'Enhanced code comments and explanations',
                'Added new documentation sections',
            ],
        })
    }

    if (fileTypes.hooks.length > 0) {
        changeTypes.push('improvement')
        entries.push({
            changeType: 'improvement',
            title: 'Custom Hooks & Utilities',
            description: 'Enhanced React hooks and utility functions',
            detectedChanges: [
                'Updated custom React hooks',
                'Improved utility functions',
                'Enhanced hook functionality',
                'Added new hook features',
            ],
        })
    }

    if (fileTypes.pages.length > 0) {
        changeTypes.push('feature')
        entries.push({
            changeType: 'feature',
            title: 'Page & Route Updates',
            description: 'Enhanced application pages and routing',
            detectedChanges: [
                'Updated application pages',
                'Improved routing and navigation',
                'Enhanced page functionality',
                'Added new page features',
            ],
        })
    }

    // If no specific types detected, add generic improvement
    if (entries.length === 0) {
        changeTypes.push('improvement')
        entries.push({
            changeType: 'improvement',
            title: 'General System Improvements',
            description: 'Various system improvements and maintenance updates',
            detectedChanges: [
                'General code improvements and optimizations',
                'Bug fixes and stability enhancements',
                'Performance optimizations',
                'Code quality improvements',
            ],
        })
    }

    // Add specific file change details to each entry
    entries.forEach((entry) => {
        if (changeCounts.length > 0) {
            const mainCategory = changeCounts[0]

            if (mainCategory.count > 0) {
                entry.detectedChanges.push(
                    `Modified ${mainCategory.count} ${mainCategory.category} files`
                )
                if (mainCategory.files.length > 0) {
                    entry.detectedChanges.push(`Key files: ${mainCategory.files.join(', ')}`)
                }
            }
        }
    })

    // Determine overall change type for version bumping (use the most significant type)
    const overallChangeType = changeTypes.includes('breaking')
        ? 'breaking'
        : changeTypes.includes('feature')
          ? 'feature'
          : changeTypes.includes('improvement')
            ? 'improvement'
            : changeTypes.includes('bugfix')
              ? 'bugfix'
              : changeTypes.includes('security')
                ? 'security'
                : changeTypes.includes('documentation')
                  ? 'documentation'
                  : 'improvement'

    return {
        changeTypes,
        overallChangeType,
        entries,
        // For backward compatibility
        changeType: overallChangeType,
        title: entries[0]?.title || 'System Updates',
        description: entries[0]?.description || 'Various system updates and improvements',
        detectedChanges: entries[0]?.detectedChanges || [],
    }
}

// Generate changelog entry
function generateChangelogEntry(changeType, changes, currentVersion, analysis) {
    const currentDate = new Date().toISOString().split('T')[0]
    const newVersion = bumpVersion(currentVersion, changeType)

    // Generate multiple entries for different change types
    const allEntries = analysis.entries.map((entryData, index) => {
        const prNumber = getNextPRNumber()

        return {
            id: `auto-${Date.now()}-${index}`,
            version: newVersion,
            date: currentDate,
            title: entryData.title,
            description: entryData.description,
            type: entryData.changeType,
            author: {
                name: 'Rock Star 💕',
                avatar: '/icons/fixitrock.png',
                role: 'Lead Developer',
            },
            changes: entryData.detectedChanges,
            tags: [
                'Auto-generated',
                'Update',
                'Maintenance',
                entryData.changeType.charAt(0).toUpperCase() + entryData.changeType.slice(1),
            ],
            pullRequest: `#${prNumber}`,
        }
    })

    // Create the main version entry with all sub-entries
    const mainEntry = {
        version: newVersion,
        date: currentDate,
        summary: `${analysis.entries.length > 1 ? 'Multiple Updates' : analysis.entries[0].title}`,
        entries: allEntries,
    }

    return { entry: mainEntry, newVersion, allEntries }
}

// Generate commit message with PR hashtag
function generateCommitMessage(newVersion, changeType, currentVersion) {
    const prNumber = getNextPRNumber()

    return `chore: bump version to ${newVersion} and update changelog

- Version bumped from ${currentVersion} to ${newVersion}
- Change type: ${changeType}
- Auto-generated changelog entry
- Updated package.json version

Closes #${prNumber}`
}

// Update changelog file - Fixed version
function updateChangelogFile(entry) {
    const changelogContent = fs.readFileSync(CHANGELOG_CONFIG_FILE, 'utf8')

    // Find the changelog data section
    const startIndex = changelogContent.indexOf(CHANGELOG_DATA_START)

    if (startIndex === -1) {
        // eslint-disable-next-line no-console
        console.error('Could not find changelog data section')

        return false
    }

    // Find the end of the changelog data
    const endIndex = changelogContent.indexOf(CHANGELOG_DATA_END, startIndex)

    if (endIndex === -1) {
        // eslint-disable-next-line no-console
        console.error('Could not find end of changelog data')

        return false
    }

    // Create the new version entry
    const newVersionEntry = `
        {
            version: '${entry.version}',
            date: '${entry.date}',
            summary: '${entry.summary}',
            entries: [
                ${entry.entries
                    .map(
                        (subEntry) => `
                    {
                        id: '${subEntry.id}',
                        version: '${subEntry.version}',
                        date: '${subEntry.date}',
                        title: '${subEntry.title}',
                        description: '${subEntry.description}',
                        type: '${subEntry.type}',
                        author: {
                            name: '${subEntry.author.name}',
                            avatar: '${subEntry.author.avatar}',
                            role: '${subEntry.author.role}',
                        },
                        changes: [
                            ${subEntry.changes.map((change) => `'${change}'`).join(',\n                            ')}
                        ],
                        tags: [${subEntry.tags.map((tag) => `'${tag}'`).join(', ')}],
                        pullRequest: '${subEntry.pullRequest}',
                    },`
                    )
                    .join('\n                ')}
            ],
        },`

    // Insert new entry at the beginning of versions array
    const updatedContent = changelogContent.replace(/versions: \[/, `versions: [${newVersionEntry}`)

    // Write the updated content
    fs.writeFileSync(CHANGELOG_CONFIG_FILE, updatedContent)

    return true
}

// Update package.json version
function updatePackageVersion(newVersion) {
    try {
        const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'))

        packageJson.version = newVersion
        fs.writeFileSync(PACKAGE_JSON, JSON.stringify(packageJson, null, 2))

        // eslint-disable-next-line no-console
        console.log(`✅ Updated package.json version to ${newVersion}`)

        // Verify the update
        const verifyPackage = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'))

        if (verifyPackage.version !== newVersion) {
            throw new Error('Failed to verify package.json version update')
        }

        return true
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ Error updating package.json: ${error.message}`)

        return false
    }
}

// Main function
function main() {
    // eslint-disable-next-line no-console
    console.log('🚀 Auto-Changelog Generator')
    // eslint-disable-next-line no-console
    console.log('============================')

    try {
        // Get current version ONCE and store it
        const currentVersion = getCurrentVersion()

        // eslint-disable-next-line no-console
        console.log(`📦 Current version: ${currentVersion}`)

        // Get git changes
        const changes = getGitChanges()

        // eslint-disable-next-line no-console
        console.log(`📝 Detected ${changes.length} changed files`)

        if (changes.length === 0) {
            // eslint-disable-next-line no-console
            console.log('✨ No changes detected, nothing to update')

            return
        }

        // Analyze changes
        const analysis = analyzeChanges(changes)

        // eslint-disable-next-line no-console
        console.log(`🔍 Overall change type: ${analysis.overallChangeType}`)
        // eslint-disable-next-line no-console
        console.log(`📝 Detected ${analysis.entries.length} change categories:`)
        analysis.entries.forEach((entry, index) => {
            // eslint-disable-next-line no-console
            console.log(`   ${index + 1}. ${entry.title} (${entry.changeType})`)
        })

        // Generate changelog entry - pass currentVersion to avoid multiple reads
        const { entry, newVersion, allEntries } = generateChangelogEntry(
            analysis.overallChangeType,
            changes,
            currentVersion,
            analysis
        )

        // eslint-disable-next-line no-console
        console.log(`🆕 New version: ${newVersion}`)
        // eslint-disable-next-line no-console
        console.log(`📋 Generated ${allEntries.length} changelog entries`)

        // Update changelog file
        if (updateChangelogFile(entry)) {
            // eslint-disable-next-line no-console
            console.log('✅ Changelog file updated successfully')
        } else {
            // eslint-disable-next-line no-console
            console.error('❌ Failed to update changelog file')

            return
        }

        // Update package.json version
        if (updatePackageVersion(newVersion)) {
            // eslint-disable-next-line no-console
            console.log('✅ Package version updated successfully')
        } else {
            // eslint-disable-next-line no-console
            console.error('❌ Failed to update package.json version')

            return
        }

        // Generate commit message - pass currentVersion to avoid multiple reads
        const commitMessage = generateCommitMessage(
            newVersion,
            analysis.overallChangeType,
            currentVersion
        )

        // eslint-disable-next-line no-console
        console.log('\n📝 Generated Commit Message:')
        // eslint-disable-next-line no-console
        console.log('============================')
        // eslint-disable-next-line no-console
        console.log(commitMessage)
        // eslint-disable-next-line no-console
        console.log('\n💡 To commit these changes, run:')
        // eslint-disable-next-line no-console
        console.log('git add .')
        // eslint-disable-next-line no-console
        console.log(`git commit -m "${commitMessage.split('\n')[0]}"`)
        // eslint-disable-next-line no-console
        console.log('git push origin main')

        // eslint-disable-next-line no-console
        console.log('\n🎉 Auto-changelog generation complete!')
        // eslint-disable-next-line no-console
        console.log(`📋 New entry added for version ${newVersion}`)
        // eslint-disable-next-line no-console
        console.log(`🔗 Check ${CHANGELOG_CONFIG_FILE} to see the changes`)

        // Final verification
        const finalVersion = getCurrentVersion()

        // eslint-disable-next-line no-console
        console.log(`🔍 Final verification - package.json version: ${finalVersion}`)
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Error:', error.message)
        process.exit(1)
    }
}

// Run if called directly
if (import.meta.main) {
    main()
}

export { main, generateChangelogEntry, updateChangelogFile, generateCommitMessage }
