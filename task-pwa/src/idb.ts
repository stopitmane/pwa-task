import { openDB, type DBSchema } from 'idb'

export interface Task {
	id: number
	title: string
	completed: boolean
	createdAt: number
}

interface TaskDB extends DBSchema {
	tasks: {
		key: number
		value: Task
		indexes: { 'by-createdAt': number; 'by-completed': boolean }
	}
}

const dbPromise = openDB<TaskDB>('task-db', 1, {
	upgrade(db) {
		const store = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true })
		store.createIndex('by-createdAt', 'createdAt')
		store.createIndex('by-completed', 'completed')
	}
})

export async function getAllTasks(): Promise<Task[]> {
	const db = await dbPromise
	const tx = db.transaction('tasks', 'readonly')
	const tasks = await tx.store.getAll()
	return tasks.sort((a, b) => b.createdAt - a.createdAt)
}

export async function createTask(title: string): Promise<Task> {
	const db = await dbPromise
	const newTask: Omit<Task, 'id'> = { title, completed: false, createdAt: Date.now() }
	const id = await db.add('tasks', newTask as Task)
	return { ...(newTask as Task), id }
}

export async function toggleTaskCompleted(id: number): Promise<Task> {
	const db = await dbPromise
	const task = await db.get('tasks', id)
	if (!task) throw new Error('Task not found')
	const updated: Task = { ...task, completed: !task.completed }
	await db.put('tasks', updated)
	return updated
}

export async function deleteTaskById(id: number): Promise<void> {
	const db = await dbPromise
	await db.delete('tasks', id)
} 