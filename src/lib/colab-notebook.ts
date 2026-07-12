import type { ExportFormat } from "@/lib/export-builder";

const NOTEBOOK = {
  nbformat: 4,
  nbformat_minor: 5,
  metadata: {
    kernelspec: {
      display_name: "Python 3",
      language: "python",
      name: "python3",
    },
    language_info: { name: "python", version: "3.10.0" },
  },
  cells: [] as Record<string, unknown>[],
};

function md(source: string) {
  return { cell_type: "markdown", metadata: {}, source: source.split("\n") };
}

function code(source: string) {
  return {
    cell_type: "code",
    metadata: {},
    execution_count: null,
    outputs: [],
    source: source.split("\n"),
  };
}

export interface ColabScope {
  fileId?: string;
  batchId?: string;
  format?: ExportFormat;
}

function downloadInstructions(baseUrl: string, scope: ColabScope) {
  const format = scope.format ?? "JSON";

  if (scope.fileId) {
    return {
      description: "This notebook downloads **one cleaned file** from DataForge.",
      request: [
        "res = requests.post(",
        "    f'{BASE_URL}/api/download',",
        "    headers=headers,",
        "    json={'format': '" + format + "', 'fileId': '" + scope.fileId + "'},",
        "    timeout=120,",
        ")",
      ].join("\n"),
      filename: "dataforge-file-export.zip",
    };
  }

  if (scope.batchId) {
    return {
      description: "This notebook downloads **one project batch** from DataForge.",
      request: [
        "res = requests.post(",
        "    f'{BASE_URL}/api/export',",
        "    headers=headers,",
        "    json={'batchId': '" + scope.batchId + "', 'format': '" + format + "'},",
        "    timeout=120,",
        ")",
      ].join("\n"),
      filename: "dataforge-batch-export.zip",
    };
  }

  return {
    description: "This notebook downloads **all cleaned files** in your workspace.",
    request: [
      "res = requests.post(",
      "    f'{BASE_URL}/api/download',",
      "    headers=headers,",
      "    json={'format': '" + format + "'},",
      "    timeout=120,",
      ")",
    ].join("\n"),
    filename: "dataforge-export.zip",
  };
}

export function buildColabNotebook(baseUrl: string, scope: ColabScope = {}) {
  const instructions = downloadInstructions(baseUrl, scope);
  const nb = structuredClone(NOTEBOOK);

  nb.cells = [
    md(
      [
        "# Import a DataForge cleaned dataset",
        "",
        instructions.description,
        "Create an API key under **Settings → API Keys** in the DataForge dashboard.",
      ].join("\n")
    ),
    code(
      [
        "import getpass",
        "import json",
        "import requests",
        "",
        `BASE_URL = "${baseUrl}"`,
        "API_KEY = getpass.getpass('DataForge API key (dfk_...): ')",
        "headers = {'Authorization': f'Bearer {API_KEY}'}",
      ].join("\n")
    ),
    code(
      [
        instructions.request,
        "res.raise_for_status()",
        `open('${instructions.filename}', 'wb').write(res.content)`,
        `print(f"Downloaded {len(res.content):,} bytes → ${instructions.filename}")`,
      ].join("\n")
    ),
    code(
      [
        "import zipfile",
        `with zipfile.ZipFile('${instructions.filename}') as z:`,
        "    print('Files in export:', z.namelist())",
        "    if 'datacard.json' in z.namelist():",
        "        card = json.loads(z.read('datacard.json'))",
        "        print(f\"Files: {card['totalFiles']} · Avg score: {card['avgConfidenceScore']:.0%}\")",
      ].join("\n")
    ),
    md(["## Push to Kaggle from Colab", "", "Set Kaggle secrets then run the cell below."].join("\n")),
    code(
      [
        "import os",
        "from google.colab import userdata",
        "",
        "try:",
        "    os.environ['KAGGLE_USERNAME'] = userdata.get('KAGGLE_USERNAME')",
        "    os.environ['KAGGLE_KEY'] = userdata.get('KAGGLE_KEY')",
        "except Exception:",
        "    print('Add KAGGLE_USERNAME and KAGGLE_KEY in Colab secrets.')",
        "else:",
        "    !pip -q install kaggle",
        "    !unzip -o dataforge*.zip -d dataforge_export",
        "    !kaggle datasets init -p dataforge_export",
        "    print('Edit dataset-metadata.json, then: kaggle datasets create -p dataforge_export')",
      ].join("\n")
    ),
    md(["## Push to GitHub from Colab", "", "Upload the ZIP to a release with the GitHub CLI."].join("\n")),
    code(
      [
        "# !pip -q install ghapi",
        "# Replace owner/repo and tag, then upload:",
        `# !gh release create dataforge-export --repo owner/repo --title 'DataForge export' ${instructions.filename}`,
      ].join("\n")
    ),
  ];

  return JSON.stringify(nb, null, 2);
}
