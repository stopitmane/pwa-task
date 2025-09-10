export async function askNotificationPermission(): Promise<NotificationPermission> {
	if (!('Notification' in window)) throw new Error('Notifications not supported')
	const perm = await Notification.requestPermission()
	return perm
}

export async function subscribeUserToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
	if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
	const reg = await navigator.serviceWorker.ready
	const sub = await reg.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
	})
	return sub
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
	if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
	const reg = await navigator.serviceWorker.ready
	return reg.pushManager.getSubscription()
}

export function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
	const rawData = window.atob(base64)
	const outputArray = new Uint8Array(rawData.length)
	for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
	return outputArray
} 