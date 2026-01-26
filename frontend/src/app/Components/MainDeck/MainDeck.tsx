import styles from "./style.module.css";

export default function MainDeck(props: any) {
    const idNotebook = props.notebookId;

    async function mattersByNotebook() {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matter/notebook`);

            if (!res.ok) {
                console.log("Error");
                return;
            }

            const data = await res.json();
            console.log(data);
            return data;
        } catch(err) {
            console.log("Fail database!");
        }
    }

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