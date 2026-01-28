import styles from "./style.module.css";

interface MatterCardProps {
    id: number;
    name: string;
    newCards?: number;
    learningCards?: number;
    reviewCards?: number;
}

export default function MatterCard({ 
    id, 
    name, 
    newCards = 0, 
    learningCards = 0, 
    reviewCards = 0 
}: MatterCardProps) {
    
    function handleMatterClick() {
        // Futuramente: navegar para os cards desta matéria
        console.log(`Clicked on matter: ${name} (ID: ${id})`);
    }

    return (
        <div className={styles.matterCard} onClick={handleMatterClick}>
            <span className={styles.matterName}>{name}</span>
            <div className={styles.matterStats}>
                <span className={styles.statNew}>{newCards}</span>
                <span className={styles.statLearning}>{learningCards}</span>
                <span className={styles.statReview}>{reviewCards}</span>
            </div>
        </div>
    );
}