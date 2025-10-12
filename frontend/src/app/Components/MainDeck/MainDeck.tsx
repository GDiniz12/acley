import styles from "./style.module.css";

export default function MainDeck() {
    return (
        <>
            <div className={styles.container}>
                <div className={styles.top}>
                    <span><h4>Decks</h4></span>
                    <span className={styles.status}>
                        <h5>Novo</h5>
                        <h5>Aprender</h5>
                        <h5>Revisar</h5>
                    </span>
                </div>
            </div>
        </>
    );
}