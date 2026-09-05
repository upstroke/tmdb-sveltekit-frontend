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
		<nav class="ui inverted segment">
			<ul class="ui inverted secondary text menu">
				<li>
					<span class="item">Conditions of Use</span>
				</li>
				<li>
					<span class="item">Privacy Policy</span>
				</li>
				<li>
					<a class="item" href="https://www.imdb.com/" rel="noopener noreferrer" target="_blank">
						Content: © by IMDb.com, Inc.
					</a>
				</li>
				<li>
					<a class="item" href="https://www.justwatch.com/" rel="noopener noreferrer" target="_blank">
						Streaming-Provider
					</a>
					<span class="justwatch">© by JustWatch</span>
				</li>
			</ul>
		</nav>
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

			ul.secondary.menu.inverted {
				margin: 0;
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				list-style: none;

				> li {
					display: flex;
					justify-content: center;
					align-items: center;

					.justwatch {
						color: #fff;
					}
				}
			}
		}
	}

	@media only screen and (max-width: 767.98px) {
		ul.secondary.menu {
			font-size: 0.80rem;
		}
	}
</style>
