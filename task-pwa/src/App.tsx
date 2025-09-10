import { useEffect, useMemo, useState } from 'react'
import { createTask, deleteTaskById, getAllTasks, toggleTaskCompleted, type Task } from './idb'
import './App.css'
import { askNotificationPermission, getExistingSubscription, subscribeUserToPush } from './push'

const SERVER_URL = 'http://localhost:4001'

export default function App() {
	const [tasks, setTasks] = useState<Task[]>([])
	const [newTitle, setNewTitle] = useState('')
	const [loading, setLoading] = useState(true)
	const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
	const [notifPerm, setNotifPerm] = useState<NotificationPermission>(Notification.permission)
	const [hasSub, setHasSub] = useState(false)
	const [busy, setBusy] = useState(false)

	useEffect(() => {
		getAllTasks().then((items) => {
			setTasks(items)
			setLoading(false)
		})
		getExistingSubscription().then((s) => setHasSub(!!s))
	}, [])

	const visibleTasks = useMemo(() => {
		if (filter === 'active') return tasks.filter((t) => !t.completed)
		if (filter === 'completed') return tasks.filter((t) => t.completed)
		return tasks
	}, [filter, tasks])

	async function addTask() {
		if (!newTitle.trim()) return
		const created = await createTask(newTitle.trim())
		setTasks((prev) => [created, ...prev])
		setNewTitle('')
	}

	async function toggleTask(taskId: number) {
		const updated = await toggleTaskCompleted(taskId)
		setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
	}

	async function deleteTask(taskId: number) {
		await deleteTaskById(taskId)
		setTasks((prev) => prev.filter((t) => t.id !== taskId))
	}

	async function requestNotif() {
		const p = await askNotificationPermission()
		setNotifPerm(p)
	}

	async function subscribePush() {
		try {
			setBusy(true)
			const keyResp = await fetch(`${SERVER_URL}/api/vapid-public-key`)
			const { publicKey } = await keyResp.json()
			const subscription = await subscribeUserToPush(publicKey)
			if (subscription) {
				await fetch(`${SERVER_URL}/api/subscribe`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(subscription)
				})
				setHasSub(true)
			}
		} finally {
			setBusy(false)
		}
	}

	async function sendTestNotification() {
		await fetch(`${SERVER_URL}/api/notify`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title: 'Task Reminder', body: 'This is a test notification' })
		})
	}

	return (
		<div className="app">
			<header>
				<h1>Tasks</h1>
				<div>
					{notifPerm !== 'granted' ? (
						<button onClick={requestNotif}>Enable Notifications</button>
					) : hasSub ? (
						<>
							<button onClick={sendTestNotification}>Send Test</button>
							<span style={{ marginLeft: 8 }}>Subscribed</span>
						</>
					) : (
						<button onClick={subscribePush} disabled={busy}>{busy ? 'Subscribing…' : 'Subscribe'}</button>
					)}
				</div>
			</header>
			<main>
				<div className="new-task">
					<input
						type="text"
						placeholder="Add a task..."
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && addTask()}
					/>
					<button onClick={addTask}>Add</button>
				</div>

				<div className="filters">
					<button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
					<button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Active</button>
					<button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Completed</button>
				</div>

				{loading ? (
					<p>Loading…</p>
				) : (
					<ul className="task-list">
						{visibleTasks.map((task) => (
							<li key={task.id} className={task.completed ? 'completed' : ''}>
								<label>
									<input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
									<span>{task.title}</span>
								</label>
								<button className="delete" onClick={() => deleteTask(task.id)}>Delete</button>
							</li>
						))}
					</ul>
				)}
			</main>
		</div>
	)
} 