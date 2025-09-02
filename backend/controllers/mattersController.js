import { v4 as uuidv4} from "uuid";
import matters from "../models/matterModel.js";
import cards from "../models/cardModel.js";


const matterController = {
    // GET for list all matters;
    allMatters: (req, res) => {
        return res.status(200).json(matters);
    },
    // GET for search a specific matter;
    matterByName: (req, res) => {
        const { matterName } = req.params;

        const matterIndex = matters.findIndex(matter => matter.name === matterName);
        if (matterIndex === -1) return res.status(404).json({ message: "Matter not found"});

        const filterMatter = matters.filter(matter => matter.name === matterName);
        return res.status(200).json(filterMatter);
    },
    // POST for create matter
    createMatter: (req, res) => {
        const {matter} = req.body;

        const filterCards = cards.filter(matterName => matterName.matter === matter);
        const theMatter = {
            id: uuidv4(),
            matter: matter,
            cards: filterCards.length
        }

        matters.push(theMatter);

        return res.status(201).json(theMatter);
    },
    // POST for create submatter
    createSubMatter: (req, res) => {
        const { dadMatter, subMatter } = req.body;

        const indexDadMatter = matters.findIndex(matter => matter.name === dadMatter);
        if (indexDadMatter === -1) return res.status(404).json({ message: "Matter not found"});

        matters[indexDadMatter].subMatters = subMatter;

        const filterDadMatterCards = cards.filter(dad => dad.dadMatter === dadMatter);
        const newMatter = {
            id: matters[indexDadMatter].id,
            matter: matters[indexDadMatter].name,
            cards: matters[indexDadMatter].cards,
            subMatter: subMatter,
            totalCards: filterDadMatterCards.length
        }

        matters.push(newMatter);

        return res.status(201).json(newMatter);
    },
    // PUT for updateMatter;
    updateMatter: (req, res) => {
        const { idMatter, nameMatter, nameSubMatter} = req.body;

        const indexMatter = matters.findIndex(matter => matter.id === idMatter);
        if (indexMatter === -1) return res.status(404).json({ message: "Matter not found"});

        if (nameMatter !== undefined || null) {
            matters[indexMatter].name = nameMatter;
        }

        if (back !== undefined || null) {
            matters[indexMatter].subMatter = nameSubMatter;
        }

        return res.status(201).json(matters[indexMatter]);
    },
    // DELETE matter;
    deleteMatter: (req, res) => {
        const { idMatter } = req.body;

        const indexMatter = matters.findIndex(matter => matter.id === idMatter);
        if (indexMatter === -1) return res.status(404).json({ message: "Matter not found"});

        const deleted = matters.splice(indexMatter, 1);

        return res.status(201).json(deleted);
    }
}

export default matterController;