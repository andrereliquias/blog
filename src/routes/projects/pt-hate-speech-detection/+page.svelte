<script lang="ts">
	import CustomSection from '../../../components/CustomSection.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner';
	import {
		Chart,
		Bars,
		Svg,
		Axis,
		Highlight,
		Tooltip,
		Rule,
		Pie,
		Arc,
		Text,
		Group
	} from 'layerchart';
	import { format, PeriodType } from '@layerstack/utils';
	import { format as formatFns } from 'date-fns';
	import { cls } from '@layerstack/tailwind';
	import { format as formatUtil } from '@layerstack/utils';
	const keyColors = ['#ff6384', '#36a2eb']; // Cores de exemplo (vermelho e azul)
	const keyClasses = [
		{ shape: 'fill-gray-300', content: 'text-white' },
		{ shape: 'fill-slate-400', content: 'text-white' }
	];
	import { scaleBand } from 'd3-scale';

	type apiResponse = {
		text: string;
		is_hate_speech: boolean;
		confidence: number;
	};

	let isLoadingText = $state(false);
	let isLoadingProfile = $state(false);
	// let socialUsername = $state('andrwr.bsky.social');
	let socialUsername = $state('');
	let chartBarsData = $state([]);

	import * as Tabs from '$lib/components/ui/tabs';
	import { writable } from 'svelte/store';

	const textToCheck = writable<string>('');
	const checkedTexts = writable<apiResponse[]>([]);
	const checkProfile = writable<any>({});

	async function checkText(newText: string) {
		isLoadingText = true;
		if (newText) {
			try {
				const response = await fetch('/api/verify-hate-speech/text', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ text: newText })
				});

				if (response.ok) {
					const result = await response.json();
					const parsedResult: apiResponse[] = JSON.parse(result);

					checkedTexts.update((currentTexts) => [...parsedResult, ...currentTexts]);
					textToCheck.update(() => '');
				} else {
					console.error('Erro ao processar o texto:', await response.text());
				}
			} catch (error) {
				console.error('Erro na requisição:', error);
			} finally {
				isLoadingText = false;
			}
		}
		isLoadingText = false;
	}

	async function processUserProfile() {
		isLoadingProfile = true;

		if (socialUsername.trim()) {
			try {
				const response = await fetch('/api/verify-hate-speech/profile', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username: socialUsername.trim() })
				});

				if (response.ok) {
					const result = await response.json();

					chartBarsData = result.graph.byTime.map((obj) => {
						return { date: new Date(obj.date), ...obj };
					});

					checkProfile.update(() => result);
				} else {
					console.error('Erro ao processar o perfil:', await response.text());
					toast.error('Something went wrong!', {
						description: 'Username invalid or not found.'
					});
				}
			} catch (error) {
				console.error('Erro ao processar o perfil', error);
				toast.error('Something went wrong!', {
					description: 'Username invalid or not found.'
				});
			} finally {
				isLoadingProfile = false;
			}
			socialUsername = '';
		}
		isLoadingProfile = false;
	}
</script>

<CustomSection>
	<div>
		<h1 class="font-bold">Portuguese Hate Speech Detection</h1>

		<Tabs.Root class="mt-4">
			<Tabs.List>
				<Tabs.Trigger value="text-tab">Check text</Tabs.Trigger>
				<Tabs.Trigger value="social-tab">Check BlueSky Profile</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="text-tab">
				<div class="flex flex-col gap-4 p-4">
					<div class="grid w-full gap-2">
						<Textarea
							placeholder="Type your message here."
							bind:value={$textToCheck}
							disabled={isLoadingText}
						/>
						<Button on:click={() => checkText($textToCheck)} disabled={isLoadingText}>
							{#if isLoadingText}
								<span>Loading...</span>
							{:else}
								<span>Send</span>
							{/if}
						</Button>
					</div>

					<div class="mt-4 space-y-2">
						{#each $checkedTexts as object, index}
							<div
								class={'p-2 border rounded ' +
									(object.is_hate_speech ? 'border-red-300' : 'border-blue-300')}
							>
								<p class="">Text: {object.text}</p>
								<p class="">
									Result: {object.is_hate_speech ? "It's hate speech" : "It's not hate speech"}
								</p>
								<p class="">Confidence: {object.confidence * 100}%</p>
							</div>
						{/each}
					</div>
				</div>
			</Tabs.Content>

			<Tabs.Content value="social-tab">
				<Toaster style="font-family: serif;" />

				<div class="flex flex-col gap-4 p-4">
					<Input
						placeholder="Type the username here. E.g.: user.bsky.social"
						bind:value={socialUsername}
						disabled={isLoadingProfile}
					/>
					<Button
						on:click={processUserProfile}
						disabled={isLoadingProfile}
						style={isLoadingProfile ? "cursor: progress;" : ""}
					>
						{#if isLoadingProfile}
							<span>Loading...</span>
						{:else}
							<span>Process</span>
						{/if}
					</Button>

					{#if Object.keys($checkProfile).length !== 0}
						<div class="mt-4 space-y-2">
							<div>
								<h2 class="font-bold">Summary</h2>
								<p class="flex flex-col gap-1">
									<span
										><b>Latest post: </b>{' ' +
											formatFns(new Date($checkProfile.texts[0].date), 'yyyy-MM-dd hh:mm a')}</span
									>
									<span
										><b>Oldest post: </b>{' ' +
											formatFns(
												new Date($checkProfile.texts[$checkProfile.texts.length - 1].date),
												'yyyy-MM-dd hh:mm a'
											)}</span
									>
									<span><b>Total: </b>{' ' + $checkProfile.texts.length}</span>
								</p>
							</div>

							<div class="h-[300px] p-4 border rounded flex flex-col gap-4">
								<h2 class="font-bold">Hate Speech Overview</h2>
								<Chart
									data={[
										{
											text: 'Hate speeach',
											value: $checkProfile.graph.sum.hateSpeech
										},
										{
											text: 'Not hate speeach',
											value: $checkProfile.graph.sum.notHateSpeech
										}
									]}
									x="value"
									c="text"
									cRange={keyColors}
									let:tooltip
								>
									<Svg center>
										<Pie let:arcs>
											{#each arcs as arc, index}
												{@const colors = keyClasses[index]}
												{@const isHighlighted = tooltip.data?.date === arc.data.date}
												{@const isFaded =
													tooltip.data != null && tooltip.data.date !== arc.data.date}
												<Group
													on:pointerenter={(e) => tooltip?.show(e, arc.data)}
													on:pointermove={(e) => tooltip?.show(e, arc.data)}
													on:pointerleave={(e) => tooltip?.hide()}
													preventTouchMove
													class={cls(isFaded && 'opacity-50')}
												>
													<Arc
														startAngle={arc.startAngle}
														endAngle={arc.endAngle}
														padAngle={arc.padAngle}
														class={colors.shape}
														_offset={isHighlighted ? 16 : 0}
														let:centroid
													>
														<Text
															value={formatUtil(
																arc.data.value /
																	($checkProfile.graph.sum.hateSpeech +
																		$checkProfile.graph.sum.notHateSpeech),
																'percent'
															)}
															x={centroid[0]}
															y={centroid[1]}
															textAnchor="middle"
															verticalAnchoc="middle"
															class={cls('text-base', colors.content)}
														/>
													</Arc>
												</Group>
											{/each}
										</Pie>
									</Svg>

									<Tooltip.Root let:data classes={{ container: 'bg-gray-400' }}>
										<Tooltip.Header>{data.text}</Tooltip.Header>
										<Tooltip.List>
											<Tooltip.Item
												label="value"
												value={data.value}
												format="integer"
												valueAlign="right"
											/>
											<Tooltip.Item
												label="percent"
												value={data.value /
													($checkProfile.graph.sum.hateSpeech +
														$checkProfile.graph.sum.notHateSpeech)}
												format="percent"
												valueAlign="right"
											/>
										</Tooltip.List>
									</Tooltip.Root>
								</Chart>
							</div>

							<div class="h-[300px] p-4 border rounded flex flex-col gap-4">
								<h2 class="font-bold">Daily Hate Speech Trend</h2>
								<Chart
									data={chartBarsData}
									x="date"
									xScale={scaleBand().padding(0.4)}
									y={['value', (d) => -d.baseline]}
									yNice={4}
									padding={{ left: 16, bottom: 24 }}
									tooltip={{ mode: 'band' }}
								>
									<Svg>
										<Axis
											placement="left"
											grid
											rule
											format={(d) => format(Math.abs(d), 'integer')}
										/>
										<Axis
											placement="bottom"
											format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
										/>
										<Bars y="value" radius={4} rounded="top" strokeWidth={1} class="fill-primary" />
										<Bars
											y={(d) => -d.baseline}
											radius={4}
											rounded="bottom"
											strokeWidth={1}
											class="fill-secondary"
										/>
										<Rule y={0} />
										<Highlight area={{ class: 'bg-gray-400' }} />
									</Svg>
									<Tooltip.Root let:data classes={{ container: 'bg-gray-400' }}>
										<Tooltip.Header
											>{format(data.date, PeriodType.Custom, {
												custom: 'eee, MMMM do'
											}) + ` - Posts:  ${data.value + data.baseline}`}</Tooltip.Header
										>
										<Tooltip.List>
											<Tooltip.Item label="Hate speech" value={data.value} />
											<Tooltip.Item label="Not hate speech" value={data.baseline} />
										</Tooltip.List>
									</Tooltip.Root>
								</Chart>
							</div>
						</div>

						<div class="mt-4 space-y-2">
							<!-- <div class="flex-1 border border-gray-300 rounded p-4 space-y-2"> -->
							{#each $checkProfile.texts as object}
								<div
									class={'p-2 border rounded ' +
										(object.is_hate_speech ? 'border-red-300' : 'border-blue-300')}
								>
									<p class="">Text: {object.text}</p>
									<p class="">Author: {object.author}</p>
									<p class="">Date: {formatFns(new Date(object.date), 'yyyy-MM-dd hh:mm a')}</p>
									<p class="">
										Result: {object.is_hate_speech ? "It's hate speech" : "It's not hate speech"}
									</p>
									<p class="">Confidence: {object.confidence * 100}%</p>
								</div>
							{/each}
							<!-- </div> -->

							<!-- <div class="flex-1 border border-gray-300 rounded p-4">
							<p>Gráficos dos dados do perfil</p>
						</div> -->
						</div>
					{/if}
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</div>
</CustomSection>
