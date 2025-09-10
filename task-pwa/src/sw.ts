self.addEventListener('push', (event: any) => {
	const data = event.data ? event.data.json() : { title: 'Task PWA', body: 'You have a new notification' }
	event.waitUntil(
		self.registration.showNotification(data.title || 'Task PWA', {
			body: data.body || 'You have a new notification',
			icon: '/vite.svg',
			badge: '/vite.svg'
		})
	)
})

self.addEventListener('notificationclick', (event: any) => {
	event.notification.close()
	event.waitUntil(self.clients.openWindow('/'))
}) 