import cards from "./cardModel.js";
import subMatters from "./subMatterModel.js";

const matters = [
    {id: 1, matter: "Portuguese", subMatters: 0, cards: 0}
]

// the structure: 
// the true model is: {id, name, submatter: tMatter, cards: OMatter, totalCards: tMatter.length + OMatter.length}

export default matters;