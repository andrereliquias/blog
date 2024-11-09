<script lang="ts">
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import CustomSection from '../../../components/CustomSection.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	let activeTab = 'take-picture';

	type apiResponse = {
		classe_predita: string;
		confianca: number;
		probabilidades: {
			Alternaria: number;
			Anthracnose: number;
			'Black Mould Rot': number;
			Healthy: number;
			'Stem end Rot': number;
		};
	};

	// Variables for 'take-picture' tab
	let videoElement: HTMLVideoElement;
	let capturedImage: string | null = $state(null);
	let videoStream: MediaStream | null = $state(null);
	let videoResult = writable<apiResponse>();
	let videoError: string | null = $state(null);
	let isLoadingVideo = $state(false);

	// Variables for 'send-image' tab
	let selectedFile: File | null = $state(null);
	let selectedImageURL: string | null = $state(null);
	let selectedResult = writable<apiResponse>();
	let selectedError: string | null = $state(null);
	let isLoadingSelected = $state(false);

	// Functions for 'take-picture' tab
	async function startCamera() {
		try {
			videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
			if (videoElement) {
				videoElement.srcObject = videoStream;
			}
		} catch (e) {
			videoError = 'Unable to access camera';
			console.error(e);
		}
	}

	function stopCamera() {
		if (videoStream) {
			const tracks = videoStream.getTracks();
			tracks.forEach((track) => track.stop());
			videoStream = null;
		}
	}

	function capturePhoto() {
		if (videoElement) {
			const canvas = document.createElement('canvas');
			canvas.width = videoElement.videoWidth;
			canvas.height = videoElement.videoHeight;
			const context = canvas.getContext('2d');
			if (context) {
				context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
				capturedImage = canvas.toDataURL('image/png');
				// Stop the camera after capturing the photo
				stopCamera();
			}
		}
	}

	// Functions for 'send-image' tab
	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			selectedFile = input.files[0];
			selectedImageURL = URL.createObjectURL(selectedFile);
		}
	}

	// Function to send image to the backend
	async function sendImage(imageData: Blob | File, type: string) {
		if (type == 'selected') {
			isLoadingSelected = true;
			selectedError = null;
			// selectedResult = null;
		} else {
			isLoadingVideo = true;
			videoError = null;
			// videoResult = null;
		}

		try {
			const formData = new FormData();
			formData.append('file', imageData);

			// Send to the SvelteKit endpoint
			const res = await fetch('/api/verify-mango-image', {
				method: 'POST',
				body: formData
			});

			if (res.ok) {
				const data = await res.json();
				console.log('data', data);
				if (type == 'selected') {
					selectedResult.update(() => data);
				} else {
					videoResult.update(() => data);
				}
			} else {
				if (type == 'selected') {
					selectedError = 'Failed to classify image';
				} else {
					videoError = 'Failed to classify image';
				}
			}
		} catch (e) {
			if (type == 'selected') {
				selectedError = 'An error occurred while sending the image';
			} else {
				videoError = 'An error occurred while sending the image';
			}

			console.error(e);
		} finally {
			if (type == 'selected') {
				isLoadingSelected = false;
			} else {
				isLoadingVideo = false;
			}
		}
	}

	// Function to handle sending captured image
	function handleSendCapturedImage() {
		if (capturedImage) {
			// Convert dataURL to Blob
			fetch(capturedImage)
				.then((res) => res.blob())
				.then((blob) => sendImage(blob, 'video'))
				.then(() => (isLoadingVideo = false));
		}
	}

	function handleResetCapturedImage() {
		capturedImage = null;
		videoResult.update((currentTexts) => {
			return {
				classe_predita: null,
				confianca: null,
				probabilidades: {
					Alternaria: null,
					Anthracnose: null,
					'Black Mould Rot': null,
					Healthy: null,
					'Stem end Rot': null
				}
			};
		});
		videoError = null;
		isLoadingVideo = false;
		startCamera();
	}

	// Function to handle sending selected file
	function handleSendSelectedFile() {
		if (selectedFile) {
			sendImage(selectedFile, 'selected');
		}
	}

	// Start and stop camera based on activeTab
	onMount(() => {
		if (activeTab === 'take-picture') {
			startCamera();
		} else {
			stopCamera();
		}
	});
	// Watch for changes to activeTab
	$effect(() => {
		if (activeTab === 'take-picture') {
			startCamera();
		} else {
			stopCamera();
		}
	});
</script>

<CustomSection>
	<div>
		<h1 class="font-bold">Mango Classifier</h1>

		<Tabs.Root class="mt-4" bind:value={activeTab}>
			<Tabs.List>
				<Tabs.Trigger value="take-picture">Take a picture</Tabs.Trigger>
				<Tabs.Trigger value="send-image">Send an image</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="take-picture">
				<div class="flex flex-col p-4">
					<div class="grid w-full gap-2">
						{#if !capturedImage}
							<video bind:this={videoElement} autoplay playsinline aria-label="Camera feed">
								<track kind="captions" srclang="en" label="English captions" />
							</video>
							<Button on:click={capturePhoto}>Capture Photo</Button>
						{:else if !$videoResult?.classe_predita}
							<img src={capturedImage} alt="Captured photo" />
							<Button on:click={handleSendCapturedImage} disabled={isLoadingVideo}
								>{isLoadingVideo ? 'Processing...' : 'Send for processing'}</Button
							>
						{:else}
							<img src={capturedImage} alt="Captured photo" />
							<Button on:click={handleResetCapturedImage} disabled={isLoadingVideo}
								>Take another picture</Button
							>
						{/if}
					</div>
					{#if videoError}
						<p>Error: {videoError}</p>
					{/if}

					{#if $videoResult && $videoResult.classe_predita}
						<div class="mt-4 space-y-2 p-2 border rounded border-blue-300">
							<p>Result: {$videoResult.classe_predita}</p>
							<div class="mt-5">
								{#each Object.keys($videoResult.probabilidades) as object}
									<p class={$videoResult.classe_predita === object ? 'font-bold' : ''}>
										{object}: {($videoResult.probabilidades[object] * 100).toPrecision(3)}%
									</p>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</Tabs.Content>

			<Tabs.Content value="send-image">
				<div class="flex flex-col p-4">
					<div class="grid w-full gap-2">
						<Input type="file" accept="image/*" on:change={handleFileChange} />
						{#if selectedImageURL}
							<img src={selectedImageURL} alt="Selected photo" />
							<Button on:click={handleSendSelectedFile} disabled={isLoadingSelected}
								>{isLoadingSelected ? 'Processing...' : 'Send for processing'}</Button
							>
						{/if}

						{#if selectedError}
							<p>Error: {selectedError}</p>
						{/if}

						{#if $selectedResult && $selectedResult.classe_predita}
							<div class="mt-4 space-y-2 p-2 border rounded border-blue-300">
								<p>Result: {$selectedResult.classe_predita}</p>
								<div class="mt-5">
									{#each Object.keys($selectedResult.probabilidades) as object}
										<p class={$selectedResult.classe_predita === object ? 'font-bold' : ''}>
											{object}: {($selectedResult.probabilidades[object] * 100).toPrecision(3)}%
										</p>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div></Tabs.Content
			>
		</Tabs.Root>
	</div>
</CustomSection>

<style>
	video {
		width: 100%;
		max-width: 400px;
	}
	img {
		width: 100%;
		max-width: 400px;
		margin-top: 10px;
	}
	button {
		margin-top: 10px;
	}
</style>
