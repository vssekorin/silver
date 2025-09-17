import * as view from "./views";

window.addEventListener("DOMContentLoaded", () => {
    view.render(view.openSave());
    // view.showOpenSaveBlock();
    // const filepath = localStorage.getItem(FILEPATH_KEY);
    // if (!filepath) {
    //     showOpenSaveBlock();
    // } else {
    //     parseSilverFile(filepath);
    //     showApp();
    // }
});
