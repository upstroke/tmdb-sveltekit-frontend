<script>
	/**
	 * Rendert den statischen Footer der Anwendung.
	 *
	 * Der Footer enthält feste rechtliche Hinweise sowie einen externen
	 * Quellenlink zu IMDb.
	 *
	 * @component
	 * @remarks Diese Komponente erwartet keine Props.
	 *
	 * @example
	 * <FooterMain />
	 */
</script>

<div class="main-footer hydrated">
	<footer class="ui bottom fixed inverted menu">
		<div class="ui inverted segment">
			<div class="ui inverted secondary text menu">
				<span class="item">Conditions of Use</span>
				<span class="item">Privacy Policy</span>
				<a class="item" href="https://www.imdb.com/" rel="noopener noreferrer" target="_blank">
					Content: © by IMDb.com, Inc.
				</a>
				<a class="item" href="https://www.justwatch.com/" rel="noopener noreferrer" target="_blank">
					Streaming-Provider: © by JustWatch.
				</a>
			</div>
		</div>
	</footer>
</div>

<style lang="scss">
	.main-footer {
		footer {
			z-index: 1000;
			min-height: var(--footer-height);
			height: var(--footer-height);

			.ui.segment {
				flex: 1;
				align-self: center;
				border-radius: 0;
			}

			.ui.text.menu {
				margin: 0;
			}

			.secondary.menu {
				justify-content: center;

				> a:hover {
					text-decoration: underline;
				}
			}
		}
	}
</style>
