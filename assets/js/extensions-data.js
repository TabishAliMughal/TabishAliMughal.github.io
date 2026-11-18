// VS Code extensions shown in the home page "VS Code Extensions" section (#extensions).
// ONE entry per extension - assets/js/extensions.js renders a card for each, in this order.
// Facts only: copy the description and features from the extension's Marketplace page / README.
//   id          Marketplace itemName ("<publisher>.<name>"); also the card's anchor (#ext-<id>)
//   name        display name
//   description one line
//   features    3-5 short strings
//   icon        image under assets/images/extensions/ (square; SVG or 256 px WebP)
//   marketplace Marketplace item URL (the "Install from Marketplace" button)
//   source      public repo URL, or "" when the repo is private (no Source button is shown)
window.VSCODE_PUBLISHER_URL = "https://marketplace.visualstudio.com/publishers/TabishAliMughal";
window.VSCODE_EXTENSIONS = [
    {
        id: "TabishAliMughal.Entity-SVNWorkflow",
        name: "Entity SVNWorkflow",
        description: "SVN workflows for VS Code using TortoiseSVN's svn.exe: override update/commit, blame, history and partial pull.",
        features: [
            "SVN pane with outgoing, incoming and all changes, grouped by changelist",
            "Override local or server changes, with a verified local backup you can restore",
            "Side-by-side compare that pulls a single change block",
            "Per-line blame, filterable history and per-revision diffs",
            "3-way merge editor for text, tree and property conflicts"
        ],
        icon: "assets/images/extensions/entity-svnworkflow.svg",
        marketplace: "https://marketplace.visualstudio.com/items?itemName=TabishAliMughal.Entity-SVNWorkflow",
        source: "https://github.com/TabishAliMughal/Entity-SVNWorkFlow_vscode"
    }
];
