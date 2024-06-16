export default function startupChecks() {
  if (process.env.SILENT_LOGGING && process.env.SILENT_LOGGING === "true")
    console.log = () => {};
}
