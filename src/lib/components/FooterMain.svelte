<script>
	/**
	 * Keine Props erforderlich.
	 *
	 * Die Komponente rendert nur den festen Footer mit statischen Links.
	 */
</script>

<div class="main-footer hydrated">
	<footer class="ui bottom fixed inverted menu">
		<div class="ui inverted segment">
			<div class="ui inverted secondary text menu">
				<a class="item" href="#">Conditions of Use</a>
				<a class="item" href="#">Privacy Policy</a>
				<a class="item" href="https://www.imdb.com/" rel="noopener noreferrer" target="_blank"
					>Content: © by IMDb.com, Inc.</a
				>
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
			}
		}
	}
</style>
