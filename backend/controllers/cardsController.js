import cards from "../models/cardModel.js";
import { v4 as uuidv4} from "uuid";
import matters from "../models/matterModel.js";
const cardsControler = {
    // GET para buscar todos os cards;
    allCards: (req, res) => {
        return res.status(200).json(cards);
    },
    // GET para buscar um card por um ID;
    cardID: (req, res) => {
        const id = req.params;

        const cardIndex = cards.findIndex(card => card.id === id);
        if (cardIndex === -1) return res.status(404).json({ message: "Card not found"});

        return res.status(200).json(cards[cardIndex]);
    },
    // GET para buscar todos os cards por matéria;
    cardByMatter: (req, res) => {
        const { matterName } = req.params;

        const matterIndex = matters.findIndex(matter => matter.name === matterName);
        if (matterIndex === -1) return res.status(404).json({ message: "Matter not found"});

        return res.status(200).json(matters[matterIndex]);
    },
    // POST for create the card;
    createCard: (req, res) => {
        const { theMatter, front, back } = req.body;

        const indexMatter = matters.findIndex(matter => matter.matter === theMatter);
        if (indexMatter === -1) return res.status(404).json({ message: "Matter not found"});

        const card = {
            id: uuidv4(),
            matter: theMatter,
            front: front,
            back: back
        }

        cards.push(card);

        return res.status(201).json(card);
    },
    createCardForSubMatter: (req, res) => {
        const { dadMatter, subMatter, front, back } = req.body;

        const indexSubMatter = matters.findIndex(matter => matter.name === subMatter);
        if (indexSubMatter === -1) return res.status(404).json({ message: "Dadmatter not found"});

        const newCard = {
            id: uuidv4(),
            dadMatter: dadMatter,
            subMatter: subMatter,
            front: front,
            back: back
        }

        cards.push(newCard);

        return res.status(201).json(newCard);
    },
    updateCard: (req, res) => {
        const { id, front, back } = req.body;

        const indexCard = cards.findIndex(card => card.id === id);
        if (indexCard === -1) return res.status(404).json({ message: "Card not found"});

        if (front !== undefined || null) {
            cards[indexCard].front = front;
        }

        if (back !== undefined || null) {
            cards[indexCard].back = back;
        }

        return res.status(201).json(cards[indexCard])
    },
    // DELETE card
    deleteCard: (req, res) => {
        const { id } = req.body;

        const indexCard = cards.findIndex(card => card.id === id);
        if (indexCard === -1) return res.status(404).json({ message: "Card not found"});

        const deleted = cards.splice(indexCard, 1);

        return res.status(201).json(deleted);
    }
}

export default cardsControler;