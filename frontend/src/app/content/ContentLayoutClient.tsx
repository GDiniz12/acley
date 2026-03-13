"use client";

import { useState } from "react";
import SideBarGlass from "../Components/SideBarGlass/sideBarGlass";
import styles from "./ContentLayout.module.css";
import { NotesProvider } from "./NotesContext";
import { NotebookProvider } from "./NotebookContext";

export default function ContentLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <NotebookProvider>
      <NotesProvider>
        <div className={styles.wrapper}>
          <SideBarGlass
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen((prev) => !prev)}
          />
          <main
            className={styles.mainContent}
            style={{
              marginLeft: sidebarOpen ? "260px" : "0px",
            }}
          >
            {children}
          </main>
        </div>
      </NotesProvider>
    </NotebookProvider>
  );
}