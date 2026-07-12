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

export function buildColabNotebook(baseUrl: string) {
  const nb = structuredClone(NOTEBOOK);
  nb.cells = [
    md([
      "# Import a DataForge cleaned dataset",
      "",
      "This notebook pulls your latest cleaned export from DataForge using an API key.",
      "Create one under **Settings → API Keys** in the DataForge dashboard.",
    ].join("\n")),
    code([
      "import getpass",
      "import json",
      "import requests",
      "",
      `BASE_URL = "${baseUrl}"`,
      "API_KEY = getpass.getpass('DataForge API key (dfk_...): ')",
      "headers = {'Authorization': f'Bearer {API_KEY}'}",
    ].join("\n")),
    code([
      "res = requests.get(f'{BASE_URL}/api/download', headers=headers, timeout=120)",
      "res.raise_for_status()",
      "open('dataforge-export.zip', 'wb').write(res.content)",
      "print(f'Downloaded {len(res.content):,} bytes → dataforge-export.zip')",
    ].join("\n")),
    code([
      "import zipfile",
      "with zipfile.ZipFile('dataforge-export.zip') as z:",
      "    print('Files in export:', z.namelist())",
      "    if 'datacard.json' in z.namelist():",
      "        card = json.loads(z.read('datacard.json'))",
      "        print(f\"Files: {card['totalFiles']} · Avg score: {card['avgConfidenceScore']:.0%}\")",
    ].join("\n")),
    md([
      "## Optional: push to Kaggle",
      "",
      "Set `KAGGLE_USERNAME` and `KAGGLE_KEY` in Colab secrets, then run the cell below.",
    ].join("\n")),
    code([
      "import os",
      "from google.colab import userdata",
      "",
      "try:",
      "    os.environ['KAGGLE_USERNAME'] = userdata.get('KAGGLE_USERNAME')",
      "    os.environ['KAGGLE_KEY'] = userdata.get('KAGGLE_KEY')",
      "except Exception:",
      "    print('Add KAGGLE_USERNAME and KAGGLE_KEY in Colab secrets (key icon in sidebar).')",
      "else:",
      "    !pip -q install kaggle",
      "    !kaggle datasets init -p .",
      "    print('Edit dataset-metadata.json, then: kaggle datasets create -p .')",
    ].join("\n")),
    md([
      "## Optional: push to GitHub",
      "",
      "Upload `dataforge-export.zip` and `datacard.json` to a repo release, or use `gh release upload`.",
    ].join("\n")),
  ];
  return JSON.stringify(nb, null, 2);
}
