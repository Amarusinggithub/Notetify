type FallBackProps = {
	error: Error;
	resetErrorBoundary: () => void;
};

function ErrorFallback({ error, resetErrorBoundary }: FallBackProps) {
	return (
		<div id="error-page">
			<h1>Oops!</h1>
			<p>SomeThing went Wrong</p>
			<pre>
				<i>{error.message}</i>
			</pre>

			<button onClick={resetErrorBoundary}>Try again</button>
		</div>
	);
}

export default ErrorFallback;
