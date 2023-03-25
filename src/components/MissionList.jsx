import { useFormik } from 'formik'
import { StrictModeDroppable as Droppable } from 'lib/StrictModeDroppable'
import { useState, useEffect } from 'react'
import { DragDropContext, Draggable } from 'react-beautiful-dnd'
import { BiPlus } from 'react-icons/bi'
import { MdEdit } from 'react-icons/md'
import { IoMdTrash } from 'react-icons/io'
import styles from 'styles/components/MissionList.module.scss'

export default function MissionList({ data }) {
	const [missions, updateMissions] = useState(data || [])

	useEffect(() => {
		const arrayIdsOrder = JSON.parse(localStorage.getItem('missionOrder'))

		if (!arrayIdsOrder && data?.length) {
			const idsOrderArray = data.map(mission => mission._id)
			localStorage.setItem('missionOrder', JSON.stringify(idsOrderArray))
		}

		let myArray
		if (arrayIdsOrder?.length && data?.length) {
			myArray = arrayIdsOrder.map(pos => {
				return data.find(el => el.id === pos)
			})

			const newItems = data.filter(el => {
				return !arrayIdsOrder.includes(el.id)
			})

			if (newItems?.length) myArray = [...newItems, ...myArray]
		}

		updateMissions(data)
	}, [data])

	// Form handler
	const formik = useFormik({
		initialValues: {
			description: '',
			completed: false,
		},
		onSubmit,
	})

	// Form submit
	async function onSubmit(values) {
		const options = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(values),
		}

		await fetch('http://localhost:3000/api/tasks/addTask', options).then(
			res => res.json
		),
			addNewMission(values.description)
	}

	// Handle order of items after drag
	function handleOnDragEnd(result) {
		if (!result?.destination) return

		const tasks = [...missions]

		const [reorderedItem] = tasks.splice(result.source.index, 1)

		tasks.splice(result.destination.index, 0, reorderedItem)

		const idsOrderArray = tasks.map(mission => mission._id)
		localStorage.setItem('missionOrder', JSON.stringify(idsOrderArray))

		updateMissions(tasks)
	}

	// CRUD
	function addNewMission(description) {
		updateMissions([...missions, { id: missions.length + 1, description }])
	}

	async function deleteMission(id) {
		// Remove from state
		const removeItem = missions.filter(mission => {
			return mission._id !== id
		})
		updateMissions(removeItem)

		// Remove from order of localStorage array
		const arrayIdsOrder = JSON.parse(localStorage.getItem('missionOrder'))

		if (arrayIdsOrder?.length) {
			const newIdsOrderArray = arrayIdsOrder.filter(num => num !== id)
			localStorage.setItem('missionOrder', JSON.stringify(newIdsOrderArray))
		}

		// Remove from DB
		const options = {
			method: 'DELETE',
			body: JSON.stringify(id),
		}

		await fetch('http://localhost:3000/api/tasks/deleteTask', options).then(
			res => res.json
		)
	}

	return (
		<>
			<section className={styles.form}>
				<form onSubmit={formik.handleSubmit}>
					<div className={styles.input_group}>
						<input
							className={styles.input}
							type="text"
							name="description"
							placeholder="New mission"
							autoComplete="off"
							{...formik.getFieldProps('description')}
						/>
						<button className={styles.button} type="submit">
							<span>
								<BiPlus size={20} />
							</span>
						</button>
					</div>
				</form>
			</section>
			<section className={styles.missionList}>
				<h4 className={styles.header}>Mission List</h4>

				<DragDropContext onDragEnd={handleOnDragEnd}>
					<Droppable droppableId="missions">
						{provided => (
							<section {...provided.droppableProps} ref={provided.innerRef}>
								{missions.map((mission, index) => {
									return (
										<Draggable key={mission._id} draggableId={mission._id} index={index}>
											{provided => (
												<article
													{...provided.draggableProps}
													{...provided.dragHandleProps}
													ref={provided.innerRef}
													className={styles.mission}
												>
													<p className={styles.details}>{mission.description}</p>
													<div className={styles.icons}>
														<button className={styles.edit_icon}>
															<MdEdit size={20} />
														</button>

														<button className={styles.delete_icon}>
															<IoMdTrash
																size={20}
																onClick={() => deleteMission(mission._id)}
															/>
														</button>
													</div>
												</article>
											)}
										</Draggable>
									)
								})}
								{provided.placeholder}
							</section>
						)}
					</Droppable>
				</DragDropContext>
			</section>
		</>
	)
}