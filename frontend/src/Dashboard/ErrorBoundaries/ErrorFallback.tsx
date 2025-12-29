


export default function ProviderErrorFallback() {
  return (
    <div className={"analyzer-tool-window white flex flex-column justify-center m-center h-50"}>
      <h2 className={"center"}>[ SYSTEM CRASHED ]</h2>
      <p className={"center pb-5"}>Critical error within application. Restart Necessary</p>
      <button
        onClick={() => window.location.reload()}
        className={"siem-button w-50 m-center"}
      >
        Reload
      </button>
    </div>
  );
}