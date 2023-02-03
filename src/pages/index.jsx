import LoginButton from "@/components/LoginButton"
import PrimaryGoalInput from "@/components/PrimaryGoalInput"
import styles from "@/styles/Home.module.scss"
import Head from "next/head"
import { useId } from "react"

export default function Home() {
	const goalInputId = useId()

	return (
		<>
			<Head>
				<title>Habi</title>
				<meta name="description" content="Gamified To-do List with Goal Tracking" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className={styles.layout}>
				<section className={styles.nav}>
					<div className={styles.logo}>Habi</div>
					<LoginButton />
				</section>
				<div className={styles.center}>
					<section className={styles.form}>
						<label className={styles.question} htmlFor={goalInputId}>
							What is the number one thing you want to get done today?
						</label>
						<PrimaryGoalInput id={goalInputId} />
					</section>
				</div>
			</main>
		</>
	)
}