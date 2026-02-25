import styles from "./style.module.css";

export default function glassBox(props:any) {
    return (
        <>
            <div className={styles.container} style={{width: props.width, height: props.height}}></div>
        </>
    );
}