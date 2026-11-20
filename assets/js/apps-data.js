// Google Play URLs for the Entity apps - the ONLY place they are stored.
// Used by the home page "Apps & Games" cards and "Help test" block (#beta-test), and by each
// /entity/games/<slug>/ page, through assets/js/apps.js.
//
// playUrl    - Production listing. Empty = disabled "Coming soon to Google Play" badge.
//              When an app goes live, paste its URL between the quotes (one-line change), commit and push.
//              Example: playUrl: "https://play.google.com/store/apps/details?id=com.entity.sudoku.game",
// testingUrl - Closed-testing opt-in page (https://play.google.com/apps/testing/<package>).
//              Drives every .app-test-link / .app-test-help for that slug. Set it to "" when testing
//              ends: the beta buttons, the "How to join" link and the game's row in #beta-test disappear.
//              The same URL is also written into the HTML as the no-JS fallback (keep them in sync).
//
// Google Play developer page (all Entity apps). Every .play-dev-link on the site gets this href
// from assets/js/apps.js; the same URL is also written into the HTML as the no-JS fallback.
window.ENTITY_PLAY_DEVELOPER_URL = "https://play.google.com/store/apps/dev?id=8198153788316941090";
window.ENTITY_APPS = {
    "entity-arrows": {
        playUrl: "",
        testingUrl: "https://play.google.com/apps/testing/com.entity.arrows.game"
    },
    "entity-sudoku": {
        playUrl: "",
        testingUrl: "https://play.google.com/apps/testing/com.entity.sudoku.game"
    },
    "entity-tubes-game": {
        playUrl: "",
        testingUrl: "https://play.google.com/apps/testing/com.entity.tubes.game"
    },
    "entity-wordpuzzlematching": {
        playUrl: "",
        testingUrl: "https://play.google.com/apps/testing/com.entity.wordpuzzlematching.game"
    },
    "entity-wordpuzzleselecting": {
        playUrl: "",
        testingUrl: "https://play.google.com/apps/testing/com.entity.wordpuzzleselecting.game"
    },
    "entity-bricksbreaker": {
        playUrl: "",
        testingUrl: "https://play.google.com/apps/testing/com.entity.bricksbreaker.game"
    },
    "entity-bubbleshooter": {
        playUrl: "",
        testingUrl: "https://play.google.com/apps/testing/com.entity.bubbleshooter.game"
    }
};
