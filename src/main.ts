import { SilverTree } from "./tree";
import * as view from "./views";

// Рассмотреть возможность удалить дерево и оставить только Map<id, meta>.
// Вместо дерева использовать структуру div.
export const tree = new SilverTree();

window.addEventListener("DOMContentLoaded", () => {
    view.showOpenSaveBlock();
    // const filepath = localStorage.getItem(FILEPATH_KEY);
    // if (!filepath) {
    //     showOpenSaveBlock();
    // } else {
    //     parseSilverFile(filepath);
    //     showApp();
    // }
});
