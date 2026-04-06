import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

const resources = [
  {
    kind: "llms-react-index",
    url: "https://heroui.com/react/llms.txt",
    path: ".heroui-docs/react/llms.txt",
  },
  {
    kind: "llms-react-full",
    url: "https://heroui.com/react/llms-full.txt",
    path: ".heroui-docs/react/llms-full.txt",
  },
  {
    kind: "llms-react-components",
    url: "https://heroui.com/react/llms-components.txt",
    path: ".heroui-docs/react/llms-components.txt",
  },
  {
    kind: "llms-react-patterns",
    url: "https://heroui.com/react/llms-patterns.txt",
    path: ".heroui-docs/react/llms-patterns.txt",
  },
  {
    kind: "llms-all-index",
    url: "https://heroui.com/llms.txt",
    path: ".heroui-docs/all/llms.txt",
  },
  {
    kind: "llms-all-full",
    url: "https://heroui.com/llms-full.txt",
    path: ".heroui-docs/all/llms-full.txt",
  },
  {
    kind: "llms-all-components",
    url: "https://heroui.com/llms-components.txt",
    path: ".heroui-docs/all/llms-components.txt",
  },
  {
    kind: "llms-all-patterns",
    url: "https://heroui.com/llms-patterns.txt",
    path: ".heroui-docs/all/llms-patterns.txt",
  },
  {
    kind: "claude-md-upstream",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/CLAUDE.md",
    path: ".heroui-docs/upstream/CLAUDE.md",
  },
  {
    kind: "skill-heroui-react",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-react/SKILL.md",
    path: ".heroui-docs/upstream/skills/heroui-react/SKILL.md",
  },
  {
    kind: "skill-heroui-react-license",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-react/LICENSE.txt",
    path: ".heroui-docs/upstream/skills/heroui-react/LICENSE.txt",
  },
  {
    kind: "skill-heroui-react-list-components",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-react/scripts/list_components.mjs",
    path: ".heroui-docs/upstream/skills/heroui-react/scripts/list_components.mjs",
  },
  {
    kind: "skill-heroui-react-get-component-docs",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-react/scripts/get_component_docs.mjs",
    path: ".heroui-docs/upstream/skills/heroui-react/scripts/get_component_docs.mjs",
  },
  {
    kind: "skill-heroui-react-get-source",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-react/scripts/get_source.mjs",
    path: ".heroui-docs/upstream/skills/heroui-react/scripts/get_source.mjs",
  },
  {
    kind: "skill-heroui-react-get-styles",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-react/scripts/get_styles.mjs",
    path: ".heroui-docs/upstream/skills/heroui-react/scripts/get_styles.mjs",
  },
  {
    kind: "skill-heroui-react-get-theme",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-react/scripts/get_theme.mjs",
    path: ".heroui-docs/upstream/skills/heroui-react/scripts/get_theme.mjs",
  },
  {
    kind: "skill-heroui-react-get-docs",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-react/scripts/get_docs.mjs",
    path: ".heroui-docs/upstream/skills/heroui-react/scripts/get_docs.mjs",
  },
  {
    kind: "skill-heroui-native",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-native/SKILL.md",
    path: ".heroui-docs/upstream/skills/heroui-native/SKILL.md",
  },
  {
    kind: "skill-heroui-native-license",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-native/LICENSE.txt",
    path: ".heroui-docs/upstream/skills/heroui-native/LICENSE.txt",
  },
  {
    kind: "skill-heroui-native-list-components",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-native/scripts/list_components.mjs",
    path: ".heroui-docs/upstream/skills/heroui-native/scripts/list_components.mjs",
  },
  {
    kind: "skill-heroui-native-get-component-docs",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-native/scripts/get_component_docs.mjs",
    path: ".heroui-docs/upstream/skills/heroui-native/scripts/get_component_docs.mjs",
  },
  {
    kind: "skill-heroui-native-get-theme",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-native/scripts/get_theme.mjs",
    path: ".heroui-docs/upstream/skills/heroui-native/scripts/get_theme.mjs",
  },
  {
    kind: "skill-heroui-native-get-docs",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-native/scripts/get_docs.mjs",
    path: ".heroui-docs/upstream/skills/heroui-native/scripts/get_docs.mjs",
  },
  {
    kind: "skill-heroui-migration",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-migration/SKILL.md",
    path: ".heroui-docs/upstream/skills/heroui-migration/SKILL.md",
  },
  {
    kind: "skill-heroui-migration-license",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-migration/LICENSE.txt",
    path: ".heroui-docs/upstream/skills/heroui-migration/LICENSE.txt",
  },
  {
    kind: "skill-heroui-migration-list-guides",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-migration/scripts/list_migration_guides.mjs",
    path: ".heroui-docs/upstream/skills/heroui-migration/scripts/list_migration_guides.mjs",
  },
  {
    kind: "skill-heroui-migration-guide",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-migration/scripts/get_migration_guide.mjs",
    path: ".heroui-docs/upstream/skills/heroui-migration/scripts/get_migration_guide.mjs",
  },
  {
    kind: "skill-heroui-migration-component-guides",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-migration/scripts/get_component_migration_guides.mjs",
    path: ".heroui-docs/upstream/skills/heroui-migration/scripts/get_component_migration_guides.mjs",
  },
  {
    kind: "skill-heroui-migration-hooks",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-migration/scripts/get_hooks_migration_guide.mjs",
    path: ".heroui-docs/upstream/skills/heroui-migration/scripts/get_hooks_migration_guide.mjs",
  },
  {
    kind: "skill-heroui-migration-styling",
    url: "https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-migration/scripts/get_styling_migration_guide.mjs",
    path: ".heroui-docs/upstream/skills/heroui-migration/scripts/get_styling_migration_guide.mjs",
  },
];

const fetchedAt = new Date().toISOString();
const manifest = {
  fetchedAt,
  source: "https://heroui.com",
  resources: [],
};

for (const resource of resources) {
  const response = await fetch(resource.url, {
    headers: {
      "user-agent": "station-heroui-sync",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${resource.url}: ${response.status} ${response.statusText}`);
  }

  const text = (await response.text()).replace(/\r\n/g, "\n");
  const target = resolve(repoRoot, resource.path);

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, text, "utf8");

  manifest.resources.push({
    ...resource,
    bytes: Buffer.byteLength(text, "utf8"),
  });

  console.log(`synced ${resource.path}`);
}

await mkdir(resolve(repoRoot, ".heroui-docs"), { recursive: true });
await writeFile(
  resolve(repoRoot, ".heroui-docs/manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(`Synced ${resources.length} HeroUI resources at ${fetchedAt}`);
